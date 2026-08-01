"use client"

import { useCallback, useMemo, useState } from "react"
import { COLOR_NAMES } from "@/constants/color-names"
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

import type { PaletteType } from "../constants"
import { useColorDraftStore } from "../stores/colorDraftStore"

/**
 * The converter's state and derived formats.
 *
 * What the rewrite removed, each a real defect and not tidiness:
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

export interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  rgba: string
  hsla: string
  lab: string
  lch: string
  oklab: string
  oklch: string
  rgbValues: { r: number; g: number; b: number; a: number }
  hslValues: { h: number; s: number; l: number; a: number }
  labValues: { l: number; a: number; b: number }
  lchValues: { l: number; c: number; h: number }
  oklabValues: { l: number; a: number; b: number }
  oklchValues: { l: number; c: number; h: number }
  opacity: number
  isValid: boolean
}

/** hex → readable name, inverted once from the shared registry. */
const NAME_BY_HEX: ReadonlyMap<string, string> = new Map(
  Object.entries(COLOR_NAMES).map(([name, hex]) => [hex.toLowerCase(), name])
)

export function getColorName(hex: string): string {
  return NAME_BY_HEX.get(hex.slice(0, 7).toLowerCase()) ?? ""
}

export function useColorConverter() {
  const inputColor = useColorDraftStore((state) => state.inputColor)
  const paletteType = useColorDraftStore((state) => state.paletteType)
  const setInputColor = useColorDraftStore((state) => state.setInputColor)
  const setPaletteType = useColorDraftStore((state) => state.setPaletteType)

  const colorFormats = useMemo((): ColorFormats | null => {
    const parsed = parseColorInput(inputColor)
    if (!parsed) return null

    const { r, g, b, a } = parsed
    const hsl = rgbToHsl(r, g, b)
    const lab = rgbToLab(r, g, b)
    const lch = labToLch(lab.l, lab.a, lab.b)
    const oklab = rgbToOklab(r, g, b)
    const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)

    const hex =
      a < 1
        ? `${rgbToHex(r, g, b)}${Math.round(a * 255)
            .toString(16)
            .padStart(2, "0")}`
        : rgbToHex(r, g, b)

    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`,
      lab: `lab(${lab.l}% ${lab.a} ${lab.b})`,
      lch: `lch(${lch.l}% ${lch.c} ${lch.h})`,
      oklab: `oklab(${oklab.l} ${oklab.a} ${oklab.b})`,
      oklch: `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
      rgbValues: { r, g, b, a },
      hslValues: { ...hsl, a },
      labValues: lab,
      lchValues: lch,
      oklabValues: oklab,
      oklchValues: oklch,
      opacity: a,
      isValid: true
    }
  }, [inputColor])

  /**
   * Bumped on every history WRITE, so the history panel re-reads exactly when
   * there is something new. Keying its refresh off the current colour missed
   * the blur-recording: the value does not change at blur, so the write
   * landed in storage and the panel kept showing the old list.
   */
  const [historyVersion, setHistoryVersion] = useState(0)

  /**
   * A DELIBERATE selection — preset, picker, palette swatch, random — both
   * sets the colour and records it in the persistent history. Typing goes
   * through `setInputColor` and records nothing until `recordCurrent` (blur).
   */
  const chooseColor = useCallback(
    (color: string) => {
      setInputColor(color)
      if (parseColorInput(color)) {
        addToColorHistory(color)
        setHistoryVersion((version) => version + 1)
      }
    },
    [setInputColor]
  )

  const recordCurrent = useCallback(() => {
    if (parseColorInput(inputColor)) {
      addToColorHistory(inputColor)
      setHistoryVersion((version) => version + 1)
    }
  }, [inputColor])

  const palette = useMemo(
    () =>
      colorFormats
        ? generatePalette(colorFormats.hex.slice(0, 7), paletteType)
        : [],
    [colorFormats, paletteType]
  )

  const tailwindShades = useMemo(
    () =>
      colorFormats ? generateTailwindShades(colorFormats.hex.slice(0, 7)) : [],
    [colorFormats]
  )

  return {
    inputColor,
    setInputColor,
    chooseColor,
    recordCurrent,
    paletteType,
    setPaletteType: setPaletteType as (type: PaletteType) => void,
    colorFormats,
    palette,
    tailwindShades,
    historyVersion,
    isValid: colorFormats !== null,
    colorName: colorFormats ? getColorName(colorFormats.hex) : ""
  }
}

export type UseColorConverterResult = ReturnType<typeof useColorConverter>
