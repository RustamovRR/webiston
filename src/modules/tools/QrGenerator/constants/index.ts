import type { QrContentType, QrStyle } from "../types"

/**
 * Tool-scoped constants.
 *
 * The shape catalogues live next to the code that draws them, in `utils/`, so
 * a new shape is one entry and one `case` — not a fork of a dependency.
 */

export const CONTENT_TYPES: readonly QrContentType[] = [
  "url",
  "text",
  "wifi",
  "contact",
  "sms"
]

/**
 * Error correction, chosen for the visitor rather than asked of them.
 *
 * The old UI made this a four-button row labelled "~15% tiklash". It is the
 * most technical decision on the page and the one a visitor is least equipped
 * to make. There is exactly one rule worth applying, and it is mechanical: a
 * logo covers modules, so a code carrying one needs the highest redundancy or
 * it stops scanning.
 */
export const DEFAULT_ERROR_LEVEL = "M" as const
export const ERROR_LEVEL_WITH_LOGO = "H" as const

/** Preview edge length in user units; SVG scales, so this is not a limit. */
export const RENDER_SIZE = 320

/**
 * The code's INK, not the interface.
 *
 * The documented exception to token-only colour: a QR code is a printed
 * artefact whose readability is defined against absolute black on absolute
 * white, and it must NOT follow the site's light/dark scheme — a code that
 * inverted itself in dark mode would stop scanning.
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
  quietZone: 4,
  backgroundRound: 0,
  logoSize: 0.22,
  frame: "none",
  frameLabel: "SCAN ME"
}

/** Logos larger than this cover enough modules to beat even level H. */
export const MAX_LOGO_SIZE = 0.3
export const MIN_LOGO_SIZE = 0.1

/** Below the standard's four modules the symbol can fail to be found at all. */
export const MIN_QUIET_ZONE = 1
export const MAX_QUIET_ZONE = 8

export const MAX_FRAME_LABEL_LENGTH = 24
