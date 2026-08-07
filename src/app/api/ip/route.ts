import { type NextRequest, NextResponse } from "next/server"

import type { IpLookupResult } from "@/modules/tools/IpInfo/types"
import {
  clientIpFromHeaders,
  isIpAddress,
  isPrivateAddress
} from "@/modules/tools/IpInfo/utils/address"
import { PROVIDERS } from "@/modules/tools/IpInfo/utils/providers"

/**
 * IP geolocation, on the server.
 *
 * The tool this serves used to do all of this in the browser: fetch
 * `api.ipify.org` to learn the visitor's own address, then hand that address to
 * a geolocation provider. **Two third parties learned every visitor's IP
 * directly**, and the page had no way to swap either without shipping new
 * client code.
 *
 * Here the address comes from our own request headers — no external call at all
 * for the common case — and exactly one upstream sees it. That is also what
 * lets the page make an honest privacy claim instead of a vague one.
 *
 * `GET /api/ip`            → the caller's own address, geolocated
 * `GET /api/ip?ip=1.1.1.1` → that address, geolocated
 */

export const dynamic = "force-dynamic"

/**
 * A short in-process cache.
 *
 * ipwho.is allows 1,000 lookups a day. Most visitors open the page, see their
 * own address, and reload once or twice; without this, each of those spends a
 * request from a shared daily budget. Ten minutes is long enough to absorb that
 * and far short of the timescale on which an address changes hands.
 *
 * Deliberately a plain Map with a hard cap rather than a cache library: it
 * lives in one process, it is bounded, and an eviction costs one upstream call.
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
  // Insertion-ordered, so the first key is the oldest. One eviction per write
  // past the cap keeps the map bounded without a sweep.
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(ip, { at: Date.now(), result })
}

/** Upstreams are tried in order; the first usable answer wins. */
async function lookup(ip: string): Promise<IpLookupResult> {
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
      if (parsed) return { ok: true, data: parsed }
    } catch {
      // Timeout, DNS failure, or a body that was not JSON. Try the next one —
      // an upstream being down is not this route's failure.
    }
  }

  return {
    ok: false,
    error: { code: sawRateLimit ? "rateLimited" : "notFound" }
  }
}

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("ip")?.trim()

  const ip =
    requested || clientIpFromHeaders((name) => request.headers.get(name))

  if (!ip) {
    // No header carried an address. Local development behind no proxy, mostly.
    return NextResponse.json<IpLookupResult>(
      { ok: false, error: { code: "notFound" } },
      { status: 200 }
    )
  }

  if (!isIpAddress(ip)) {
    return NextResponse.json<IpLookupResult>(
      { ok: false, error: { code: "invalid" } },
      { status: 200 }
    )
  }

  if (isPrivateAddress(ip)) {
    // Answered here rather than upstream: handed a private address, a provider
    // returns SOMETHING — usually the requester's own location — and the page
    // would present that as a fact about the address you typed.
    return NextResponse.json<IpLookupResult>(
      { ok: false, error: { code: "private" } },
      { status: 200 }
    )
  }

  const cached = readCache(ip)
  if (cached) return NextResponse.json<IpLookupResult>(cached)

  const result = await lookup(ip)
  if (result.ok) writeCache(ip, result)

  // 200 even for a failed lookup: the request was well-formed and the answer
  // is "we could not place this address". A 4xx would make the client's error
  // handling guess whether the route or the address was the problem.
  return NextResponse.json<IpLookupResult>(result)
}
