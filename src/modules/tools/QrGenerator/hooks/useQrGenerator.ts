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
  DEFAULT_STYLE,
  ERROR_LEVEL_WITH_LOGO,
  RENDER_SIZE
} from "../constants"
import type { QrDownloadFormat, QrStyle } from "../types"
import { checkScannability } from "../utils/contrast"
import { downloadQr } from "../utils/export"
import { detectInputType } from "../utils/qr-input"
import { buildDocument, buildQrModel } from "../utils/render"

export function useQrGenerator() {
  const [value, setValue] = useState("")
  const [style, setStyle] = useState<QrStyle>(DEFAULT_STYLE)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  // A logo punches a hole in the data area, and level H is the only one with
  // enough redundancy to survive it. Derived, not asked.
  const errorLevel = style.logo ? ERROR_LEVEL_WITH_LOGO : DEFAULT_ERROR_LEVEL

  const hasCode = value.trim().length > 0

  // React Compiler memoises this; it re-runs only when the text or the style
  // changes, and drawing is a few hundred string concatenations — fast enough
  // that no debounce is needed between a keystroke and the preview.
  const document = useMemo(() => {
    if (!hasCode) return null
    const model = buildQrModel({
      text: value,
      level: errorLevel,
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
  }, [value, style, errorLevel, hasCode])

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

  const updateStyle = useCallback(
    (patch: Partial<QrStyle>) => setStyle((prev) => ({ ...prev, ...patch })),
    []
  )

  const reset = useCallback(() => {
    setValue("")
    setStyle(DEFAULT_STYLE)
  }, [])

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
    scan: checkScannability(style.foregroundColor, style.backgroundColor)
  }
}

export type UseQrGeneratorResult = ReturnType<typeof useQrGenerator>
