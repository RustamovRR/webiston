"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { IpLocation, IpLookupError, IpLookupResult } from "../types"

/**
 * One lookup at a time, against our own route.
 *
 * Three things the hook this replaces got wrong, all of them the kind that only
 * show up under a slow network:
 *
 * 1. **No cancellation.** Typing an address, then another, left two requests in
 *    flight; whichever resolved LAST won, so a slow first lookup could
 *    overwrite a fast second one. Every request now carries an `AbortSignal`
 *    and the previous one is aborted.
 * 2. **No unmount guard.** A response arriving after navigation called
 *    `setState` on a dead component.
 * 3. **Errors were strings in Uzbek**, hardcoded in the hook, so `/en` showed
 *    them too. The route returns an error CODE and the page translates it.
 */
export function useIpLookup() {
  const [data, setData] = useState<IpLocation | null>(null)
  const [error, setError] = useState<IpLookupError | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const inFlight = useRef<AbortController | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      inFlight.current?.abort()
    }
  }, [])

  const lookup = useCallback(async (ip?: string) => {
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const query = ip ? `?ip=${encodeURIComponent(ip)}` : ""
      const response = await fetch(`/api/ip${query}`, {
        signal: controller.signal
      })
      const result: IpLookupResult = await response.json()

      if (!mounted.current || controller.signal.aborted) return

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

  return { data, error, isLoading, lookup }
}
