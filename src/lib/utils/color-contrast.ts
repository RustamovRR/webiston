/**
 * WCAG 2.1 contrast maths.
 *
 * Promoted here from `QrGenerator/utils/contrast.ts` at the second consumer:
 * the QR tool asks "will a scanner threshold this?" and the colour converter
 * asks "may a human read text on this?" — different verdicts, one identical
 * luminance formula underneath. The verdict logic stays with each caller; only
 * the maths is shared.
 */

/** A colour with no alpha, channels 0–255. */
export interface Rgb {
  r: number
  g: number
  b: number
}

/** Relative luminance per WCAG 2.1 §relative luminance. */
export const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const channel = (value: number) => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** 1 (identical) … 21 (black on white). Order of the arguments is irrelevant. */
export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [light, dark] = la > lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

/**
 * A translucent colour has no contrast of its own — only the composite that
 * lands on a given backdrop does. Ignoring alpha reports the ratio of a colour
 * nobody can see, which is worse than reporting nothing.
 */
export const compositeOver = (
  foreground: Rgb & { a: number },
  background: Rgb
): Rgb => ({
  r: Math.round(
    foreground.r * foreground.a + background.r * (1 - foreground.a)
  ),
  g: Math.round(
    foreground.g * foreground.a + background.g * (1 - foreground.a)
  ),
  b: Math.round(foreground.b * foreground.a + background.b * (1 - foreground.a))
})

/** WCAG 2.1 success criteria 1.4.3 (AA) and 1.4.6 (AAA). */
export const WCAG_THRESHOLDS = {
  /** 1.4.11 — icons, focus rings, input borders. */
  nonText: 3,
  /** ≥18.66px bold or ≥24px. */
  aaLarge: 3,
  aa: 4.5,
  aaaLarge: 4.5,
  aaa: 7
} as const

export interface ContrastGrades {
  aa: boolean
  aaLarge: boolean
  aaa: boolean
  aaaLarge: boolean
  nonText: boolean
}

export const gradeContrast = (ratio: number): ContrastGrades => ({
  aa: ratio >= WCAG_THRESHOLDS.aa,
  aaLarge: ratio >= WCAG_THRESHOLDS.aaLarge,
  aaa: ratio >= WCAG_THRESHOLDS.aaa,
  aaaLarge: ratio >= WCAG_THRESHOLDS.aaaLarge,
  nonText: ratio >= WCAG_THRESHOLDS.nonText
})
