"use client"

import { type RefObject, useCallback, useEffect } from "react"

import type { CodeFontId, ExportFormatId, ExportScale } from "../constants"
import type { SnapshotOptions } from "../types"
import { copySnapshotToClipboard, downloadSnapshot } from "../utils/export"
import { decodeSnapshot, encodeSnapshot } from "../utils/share-url"
import type { RestorableSettings } from "./useSnapshotSettings"

/**
 * The three ways a picture leaves this page: a file, the clipboard, a link.
 *
 * All three report success rather than throwing. An `onClick={download}` hands
 * React a promise nobody awaits, so a rejection from `toBlob` — which is
 * exactly what an oversized canvas produces — became an unhandled rejection in
 * the console and *nothing at all* on screen. Returning a boolean is what lets
 * the caller show an error instead of appearing to work.
 */

interface UseSnapshotSharingInput {
  canvasRef: RefObject<HTMLCanvasElement | null>
  code: string
  language: string
  theme: string
  font: CodeFontId
  scale: ExportScale
  options: SnapshotOptions
  exportFormat: ExportFormatId
  restore: (shared: RestorableSettings) => void
  onError: (error: string | null) => void
}

interface UseSnapshotSharing {
  download: () => Promise<boolean>
  copy: () => Promise<boolean>
  copyLink: () => Promise<boolean>
}

export function useSnapshotSharing({
  canvasRef,
  code,
  language,
  theme,
  font,
  scale,
  options,
  exportFormat,
  restore,
  onError
}: UseSnapshotSharingInput): UseSnapshotSharing {
  /**
   * Reopen a shared picture, once, on arrival.
   *
   * Read from the HASH: it never reaches the server, so a few thousand
   * characters of source cannot produce a 414 from an edge nobody can
   * reproduce locally, and Next's router does not re-render on it.
   *
   * A link that does not decode is IGNORED rather than reported. Junk after
   * the `#` is far more often a stray character in a chat client than a
   * message worth showing, and the visitor still gets a working tool.
   */
  useEffect(() => {
    const fragment = window.location.hash.slice(1)
    if (!fragment) return

    let cancelled = false
    decodeSnapshot(fragment)
      .then((shared) => {
        if (shared && !cancelled) restore(shared)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [restore])

  const download = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return false
    try {
      await downloadSnapshot(canvas, options.title, exportFormat)
      return true
    } catch {
      onError("export")
      return false
    }
  }, [canvasRef, options.title, exportFormat, onError])

  const copy = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return false
    try {
      await copySnapshotToClipboard(canvas)
      return true
    } catch {
      return false
    }
  }, [canvasRef])

  /**
   * Build the link, put it on the clipboard, and show it in the address bar.
   *
   * Written ON DEMAND, not on every keystroke. A hash that rewrites itself as
   * you type fills the address bar with noise for a value nobody asked for
   * yet, and the button has to produce a fresh link anyway.
   *
   * `replaceState`, never `pushState`: pressing a copy button is not
   * navigation, and stacking history entries would turn the back button into
   * an undo nobody expects.
   */
  const copyLink = useCallback(async () => {
    try {
      const fragment = await encodeSnapshot({
        code,
        language,
        theme,
        font,
        scale,
        options
      })
      const url = `${window.location.origin}${window.location.pathname}#${fragment}`
      await navigator.clipboard.writeText(url)
      window.history.replaceState(null, "", `#${fragment}`)
      return true
    } catch {
      onError("link")
      return false
    }
  }, [code, language, theme, font, scale, options, onError])

  return { download, copy, copyLink }
}
