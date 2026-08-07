"use client"

import { useEffect, useState } from "react"

import type { ImageProbe } from "../types"
import { isAbsoluteHttpUrl } from "../utils/validate"

/**
 * What the image URL actually resolves to, measured in the browser.
 *
 * This is the answer to the question people open an OG tool with — "why is my
 * picture not showing" — and it needs no server: an `Image()` either loads or
 * it does not, and if it loads it reports its own dimensions. That covers the
 * three real causes at once. The file is missing or the host refuses hotlinks
 * (`error`), the URL is relative so it never had a chance, or it loads and is
 * simply the wrong shape and gets cropped.
 *
 * Debounced, because the URL field is typed into character by character and
 * every keystroke would otherwise start a request for a partial address.
 */
export function useImageProbe(url: string, delay = 400): ImageProbe {
  const [probe, setProbe] = useState<ImageProbe>({ status: "idle" })

  useEffect(() => {
    const trimmed = url.trim()
    if (!trimmed || !isAbsoluteHttpUrl(trimmed)) {
      setProbe({ status: "idle" })
      return
    }

    setProbe({ status: "loading" })
    let cancelled = false

    const timer = setTimeout(() => {
      const image = new Image()
      image.onload = () => {
        if (cancelled) return
        // An SVG with no intrinsic size reports 0 × 0. That is "we cannot
        // measure this", not "this is smaller than 200 pixels" — reporting it
        // as a size would have the checks tell an SVG author their image is
        // too small when it is resolution-independent.
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          setProbe({ status: "idle" })
          return
        }
        setProbe({
          status: "ready",
          width: image.naturalWidth,
          height: image.naturalHeight
        })
      }
      image.onerror = () => {
        if (!cancelled) setProbe({ status: "error" })
      }
      image.src = trimmed
    }, delay)

    // The cleanup covers both the pending timer and a load already in flight,
    // so a result for an address the visitor has moved on from can never
    // arrive after the one they are waiting for.
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [url, delay])

  return probe
}
