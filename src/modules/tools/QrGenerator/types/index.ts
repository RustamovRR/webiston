/**
 * Shared QR types.
 *
 * The shape unions come from OUR catalogues now, not from a library's private
 * switch. That is the whole point of the change: the previous renderer
 * hardcoded six module shapes and no configuration could add a seventh, so the
 * ceiling on how good this tool could look was set by a dependency.
 */

import type { EyeBallShape, EyeFrameShape } from "../utils/eyes"
import type { FrameId } from "../utils/frames"
import type { ModuleShape } from "../utils/shapes"

export type QrErrorLevel = "L" | "M" | "Q" | "H"

/** The kinds of payload the tool knows how to build and read back. */
export type QrContentType = "url" | "text" | "wifi" | "contact" | "sms"

export interface QrStyle {
  foregroundColor: string
  backgroundColor: string
  /** Second stop. `undefined` means a flat colour, not a gradient. */
  gradientColor?: string
  gradientType: "linear" | "radial"
  dotType: ModuleShape
  cornerSquareType: EyeFrameShape
  cornerDotType: EyeBallShape
  /**
   * The light border, in MODULES — not pixels.
   *
   * ISO/IEC 18004 specifies four. It has to be counted in modules because the
   * module size shrinks as the payload grows, so a fixed pixel margin silently
   * becomes a different (usually illegal) quiet zone on every version.
   */
  quietZone: number
  /**
   * Rounding of the code's own outer corners, 0–1.
   *
   * Cosmetic and safe: it clips the quiet-zone background, never a module.
   */
  backgroundRound: number
  /** Data URL of an uploaded logo. */
  logo?: string
  /** Logo width as a share of the code, 0–1. */
  logoSize: number
  /** The surround. Never touches a module, so it cannot affect decoding. */
  frame: FrameId
  frameLabel: string
}

export type QrDownloadFormat = "svg" | "png" | "webp"

export type { EyeBallShape, EyeFrameShape, FrameId, ModuleShape }
