"use client"

import { useCallback, useEffect, useState } from "react"

import type { ScreenMetrics } from "../types"
import { metricsToJson, readMetrics } from "../utils/metrics"

/**
 * The live numbers, and the two actions that change them.
 *
 * Three things the hook this replaces got wrong:
 *
 * 1. **The scroll listener.** It called `setState` on every scroll event,
 *    unthrottled, to store `scrollX`/`scrollY` — values that have nothing to
 *    do with screen size and were rendered in a panel that only appeared once
 *    you had already scrolled past them.
 * 2. **Resize was equally unthrottled.** Dragging a window edge fires `resize`
 *    on every frame, and each one triggered a full re-render synchronously.
 *    Now a frame is requested and coalesced, so a drag produces one update per
 *    paint no matter how many events arrive.
 * 3. **It spoke Uzbek.** Success and error strings were hardcoded in the hook
 *    (`"Ekran ma'lumotlari yangilandi"`), so `/en` showed them too.
 */
export function useScreenMetrics() {
  const [metrics, setMetrics] = useState<ScreenMetrics | null>(null)

  const refresh = useCallback(() => {
    setMetrics(readMetrics())
  }, [])

  useEffect(() => {
    let frame = 0

    // Coalesce a burst of events into one read per animation frame. `resize`
    // during a window drag arrives faster than React can render.
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setMetrics(readMetrics())
      })
    }

    setMetrics(readMetrics())

    window.addEventListener("resize", schedule)
    // Not covered by `resize` on every engine — iOS Safari fires only this.
    window.addEventListener("orientationchange", schedule)
    document.addEventListener("fullscreenchange", schedule)
    // Moving a window between a Retina and a non-Retina monitor changes
    // `devicePixelRatio` and fires no event at all. A resolution media query
    // does change, and that is observable.
    const dpr = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    )
    dpr.addEventListener("change", schedule)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("orientationchange", schedule)
      document.removeEventListener("fullscreenchange", schedule)
      dpr.removeEventListener("change", schedule)
    }
  }, [])

  /**
   * Fullscreen is the one measurement you can only take by changing the thing
   * being measured — so the tool offers the switch rather than describing it.
   */
  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Denied by the browser (no user gesture, or an iOS Safari that has
      // never supported it). The button stays; nothing else changes.
    }
  }, [])

  const json = metrics ? metricsToJson(metrics) : ""

  const download = useCallback(() => {
    if (!json) return
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "screen-resolution.json"
    link.click()
    URL.revokeObjectURL(url)
  }, [json])

  return { metrics, json, refresh, toggleFullscreen, download }
}
