"use client"

import { useCallback, useEffect, useState } from "react"

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
  const [hints, setHints] = useState<HighEntropyHints>({})

  const refresh = useCallback((next: HighEntropyHints) => {
    setGroups(readGroups(next))
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
    refresh({})

    // The high-entropy hints are async, so they arrive a tick later and the
    // snapshot is rebuilt with them. Without them the OS row still answers,
    // just less precisely — which is the honest state on Firefox and Safari.
    void readHints().then((resolved) => {
      if (cancelled) return
      setHints(resolved)
      refresh(resolved)
    })

    return () => {
      cancelled = true
    }
  }, [refresh])

  useEffect(() => {
    if (!groups) return

    const reread = () => refresh(hints)
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    window.addEventListener("online", reread)
    window.addEventListener("offline", reread)
    window.addEventListener("resize", reread)
    window.addEventListener("orientationchange", reread)
    darkQuery.addEventListener("change", reread)
    motionQuery.addEventListener("change", reread)

    return () => {
      window.removeEventListener("online", reread)
      window.removeEventListener("offline", reread)
      window.removeEventListener("resize", reread)
      window.removeEventListener("orientationchange", reread)
      darkQuery.removeEventListener("change", reread)
      motionQuery.removeEventListener("change", reread)
    }
    // `groups` only decides whether there is anything to keep up to date; the
    // listeners themselves read fresh values every time they fire.
  }, [groups, hints, refresh])

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

  return {
    groups,
    json,
    refresh: useCallback(() => refresh(hints), [refresh, hints]),
    download
  }
}
