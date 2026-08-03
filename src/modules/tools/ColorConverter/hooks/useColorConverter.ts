"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  addToColorHistory,
  generatePalette,
  generateTailwindShades,
  labToLch,
  oklabToOklch,
  parseColorInput,
  rgbToHex,
  rgbToHsl,
  rgbToLab,
  rgbToOklab
} from "@/lib/utils"

import { BLACK, PALETTE_TYPES, WHITE } from "../constants"
import { useColorDraftStore } from "../stores/colorDraftStore"
import type { ColorFormats, PaletteType } from "../types"
import { nearestPassingShade, readContrast, readRamp } from "../utils/contrast"
import { getColorName, toTokenName } from "../utils/exports"

/**
 * The converter's state and everything derived from it.
 *
 * What earlier rewrites removed, each a real defect and not tidiness:
 *
 * - `onSuccess`/`onError` callbacks fired INSIDE the `useMemo` — side effects
 *   in the render phase, wired to `console.log` at the call site.
 * - A private 12-entry Uzbek colour dictionary, while `COLOR_NAMES` in
 *   `src/constants/` holds the full registry the rest of the app uses.
 * - History was written on EVERY keystroke that happened to parse — typing
 *   "#ff0000" recorded "#ff0" (3-digit hex is legal) on the way. Recording is
 *   now explicit: presets, the picker, palette clicks and blur record;
 *   keystrokes never do.
 */

/** Rounding is presentation. The conversions themselves keep full precision. */
const round = (value: number, digits: number) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** `oklch(0.4 0.07 217)` → `oklch(0.4 0.07 217 / 0.5)` when translucent. */
const withAlpha = (notation: string, alpha: number) =>
  alpha < 1 ? notation.replace(/\)$/, ` / ${round(alpha, 3)})`) : notation

const toHex8 = (hex: string, alpha: number) =>
  alpha < 1
    ? `${hex}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`
    : hex

/** The query parameter that makes a colour shareable. */
const COLOR_PARAM = "c"

