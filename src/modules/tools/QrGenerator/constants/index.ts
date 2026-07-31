import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  QrContentType,
  QrStyle
} from "../types"

/**
 * Tool-scoped constants.
 *
 * The values here are the ones `qr-code-styling` accepts — no invented names.
 * The previous version listed `"extraRounded"` and `"diamond"` as pattern
 * styles; neither exists in any renderer, which is part of why nothing
 * happened when you picked them.
 */

/** Module (data dot) shapes, in increasing order of decoration. */
export const DOT_TYPES: readonly DotType[] = [
  "square",
  "rounded",
  "extra-rounded",
  "dots",
  "classy",
  "classy-rounded"
]

/** The three big orientation squares — frame and centre are styled apart. */
export const CORNER_SQUARE_TYPES: readonly CornerSquareType[] = [
  "square",
  "extra-rounded",
  "dot"
]

export const CORNER_DOT_TYPES: readonly CornerDotType[] = ["square", "dot"]

export const CONTENT_TYPES: readonly QrContentType[] = [
  "url",
  "text",
  "wifi",
  "contact",
  "sms"
]

/**
 * Error correction, chosen for the user rather than asked of them.
 *
 * The old UI made this a top-level four-button row with labels like
 * "~15% tiklash". It is the single most technical decision on the page and the
 * one a visitor is least equipped to make. There is only one rule worth
 * knowing, and it is mechanical: a logo covers modules, so a code carrying one
 * needs the highest redundancy or it stops scanning.
 */
export const DEFAULT_ERROR_LEVEL = "M" as const
export const ERROR_LEVEL_WITH_LOGO = "H" as const

/** Exported at this edge length; SVG ignores it and scales cleanly. */
export const RENDER_SIZE = 320

/** What a downloaded PNG/WEBP is rasterised at. Print wants ~300dpi. */
export const EXPORT_SIZE = 1024

/**
 * The code's INK, not the interface.
 *
 * These are the documented exception to token-only colour: a QR code is a
 * printed artefact whose readability is defined against absolute black on
 * absolute white, and it must not follow the site's light/dark scheme — a code
 * that inverted itself in dark mode would stop scanning. They live in named
 * constants for exactly this reason.
 */
const QR_INK = "#000000"
const QR_PAPER = "#ffffff"
/** Second gradient stop offered by default — the site's brand hue. */
export const DEFAULT_GRADIENT_COLOR = "#0ea5b7"

export const DEFAULT_STYLE: QrStyle = {
  foregroundColor: QR_INK,
  backgroundColor: QR_PAPER,
  gradientType: "linear",
  dotType: "square",
  cornerSquareType: "square",
  cornerDotType: "square",
  margin: 12,
  backgroundRound: 0,
  logoSize: 0.3
}

/** Logos larger than this cover enough modules to beat even level H. */
export const MAX_LOGO_SIZE = 0.4
export const MIN_LOGO_SIZE = 0.1
