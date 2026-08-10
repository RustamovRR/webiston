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
import { isStyleDirty, useQrDraftStore } from "../stores/qrDraftStore"
import type { QrDownloadFormat } from "../types"
import { checkScannability } from "../utils/contrast"
import { downloadQr } from "../utils/export"
import { versionForLogo, versionOfSize } from "../utils/logo-fit"
import { buildMatrix } from "../utils/matrix"
import { detectInputType } from "../utils/qr-input"
import { buildDocument, buildQrModel } from "../utils/render"
import { buildWifiPayload } from "../utils/wifi"

export function useQrGenerator() {
  // Draft lives in a module-scope store so a locale switch — which remounts
  // this whole tree — does not throw the visitor's work away. See the store.
  const value = useQrDraftStore((state) => state.value)
  const mode = useQrDraftStore((state) => state.mode)
  const wifi = useQrDraftStore((state) => state.wifi)
  const style = useQrDraftStore((state) => state.style)
  const setValue = useQrDraftStore((state) => state.setValue)
  const setMode = useQrDraftStore((state) => state.setMode)
  const updateWifi = useQrDraftStore((state) => state.updateWifi)
  const updateStyle = useQrDraftStore((state) => state.updateStyle)
  const resetStyle = useQrDraftStore((state) => state.resetStyle)
  const reset = useQrDraftStore((state) => state.reset)

  // What actually gets ENCODED. The WiFi form is a compiler for the WIFI:
  // format; the text box is everything else. Both feed one pipeline, so the
  // badge, the contrast check and the export know nothing about modes.
  const payload = mode === "wifi" ? buildWifiPayload(wifi) : value

  // Export state is genuinely per-mount: an in-flight download cannot survive
  // the component that started it, and a stale error should not either.
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  // A logo punches a hole in the data area, so it gets the highest redundancy.
  // Derived, not asked — but NOT sufficient on its own: this comment used to
  // stop at "level H survives it", and that is precisely the reasoning that
  // shipped a broken feature. H protects the data codewords; it does nothing
  // for the finders, the timing patterns or the format information, which is
  // what a centred logo actually lands on. The second half of the fix is the
  // version search below.
  const errorLevel = style.logo ? ERROR_LEVEL_WITH_LOGO : DEFAULT_ERROR_LEVEL

  const hasCode = payload.trim().length > 0

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
  const matrix = useMemo(() => {
    if (!hasCode) return null

    const natural = buildMatrix(payload, errorLevel)
    if (!style.logo) return natural

    // A logo has to clear the finders, the timing patterns, the format
    // information and the alignment patterns — none of which error correction
    // protects, at any level. On a short payload there is no central space
    // that does, so the symbol is grown until there is. See `logo-fit.ts`.
    const version = versionForLogo(
      versionOfSize(natural.size),
      style.quietZone,
      style.logoSize
    )
    if (version === versionOfSize(natural.size)) return natural

    return buildMatrix(payload, errorLevel, version)
  }, [
    payload,
    errorLevel,
    hasCode,
    style.logo,
    style.quietZone,
    style.logoSize
  ])

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
    mode,
    setMode,
    wifi,
    updateWifi,
    style,
    updateStyle,
    resetStyle,
    /** Whether the look differs from the defaults, i.e. whether to offer it. */
    isStyleDirty: isStyleDirty(style),
    reset,
    document,
    download,
    isExporting,
    exportError,
    errorLevel,
    hasCode,
    /** Detected from the payload, for the badge above the field. */
    detectedType: detectInputType(payload),
    /** Whether the current colours will survive a phone camera. */
    scan: checkScannability(
      style.foregroundColor,
      style.backgroundColor,
      style.gradientColor
    )
  }
}

export type UseQrGeneratorResult = ReturnType<typeof useQrGenerator>
