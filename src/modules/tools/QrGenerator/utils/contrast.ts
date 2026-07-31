/**
 * Will this code actually scan?
 *
 * A QR reader is a thresholding algorithm, not a human eye: it needs a clear
 * dark/light split between the modules and the background. Every styling
 * control on this page can quietly destroy that — a pale foreground, a dark
 * background, an inverted pair — and the failure is invisible until someone
 * points a phone at a printed poster and nothing happens.
 *
 * QRCode Monkey warns about this and we did not, which is the difference
 * between a toy and a tool. The thresholds below follow the ISO/IEC 18004
 * guidance that the code must be DARK on LIGHT with a wide margin; 4:1 is the
 * point where consumer scanners start failing in poor light, 7:1 is
 * comfortable.
 */

/** Relative luminance per WCAG 2.1, which is the same maths a scanner's
 *  thresholding approximates. */
function luminance(hex: string): number {
  const clean = hex.replace("#", "")
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean

  const channel = (offset: number) => {
    const value = Number.parseInt(full.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground)
  const b = luminance(background)
  const [light, dark] = a > b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}

export type ScanRisk = "ok" | "low" | "inverted"

export interface ScanVerdict {
  risk: ScanRisk
  ratio: number
  /** Below the hard floor: not "might fail in bad light" but "expect failure". */
  severe: boolean
}

/** Comfortable for a phone camera in ordinary indoor light. */
const SAFE_RATIO = 7

/** Below this, expect failures on cheap sensors and on print. */
const MINIMUM_RATIO = 4

/**
 * @param gradientColor The far stop, when the ink is a gradient.
 *
 * A gradient is the hole this check used to have: only the first stop was
 * measured, so black → sky-blue passed silently while half the modules were
 * painted at 2.6:1. The verdict is the WORST stop, because a reader thresholds
 * every module independently — it does not average them.
 */
export function checkScannability(
  foreground: string,
  background: string,
  gradientColor?: string
): ScanVerdict {
  const stops = gradientColor ? [foreground, gradientColor] : [foreground]

  // The lightest stop is the one that fails, so it decides the verdict.
  const worst = stops.reduce((a, b) => (luminance(a) > luminance(b) ? a : b))

  const ratio = Number.parseFloat(contrastRatio(worst, background).toFixed(1))

  // Light-on-dark is a separate failure from low contrast, and a worse one:
  // the ratio can be excellent and many readers still refuse, because the
  // finder patterns are matched dark-on-light. Worth its own message.
  if (luminance(worst) > luminance(background)) {
    return { risk: "inverted", ratio, severe: true }
  }

  if (ratio < SAFE_RATIO) {
    return { risk: "low", ratio, severe: ratio < MINIMUM_RATIO }
  }

  return { risk: "ok", ratio, severe: false }
}
