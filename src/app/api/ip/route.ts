import { type NextRequest, NextResponse } from "next/server"

import type { IpLocation, IpLookupResult } from "@/modules/tools/IpInfo/types"
import {
  clientIpFromHeaders,
  isIpAddress,
  isPrivateAddress
} from "@/modules/tools/IpInfo/utils/address"
import {
  locationFromEdge,
  mergeLocations,
  needsEnrichment
} from "@/modules/tools/IpInfo/utils/edge-geo"
import { PROVIDERS } from "@/modules/tools/IpInfo/utils/providers"

/**
 * IP geolocation, answered as cheaply as it can honestly be answered.
 *
 * Three sources, in order of what they cost:
 *
 * 1. **Vercel's edge headers** — free, unlimited, no upstream call, no third
 *    party. Covers the visitor's own address, which is why nearly everyone
 *    opens this page. Gives location but not the network layer.
 * 2. **ipwho.is** — fills in ASN, ISP, organisation and domain, and answers
 *    entirely on its own when somebody looks up a different address.
 * 3. **freeipapi.com** — the fallback when the primary is out of quota.
 *
 * That ordering is the point. ipwho.is allows **1,000 lookups a day per calling
 * IP**, and from a server that is 1,000 for the whole site. Answering the
 * common case from headers means the quota is spent only on the rare one.
 *
 * `GET /api/ip`            → the caller's own address
 * `GET /api/ip?ip=1.1.1.1` → that address
 */

export const dynamic = "force-dynamic"

/**
 * A short in-process cache.
 *
 * Honest about what this is worth: on serverless each instance holds its own
 * Map and instances are short-lived, so this absorbs a reload and a double
 * click, not a traffic pattern. It is kept because it costs nothing and the
 * alternative — a shared store — is infrastructure this tool does not justify.
 */
const CACHE_TTL_MS = 10 * 60 * 1000
const CACHE_MAX_ENTRIES = 500
const cache = new Map<string, { at: number; result: IpLookupResult }>()

function readCache(ip: string): IpLookupResult | null {
  const hit = cache.get(ip)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(ip)
    return null
  }
  return hit.result
}

function writeCache(ip: string, result: IpLookupResult): void {
  // Insertion-ordered, so the first key is the oldest.
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(ip, { at: Date.now(), result })
}

/**
 * Per-caller throttle on the upstream path.
 *
 * Without it one script looping `?ip=1.2.3.N` burns a **shared** 1,000/day
 * budget in about two minutes and every other visitor gets an error. This was
 * missing from the first version of this route and is the one hole in it that
 * an attacker rather than a bug would find.
 *
 * Only lookups that reach an upstream are counted — a visitor asking for their
 * own address never touches this, because Vercel's headers answer it.
 */
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX_LOOKUPS = 20
const rate = new Map<string, { at: number; count: number }>()

function overRateLimit(caller: string): boolean {
  const now = Date.now()
  const entry = rate.get(caller)

  if (!entry || now - entry.at > RATE_WINDOW_MS) {
    rate.set(caller, { at: now, count: 1 })
    // Bounded the same way the cache is; a sweep would be more code for the
    // same effect at this size.
    if (rate.size > CACHE_MAX_ENTRIES) {
      const oldest = rate.keys().next().value
      if (oldest !== undefined) rate.delete(oldest)
    }
    return false
  }

  entry.count += 1
  return entry.count > RATE_MAX_LOOKUPS
}

/** Upstreams are tried in order; the first usable answer wins. */
async function askProviders(ip: string): Promise<{
  location: IpLocation | null
  sawRateLimit: boolean
}> {
  let sawRateLimit = false

  for (const provider of PROVIDERS) {
    try {
      const response = await fetch(provider.url(ip), {
        // Never let a slow upstream hold a request open indefinitely.
        signal: AbortSignal.timeout(6000),
        headers: { accept: "application/json" },
        cache: "no-store"
      })

      if (response.status === 429) {
        sawRateLimit = true
        continue
      }
      if (!response.ok) continue

      const parsed = provider.parse(await response.json())
      if (parsed) return { location: parsed, sawRateLimit }
    } catch {
      // Timeout, DNS failure, or a body that was not JSON. Try the next one —
      // an upstream being down is not this route's failure.
    }
  }

  return { location: null, sawRateLimit }
}

