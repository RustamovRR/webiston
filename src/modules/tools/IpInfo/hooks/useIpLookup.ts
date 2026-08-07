"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { IpLocation, IpLookupError, IpLookupResult } from "../types"

/**
 * One lookup at a time, cached and deduplicated on the client.
 *
 * **Why not TanStack Query.** It is the right tool when an app has many
 * queries sharing a cache, background refetching, mutations and devtools. This
 * tool has ONE query, one consumer and no mutations — importing ~13 KB and a
 * provider at the app root to get three behaviours costs more than writing
 * them. Those three, which is all that was actually missing:
 *
 * 1. **A result cache.** Pressing "Look up" twice on the same address sent two
 *    requests. The route already cached server-side, so the second one was
 *    answered instantly — but it still crossed the network, still spent a
 *    function invocation, and still flashed a loading state for an answer that
 *    had not changed.
 * 2. **In-flight deduplication.** Two clicks a few hundred milliseconds apart
 *    started two requests. The second now joins the first.
 * 3. **A force path.** Cache-by-default is wrong for the ONE case where a
 *    repeat genuinely means something: "my address again" after connecting a
 *    VPN. `{ force: true }` skips the cache; nothing else does.
 *
 * The cache is module-scope so it survives a locale switch remounting the
 * tree, which is the same reason the draft stores in this suite are.
 *
 * Three things the hook this replaces got wrong, all of them the kind that
 * only show up on a slow network:
 *
 * - **No cancellation.** Typing one address then another left two requests in
 *   flight; whichever resolved LAST won, so a slow first lookup could overwrite
 *   a fast second one.
 * - **No unmount guard.** A response arriving after navigation called
 *   `setState` on a dead component.
 * - **Errors were hardcoded Uzbek strings**, so `/en` showed them too.
 */

/**
 * Five minutes.
 *
 * Shorter than the route's ten so the client never serves an answer the server
 * would have refreshed, and long enough to cover the actual pattern: open the
 * page, try a couple of examples, come back to your own address.
 */
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX_ENTRIES = 50

/** Resolved answers, keyed by the address asked about. */
const cache = new Map<string, { at: number; result: IpLookupResult }>()

/** Requests currently in flight, so a second caller joins rather than starts. */
const inFlightByKey = new Map<string, Promise<IpLookupResult>>()

/** `undefined` means "the caller's own address", which the route resolves. */
const keyFor = (ip?: string) => ip ?? "@self"

/**
 * Empties both maps. For tests only.
 *
 * Module scope is what makes the cache survive a locale switch remounting the
 * tree — and it is also what makes one test's answer leak into the next, so
 * the suite would pass or fail depending on the order it happened to run in.
 * Exposing the reset is cheaper and more honest than reaching for
 * `vi.resetModules()` around every case.
 */
export function resetLookupCache(): void {
  cache.clear()
  inFlightByKey.clear()
}

function readCache(key: string): IpLookupResult | null {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.result
}

function writeCache(key: string, result: IpLookupResult): void {
  // Failures are not cached: a rate limit clears and a network blip passes, so
  // remembering either would keep showing an error after the cause is gone.
  if (!result.ok) return

  // Insertion-ordered, so the first key is the oldest.
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, { at: Date.now(), result })
}

/**
 * Last resort: ask the browser what its own public address is.
 *
 * Only runs when the route answers `noPublicIp` — meaning our own request
 * headers carried a loopback or LAN address. That happens in `next dev` on
 * localhost, and in production behind any reverse proxy that forgets
 * `x-forwarded-for`. The server genuinely cannot resolve it from there: asking
 * an upstream would report the SERVER's address, not the visitor's.
 *
 * ipify because it echoes an address and nothing else — using the geolocation
 * provider here would spend its quota and hand it a second look at the
 * visitor. The address is then sent back through our own route, so the
 * geolocation still happens in one place with one parser.
 *
 * This is the one path where a third party sees a visitor's address, and it
 * only opens when our own infrastructure could not answer.
 */
async function discoverOwnIp(signal: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch("https://api.ipify.org?format=json", {
      signal
    })
    if (!response.ok) return null
    const payload = (await response.json()) as { ip?: unknown }
    return typeof payload.ip === "string" && payload.ip ? payload.ip : null
  } catch {
    return null
  }
}

/** Shared by every caller asking the same question at the same moment. */
function fetchOnce(key: string, ip: string | undefined, signal: AbortSignal) {
  const existing = inFlightByKey.get(key)
  if (existing) return existing

  const query = ip ? `?ip=${encodeURIComponent(ip)}` : ""
  const promise = fetch(`/api/ip${query}`, { signal })
    .then((response) => response.json() as Promise<IpLookupResult>)
    .finally(() => {
      inFlightByKey.delete(key)
    })

  inFlightByKey.set(key, promise)
  return promise
}

export interface LookupOptions {
  /** Skip the cache. The reason to press "my address" twice is a VPN. */
  force?: boolean
}

export function useIpLookup() {
  const [data, setData] = useState<IpLocation | null>(null)
  const [error, setError] = useState<IpLookupError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  /** True when the answer on screen came from the cache rather than the wire. */
  const [isCached, setIsCached] = useState(false)

  const pending = useRef<AbortController | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      pending.current?.abort()
    }
  }, [])

  const lookup = useCallback(async (ip?: string, options?: LookupOptions) => {
    const key = keyFor(ip)

    if (!options?.force) {
      const cached = readCache(key)
      if (cached?.ok) {
        // Synchronous, with no loading state at all: the answer has not
        // changed, so neither should the page.
        setData(cached.data)
        setError(null)
        setIsLoading(false)
        setIsCached(true)
        return
      }
    }

    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller

    setIsLoading(true)
    setError(null)
    setIsCached(false)

    try {
      let result = await fetchOnce(key, ip, controller.signal)

      // Our headers had no public address of their own. Find it in the browser
      // and ask again — the geolocation still runs in one place.
      if (!result.ok && result.error.code === "noPublicIp" && !ip) {
        const discovered = await discoverOwnIp(controller.signal)
        if (discovered) {
          result = await fetchOnce(
            keyFor(discovered),
            discovered,
            controller.signal
          )
          // Cached under BOTH keys: the visitor asked "what is mine", and
          // pressing it again must not repeat the discovery round trip.
          writeCache(keyFor(discovered), result)
        }
      }

      if (!mounted.current || controller.signal.aborted) return

      writeCache(key, result)

      if (result.ok) {
        setData(result.data)
      } else {
        setError(result.error)
        // The previous answer is cleared: leaving it on screen next to a new
        // error reads as though the error applies to the address shown.
        setData(null)
      }
    } catch (caught) {
      // An abort is this hook superseding itself, not a failure to report.
      if (caught instanceof Error && caught.name === "AbortError") return
      if (mounted.current) {
        setError({ code: "network" })
        setData(null)
      }
    } finally {
      if (mounted.current && !controller.signal.aborted) setIsLoading(false)
    }
  }, [])

  // The visitor's own address, without them asking — it is the question the
  // page exists to answer, and making them press a button first would be
  // ceremony.
  useEffect(() => {
    void lookup()
  }, [lookup])

  return { data, error, isLoading, isCached, lookup }
}
