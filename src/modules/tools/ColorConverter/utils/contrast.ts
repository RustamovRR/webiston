import {
  type ContrastGrades,
  compositeOver,
  contrastRatio,
  gradeContrast,
  hexToRgb,
  type Rgb,
  WCAG_THRESHOLDS
} from "@/lib/utils"

import { BLACK, WHITE } from "../constants"
import type { ShadeStep } from "../types"

/**
 * "May a human read this?" — the question the QR tool's `checkScannability`
 * does NOT answer (it asks whether a camera can threshold the code).
 *
 * Both readings are the same number: contrast is symmetric, so 4.83:1 covers
 * both "white text on this colour" and "this colour as text on white". One
 * measurement, two things the visitor can act on.
 */

export interface ContrastReading {
  /** Ratio of the colour against a white backdrop, alpha already composited. */
  white: number
  black: number
  whiteGrades: ContrastGrades
  blackGrades: ContrastGrades
  /** Whichever of black/white text stays legible on this colour. */
  readableText: typeof WHITE | typeof BLACK
  /** The ratio that recommendation earns. */
  readableRatio: number
}

const WHITE_RGB: Rgb = { r: 255, g: 255, b: 255 }
const BLACK_RGB: Rgb = { r: 0, g: 0, b: 0 }

export const readContrast = (color: Rgb & { a: number }): ContrastReading => {
  // A translucent colour has no contrast of its own — measure the composite
  // that actually lands on each backdrop.
  const onWhite = contrastRatio(compositeOver(color, WHITE_RGB), WHITE_RGB)
  const onBlack = contrastRatio(compositeOver(color, BLACK_RGB), BLACK_RGB)

  // Graded on the raw value: rounding 4.4996 to 4.50 first would report a
  // passing AA for a pair that fails it.
  const whiteWins = onWhite >= onBlack
  return {
    white: onWhite,
    black: onBlack,
    whiteGrades: gradeContrast(onWhite),
    blackGrades: gradeContrast(onBlack),
    readableText: whiteWins ? WHITE : BLACK,
    readableRatio: whiteWins ? onWhite : onBlack
  }
}

/**
 * Contrast of an arbitrary hex pair, for the ramp readouts and the optional
 * third backdrop.
 *
 * `hexToRgb` only understands 3- and 6-digit hex, so an 8-digit colour used to
 * fall through to a flat `1`. That is not a rounding error: the tool's own
 * canonical form for a translucent colour IS 8 digits, so the custom-backdrop
 * row silently ignored alpha while the two beside it composited it correctly.
 */
export const hexContrast = (foreground: string, background: string): number => {
  const bg = hexToRgb(background.slice(0, 7))
  if (!bg) return 1

  const fg = hexToRgb(foreground.slice(0, 7))
  if (!fg) return 1

  const alpha =
    foreground.length >= 9
      ? Number.parseInt(foreground.slice(7, 9), 16) / 255
      : 1

  return contrastRatio(compositeOver({ ...fg, a: alpha }, bg), bg)
}

export interface PassingShade {
  shade: number
  hex: string
  ratio: number
}

/**
 * The nearest step of the visitor's OWN scale that clears AA on a backdrop.
 *
 * The research called this the highest-value feature in the whole accessibility
 * category and the clearest line between a checker and a fixer — WebAIM makes
 * you drag a slider, Chrome DevTools gives you one button. For us it is a
 * lookup, not new colour science: the 50–950 ramp is already on screen, so the
 * answer is "which of these passes, and which of those is closest to the one
 * you picked".
 */
export const nearestPassingShade = (
  shades: readonly ShadeStep[],
  backdrop: string
): PassingShade | null => {
  const baseIndex = shades.findIndex((step) => step.shade === 500)
  if (baseIndex === -1) return null

  let best: PassingShade | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  shades.forEach((step, index) => {
    const ratio = hexContrast(step.hex, backdrop)
    if (ratio < WCAG_THRESHOLDS.aa) return
    const distance = Math.abs(index - baseIndex)
    if (distance < bestDistance) {
      bestDistance = distance
      best = { shade: step.shade, hex: step.hex, ratio }
    }
  })

  return best
}

export interface RampReadability {
  /** Lowest step whose colour carries WHITE text at AA, or null if none does. */
  whiteFrom: number | null
  /** Highest step that carries BLACK text at AA, or null if none does. */
  blackTo: number | null
}

/**
 * Which of your own shades can carry text — as one sentence rather than as
 * uicolors' 121-cell matrix. The ramp is monotonic, so the answer really is
 * two boundaries and not a grid.
 */
export const readRamp = (shades: readonly ShadeStep[]): RampReadability => {
  const carriesWhite = shades.filter(
    (step) => hexContrast(step.hex, WHITE) >= WCAG_THRESHOLDS.aa
  )
  const carriesBlack = shades.filter(
    (step) => hexContrast(step.hex, BLACK) >= WCAG_THRESHOLDS.aa
  )

  return {
    whiteFrom: carriesWhite.length ? carriesWhite[0].shade : null,
    blackTo: carriesBlack.length
      ? carriesBlack[carriesBlack.length - 1].shade
      : null
  }
}