export async function GET(request: NextRequest) {
  const header = (name: string) => request.headers.get(name)
  const requested = request.nextUrl.searchParams.get("ip")?.trim()
  const caller = clientIpFromHeaders(header) ?? "anonymous"

  // An explicit `?ip=` wins; otherwise the caller's own address, if a header
  // carried one. Parenthesised deliberately — without them `||` binds tighter
  // than `?:` and the expression reads as `(requested || isAnonymous)`, which
  // is a different question with a plausible-looking answer.
  const ip = requested || (caller === "anonymous" ? null : caller)

  if (!ip) {
    // No header carried an address and none was asked for.
    return NextResponse.json<IpLookupResult>({
      ok: false,
      error: { code: "noPublicIp" }
    })
  }

  // The caller's OWN address turned out to be a loopback or LAN address, which
  // is what `next dev` on localhost hands us and what any reverse proxy that
  // forgets `x-forwarded-for` hands us in production. The server cannot
  // discover the visitor's public address from here — asking an upstream would
  // report the SERVER's address — so the client is told to find it and come
  // back. Reported before the `private` branch so it is never confused with a
  // private address the visitor deliberately typed.
  if (!requested && isPrivateAddress(ip)) {
    return NextResponse.json<IpLookupResult>({
      ok: false,
      error: { code: "noPublicIp" }
    })
  }

  if (!isIpAddress(ip)) {
    return NextResponse.json<IpLookupResult>({
      ok: false,
      error: { code: "invalid" }
    })
  }

  if (isPrivateAddress(ip)) {
    // Answered here rather than upstream: handed a private address, a provider
    // returns SOMETHING — usually the requester's own location — and the page
    // would present that as a fact about the address you typed.
    return NextResponse.json<IpLookupResult>({
      ok: false,
      error: { code: "private" }
    })
  }

  const cached = readCache(ip)
  if (cached) return NextResponse.json<IpLookupResult>(cached)

  // Vercel's headers describe the CALLER, so they only answer when the address
  // asked about is the caller's own.
  const edge = ip === caller ? locationFromEdge(ip, header) : null

  // An edge answer that already has everything is served without touching an
  // upstream at all — the common case, and the reason the quota holds.
  if (edge && !needsEnrichment(edge)) {
    const result: IpLookupResult = { ok: true, data: edge }
    writeCache(ip, result)
    return NextResponse.json<IpLookupResult>(result)
  }

  if (overRateLimit(caller)) {
    // An edge answer without the network layer still beats an error.
    if (edge) {
      return NextResponse.json<IpLookupResult>({ ok: true, data: edge })
    }
    return NextResponse.json<IpLookupResult>({
      ok: false,
      error: { code: "rateLimited" }
    })
  }

  const { location, sawRateLimit } = await askProviders(ip)

  if (!location) {
    // Degrade rather than fail: if the edge placed the address, show that and
    // leave the network rows reading "not reported".
    if (edge) {
      const result: IpLookupResult = { ok: true, data: edge }
      writeCache(ip, result)
      return NextResponse.json<IpLookupResult>(result)
    }
    return NextResponse.json<IpLookupResult>({
      ok: false,
      error: { code: sawRateLimit ? "rateLimited" : "notFound" }
    })
  }

  const data = edge ? mergeLocations(edge, location) : location
  const result: IpLookupResult = { ok: true, data }
  writeCache(ip, result)

  // 200 even for a failed lookup: the request was well-formed and the answer
  // is "we could not place this address". A 4xx would make the client's error
  // handling guess whether the route or the address was the problem.
  return NextResponse.json<IpLookupResult>(result)
}
