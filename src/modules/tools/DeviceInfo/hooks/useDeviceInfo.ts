"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { InfoGroup } from "../types"
import {
  groupsToJson,
  type HighEntropyHints,
  readGroups,
  readHints
} from "../utils/snapshot"

/**
 * The snapshot, and the parts of it that change while you look at it.
 *
 * What this replaces burned CPU on every visit: its effect depended on
 * `deviceInfo` while calling `detectDevice()`, which wrote a fresh object into
 * it — detect → new state → effect re-runs → detect, until React gave up with
 * "Maximum update depth exceeded". That loop was fixed in the consistency
 * sweep; what is new here is that the LIVE values are live for real.
 *
 * Four things move without a page load, and each has an event that announces
 * it: going offline, rotating the device, resizing the window, and switching
 * the system between light and dark. A page that reports them once and then
 * lies until you press refresh is worse than one that does not report them.
 */
export function useDeviceInfo() {
  const [groups, setGroups] = useState<InfoGroup[] | null>(null)

  /**
   * The hints live in a ref, not in state.
   *
   * They are an INPUT to the next read, not something the page renders, and
   * putting them in state made the listener effect below depend on them — so
   * every re-read tore down all six subscriptions and added them again. During
   * a window drag that is a subscribe/unsubscribe pair per animation frame.
   */
  const hints = useRef<HighEntropyHints>({})

  const refresh = useCallback(() => {
    setGroups(readGroups(hints.current))
  }, [])

  /**
   * Read after mount, never during render.
   *
   * Every value here comes from `navigator`, `screen` or `matchMedia`, none of
   * which exist on the server — and a value read during render would differ
   * between the server's HTML and the client's, which is a hydration mismatch
   * by construction.
   */
  useEffect(() => {
    let cancelled = false
    refresh()

    // The high-entropy hints are async, so they arrive a tick later and the
    // snapshot is rebuilt with them. Without them the OS row still answers,
    // just less precisely — which is the honest state on Firefox and Safari.
    void readHints().then((resolved) => {
      if (cancelled) return
      hints.current = resolved
      refresh()
    })

    return () => {
      cancelled = true
    }
  }, [refresh])

  /**
   * Subscribed once, for the lifetime of the page.
   *
   * `refresh` is stable and reads fresh values every time it fires, so there
   * is nothing here to re-subscribe for. The Network Information change event
   * is the one that was missing: switching from wifi to 4G, or the browser
   * downgrading its estimate, changes three rows and fires no window event —
   * without this the network group was stale until the visitor pressed
   * refresh, which is exactly the lie the other four listeners exist to avoid.
   */
  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const connection = (navigator as Navigator & { connection?: EventTarget })
      .connection

    window.addEventListener("online", refresh)
    window.addEventListener("offline", refresh)
    window.addEventListener("resize", refresh)
    window.addEventListener("orientationchange", refresh)
    darkQuery.addEventListener("change", refresh)
    motionQuery.addEventListener("change", refresh)
    connection?.addEventListener("change", refresh)

    return () => {
      window.removeEventListener("online", refresh)
      window.removeEventListener("offline", refresh)
      window.removeEventListener("resize", refresh)
      window.removeEventListener("orientationchange", refresh)
      darkQuery.removeEventListener("change", refresh)
      motionQuery.removeEventListener("change", refresh)
      connection?.removeEventListener("change", refresh)
    }
  }, [refresh])

  const json = groups ? groupsToJson(groups) : ""

  const download = useCallback(() => {
    if (!json) return
    // The data, and nothing else — what this replaces added a timestamp, a
    // `generated_by` line and the page's own URL to a file about the device.
    const blob = new Blob([`${json}\n`], {
      type: "application/json;charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "device-info.json"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [json])

  return { groups, json, refresh, download }
}
