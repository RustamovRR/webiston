"use client"

/**
 * The QR code, rendered in this browser.
 *
 * What this replaces: every code used to be fetched from
 * `https://api.qrserver.com/v1/create-qr-code/?data=…`. That meant the payload
 * — a link, a phone number, a vCard, **a WiFi password** — was sent to a third
 * party on every keystroke, from a site whose other flagship tool promises the
 * text never leaves the browser. It also capped what the tool could ever do:
 * that endpoint takes size, data, ecc, margin and two colours, so the corner
 * and pattern controls on screen were decoration with nothing behind them.
 *
 * `qr-code-styling` draws the modules itself, which is what makes the shape and
 * gradient options real, what makes SVG export possible, and what removes the
 * network from the loop entirely.
 */

import QRCodeStyling from "qr-code-styling"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  DEFAULT_ERROR_LEVEL,
  DEFAULT_STYLE,
  ERROR_LEVEL_WITH_LOGO,
  EXPORT_SIZE,
  RENDER_SIZE
} from "../constants"
import type { QrContentType, QrDownloadFormat, QrStyle } from "../types"
import { checkScannability } from "../utils/contrast"
import { detectInputType } from "../utils/qr-input"

/** Long enough to coalesce typing, short enough that the code tracks the caret. */
const REDRAW_DELAY = 120

function toGradient(style: QrStyle) {
  if (!style.gradientColor) return undefined
  return {
    type: style.gradientType,
    rotation: style.gradientType === "linear" ? Math.PI / 4 : 0,
    colorStops: [
      { offset: 0, color: style.foregroundColor },
      { offset: 1, color: style.gradientColor }
    ]
  }
}

export function useQrGenerator() {
  const [value, setValue] = useState("")
  const [contentType, setContentType] = useState<QrContentType>("url")
  const [style, setStyle] = useState<QrStyle>(DEFAULT_STYLE)
  const [isExporting, setIsExporting] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<QRCodeStyling | null>(null)

  // A logo punches a hole in the data area. Level H is the only one with
  // enough redundancy to survive it, so the choice is made from the facts
  // rather than handed to the visitor as a four-way quiz.
  const errorLevel = style.logo ? ERROR_LEVEL_WITH_LOGO : DEFAULT_ERROR_LEVEL

  const options = useMemo(
    () => ({
      width: RENDER_SIZE,
      height: RENDER_SIZE,
      type: "svg" as const,
      data: value || " ",
      margin: style.margin,
      image: style.logo,
      qrOptions: { errorCorrectionLevel: errorLevel },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: style.logoSize,
        // Clear the modules behind the logo instead of painting a white box
        // over them. The old canvas code drew a hardcoded white rectangle,
        // which on a dark background left a bright card in the middle of the
        // code — and still covered the modules underneath.
        hideBackgroundDots: true
      },
      dotsOptions: {
        type: style.dotType,
        color: style.foregroundColor,
        gradient: toGradient(style)
      },
      cornersSquareOptions: {
        type: style.cornerSquareType,
        color: style.foregroundColor
      },
      cornersDotOptions: {
        type: style.cornerDotType,
        color: style.foregroundColor
      },
      backgroundOptions: {
        color: style.backgroundColor,
        round: style.backgroundRound
      }
    }),
    [value, style, errorLevel]
  )

  // Create once, then update. Re-creating on every change would tear the SVG
  // out of the DOM and re-append it, which reads as a flicker on every
  // keystroke.
  useEffect(() => {
    if (!containerRef.current) return
    if (instanceRef.current) return
    instanceRef.current = new QRCodeStyling(options)
    instanceRef.current.append(containerRef.current)
  }, [options])

  useEffect(() => {
    const timer = setTimeout(() => {
      instanceRef.current?.update(options)
    }, REDRAW_DELAY)
    return () => clearTimeout(timer)
  }, [options])

  const download = useCallback(
    async (format: QrDownloadFormat) => {
      if (!value.trim() || !instanceRef.current) return
      setIsExporting(true)
      try {
        // Raster formats are re-rendered large: the preview is 320px, and a
        // 320px PNG is useless on anything printed. SVG needs no size at all.
        if (format !== "svg") {
          instanceRef.current.update({
            width: EXPORT_SIZE,
            height: EXPORT_SIZE
          })
        }
        await instanceRef.current.download({
          name: "webiston-qr",
          extension: format
        })
      } finally {
        if (format !== "svg") {
          instanceRef.current?.update({
            width: RENDER_SIZE,
            height: RENDER_SIZE
          })
        }
        setIsExporting(false)
      }
    },
    [value]
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
    contentType,
    setContentType,
    style,
    updateStyle,
    reset,
    containerRef,
    download,
    isExporting,
    errorLevel,
    hasCode: value.trim().length > 0,
    /** Detected from the payload, for the "what is this" line under the code. */
    detectedType: detectInputType(value),
    /** Whether the current colours will survive a phone camera. */
    scan: checkScannability(style.foregroundColor, style.backgroundColor)
  }
}

export type UseQrGeneratorResult = ReturnType<typeof useQrGenerator>
