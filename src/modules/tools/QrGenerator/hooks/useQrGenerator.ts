"use client"

/**
 * The QR code, drawn by us, in this browser.
 *
 * Two things this replaces, in order of how much they mattered:
 *
 * 1. Every code used to be FETCHED from `api.qrserver.com`, so the payload —
 *    a link, a phone number, a vCard, a WiFi password — was sent to a third
 *    party on every keystroke.
 * 2. Then it was drawn by `qr-code-styling`, which fixed the privacy problem
 *    but hardcodes its six module shapes in a private `switch`. The ceiling on
 *    how this tool could look was set by a dependency.
 *
 * Now the only dependency is `qrcode-generator` — MIT, ~2M weekly downloads —
 * which answers one question, `isDark(row, col)`. Everything visual is ours.
 */

import { useCallback, useMemo, useState } from "react"

import {
  DEFAULT_ERROR_LEVEL,
  ERROR_LEVEL_WITH_LOGO,
  RENDER_SIZE
} from "../constants"
import { useQrDraftStore } from "../stores/qrDraftStore"
import type { QrDownloadFormat } from "../types"
import { checkScannability } from "../utils/contrast"
import { downloadQr } from "../utils/export"
import { buildMatrix } from "../utils/matrix"
import { detectInputType } from "../utils/qr-input"
import { buildDocument, buildQrModel } from "../utils/render"

export function useQrGenerator() {
  // Draft lives in a module-scope store so a locale switch — which remounts
  // this whole tree — does not throw the visitor's work away. See the store.
  const value = useQrDraftStore((state) => state.value)
  const style = useQrDraftStore((state) => state.style)
  const setValue = useQrDraftStore((state) => state.setValue)
  const updateStyle = useQrDraftStore((state) => state.updateStyle)
  const reset = useQrDraftStore((state) => state.reset)

  // Export state is genuinely per-mount: an in-flight download cannot survive
  // the component that started it, and a stale error should not either.
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  // A logo punches a hole in the data area, and level H is the only one with
  // enough redundancy to survive it. Derived, not asked.
  const errorLevel = style.logo ? ERROR_LEVEL_WITH_LOGO : DEFAULT_ERROR_LEVEL

  const hasCode = value.trim().length > 0

  /**
   * Encoding and painting are memoised SEPARATELY, and the split is worth real
   * milliseconds rather than being tidiness.
   *
   * Measured on a 250-character vCard (61x61 modules): encoding costs 2.563 ms
   * and painting 0.945 ms. Encoding depends only on the text, so keeping them
   * in one memo meant every frame of a colour drag, every slider step and
   * every preset click paid the 2.563 ms again for a symbol that had not
   * changed. Split, a style change costs 26% of what it used to (re-measured:
   * 0.887 ms against 3.409 ms).
   */
  const matrix = useMemo(
    () => (hasCode ? buildMatrix(value, errorLevel) : null),
    [value, errorLevel, hasCode]
  )

  const document = useMemo(() => {
    if (!matrix) return null
    const model = buildQrModel({
      matrix,
      style,
      extent: RENDER_SIZE,
      quietZone: style.quietZone
    })
    return buildDocument({
      model,
      frameId: style.frame,
      label: style.frameLabel,
      style
    })
  }, [matrix, style])

  const download = useCallback(
    async (format: QrDownloadFormat) => {
      if (!document) return
      setIsExporting(true)
      setExportError(false)
      try {
        await downloadQr(document, format, "webiston-qr")
      } catch {
        setExportError(true)
      } finally {
        setIsExporting(false)
      }
    },
    [document]
  )

  return {
    value,
    setValue,
    style,
    updateStyle,
    reset,
    document,
    download,
    isExporting,
    exportError,
    errorLevel,
    hasCode,
    /** Detected from the payload, for the badge above the field. */
    detectedType: detectInputType(value),
    /** Whether the current colours will survive a phone camera. */
    scan: checkScannability(
      style.foregroundColor,
      style.backgroundColor,
      style.gradientColor
    )
  }
}

export type UseQrGeneratorResult = ReturnType<typeof useQrGenerator>
