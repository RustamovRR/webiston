"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { COPIED_FEEDBACK_MS } from "../constants"

/**
 * Copy something, then say so for two seconds — this tool's main verb, once.
 *
 * The same eight lines were written out five times (`CopySwatch`,
 * `ColorFormatItem`, `ColorSummary`, `ExportPanel`, `GradientGenerator`) and
 * every copy carried the same two defects:
 *
 * - **The timer outlived its component.** Palette swatches are keyed by colour
 *   and the palette is derived FROM the colour, so clicking one unmounts most
 *   of the grid — with a `setTimeout` still pending against it.
 * - **Nothing reset the flag when the value changed under it.** The scale keys
 *   its swatches by SHADE, so `500` is one component instance across every
 *   colour the visitor picks. Copy step 500, change the colour, and for the
 *   rest of the two seconds the badge claims a hex that was never copied.
 *
 * `resetKey` is the value the acknowledgement is ABOUT. When it changes the
 * acknowledgement stops being true, so it is dropped in the render phase —
 * before the browser paints a frame carrying the stale badge.
 */

/** `true` for a component with one copy target; a name when it has several. */
type CopyKey = string | true

export function useCopyFeedback(resetKey?: unknown) {
  const [copied, setCopied] = useState<CopyKey | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [lastKey, setLastKey] = useState<unknown>(resetKey)
  if (lastKey !== resetKey) {
    setLastKey(resetKey)
    if (copied !== null) setCopied(null)
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = useCallback(async (text: string, key: CopyKey = true) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard refused (permissions, insecure context, no user gesture):
      // no acknowledgement is the honest signal — claiming "copied" about a
      // write that failed is worse than staying quiet.
      return false
    }
    setCopied(key)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), COPIED_FEEDBACK_MS)
    return true
  }, [])

  return { copied, copy }
}