export function useColorConverter() {
  const inputColor = useColorDraftStore((state) => state.inputColor)
  const setInputColor = useColorDraftStore((state) => state.setInputColor)

  const colorFormats = useMemo((): ColorFormats | null => {
    const parsed = parseColorInput(inputColor)
    if (!parsed) return null

    const { r, g, b, a } = parsed
    const hsl = rgbToHsl(r, g, b)
    const lab = rgbToLab(r, g, b)
    const lch = labToLch(lab.l, lab.a, lab.b)
    const oklab = rgbToOklab(r, g, b)
    const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)
    const hexOpaque = rgbToHex(r, g, b)

    return {
      hex: toHex8(hexOpaque, a).toUpperCase(),
      hexOpaque,
      // CSS Color 4 space syntax across every row. The panel used to print the
      // legacy comma form for RGB/HSL and the modern form for the other five,
      // which reads as two tools sharing a card — and it needed separate RGBA
      // and HSLA rows to say what one row can say with `/ alpha`.
      rgb: withAlpha(`rgb(${r} ${g} ${b})`, a),
      hsl: withAlpha(`hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`, a),
      lab: withAlpha(`lab(${lab.l}% ${lab.a} ${lab.b})`, a),
      lch: withAlpha(`lch(${lch.l}% ${lch.c} ${lch.h})`, a),
      oklab: withAlpha(
        `oklab(${round(oklab.l, 3)} ${round(oklab.a, 3)} ${round(oklab.b, 3)})`,
        a
      ),
      oklch: withAlpha(
        `oklch(${round(oklch.l, 3)} ${round(oklch.c, 3)} ${oklch.h})`,
        a
      ),
      rgbValues: { r, g, b, a },
      hslValues: hsl,
      opacity: a
    }
  }, [inputColor])

  const contrast = useMemo(
    () => (colorFormats ? readContrast(colorFormats.rgbValues) : null),
    [colorFormats]
  )

  /**
   * Bumped on every history WRITE, so the history panel re-reads exactly when
   * there is something new. Keying its refresh off the current colour missed
   * the blur-recording: the value does not change at blur, so the write
   * landed in storage and the panel kept showing the old list.
   */
  const [historyVersion, setHistoryVersion] = useState(0)

  /**
   * `addToColorHistory` canonicalises and rejects unparseable input itself, so
   * the only thing this owes is the refresh signal. The gate here mirrors it so
   * the panel does not re-read storage for a write that never happened.
   */
  const record = useCallback((color: string) => {
    if (!parseColorInput(color)) return
    addToColorHistory(color)
    setHistoryVersion((version) => version + 1)
  }, [])

  /**
   * A DELIBERATE selection — preset, picker, palette swatch, random,
   * eyedropper — both sets the colour and records it in the persistent
   * history. Typing goes through `setInputColor` and records nothing until
   * `recordCurrent` (blur).
   */
  const chooseColor = useCallback(
    (color: string) => {
      setInputColor(color)
      record(color)
    },
    [setInputColor, record]
  )

  const recordCurrent = useCallback(
    () => record(inputColor),
    [record, inputColor]
  )

  /**
   * Alpha is expressed as an 8-digit hex because that is the tool's canonical
   * form and it round-trips through the parser. The slider used to be rendered
   * only when the colour ALREADY had alpha, so from an opaque colour there was
   * no way to reach a translucent one except by hand-writing `rgba(…)`.
   */
  const setOpacity = useCallback(
    (alpha: number) => {
      if (!colorFormats) return
      setInputColor(toHex8(colorFormats.hexOpaque, alpha))
    },
    [colorFormats, setInputColor]
  )

  /**
   * `?c=<hex>` — shareable, and it survives a refresh.
   *
   * `replaceState` rather than a router navigation: a `router.replace` per
   * keystroke schedules work nobody asked for. The view is deliberately NOT in
   * the URL — see the note in the store.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only hydration
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(COLOR_PARAM)
    if (!fromUrl) return
    const candidate = fromUrl.startsWith("#") ? fromUrl : `#${fromUrl}`
    if (parseColorInput(candidate)) setInputColor(candidate)
  }, [])

  useEffect(() => {
    if (!colorFormats) return
    const url = new URL(window.location.href)
    url.searchParams.set(COLOR_PARAM, colorFormats.hex.slice(1).toLowerCase())
    window.history.replaceState(null, "", url)
  }, [colorFormats])

  /** All three schemes at once — the type switch is gone. */
  const palettes = useMemo(
    () =>
      colorFormats
        ? PALETTE_TYPES.map((type) => ({
            type,
            colors: generatePalette(colorFormats.hexOpaque, type)
          }))
        : ([] as Array<{ type: PaletteType; colors: string[] }>),
    [colorFormats]
  )

  const tailwindShades = useMemo(
    () =>
      colorFormats
        ? generateTailwindShades(colorFormats.hexOpaque).map(
            ({ shade, hex }) => ({ shade, hex })
          )
        : [],
    [colorFormats]
  )

  const rampReadability = useMemo(
    () => readRamp(tailwindShades),
    [tailwindShades]
  )

  /**
   * Only offered when it is both needed and honest — i.e. the colour fails AA
   * on both backdrops AND is opaque.
   *
   * The scale is generated from the OPAQUE hex, so suggesting one of its steps
   * to fix a translucent colour would be advice about a different colour: what
   * a translucent colour needs is more alpha, not a darker shade. Measured on
   * `transparent`, the unguarded version offered a 21.00:1 "repair".
   */
  const passingShade = useMemo(
    () =>
      contrast &&
      colorFormats?.opacity === 1 &&
      !contrast.whiteGrades.aa &&
      !contrast.blackGrades.aa
        ? nearestPassingShade(
            tailwindShades,
            contrast.white >= contrast.black ? WHITE : BLACK
          )
        : null,
    [contrast, colorFormats, tailwindShades]
  )

  const colorName = colorFormats ? getColorName(colorFormats.hex) : ""

  return {
    inputColor,
    setInputColor,
    chooseColor,
    recordCurrent,
    setOpacity,
    colorFormats,
    contrast,
    palettes,
    tailwindShades,
    rampReadability,
    passingShade,
    historyVersion,
    isValid: colorFormats !== null,
    colorName,
    /** The stem the export panel starts from. */
    tokenName: toTokenName(colorName)
  }
}

export type UseColorConverterResult = ReturnType<typeof useColorConverter>
