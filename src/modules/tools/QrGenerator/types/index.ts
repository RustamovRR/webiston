/** Shared QR types.
 *
 *  The option surface is now the one `qr-code-styling` actually implements.
 *  The old shape declared `cornerStyle`, `patternStyle` and `borderRadius`,
 *  rendered controls for all three, and consumed none of them: the QR came
 *  from `api.qrserver.com`, which takes only size, data, ecc, margin and two
 *  colours. Picking a corner style changed nothing on screen.
 */

import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  FileExtension
} from "qr-code-styling"

export type QrErrorLevel = "L" | "M" | "Q" | "H"

/** The kinds of payload the tool knows how to build and read back. */
export type QrContentType = "url" | "text" | "wifi" | "contact" | "sms"

export interface QrPreset {
  label: string
  value: string
  description: string
  category: QrContentType
}

/**
 * Everything that changes how the code LOOKS.
 *
 * Split three ways because that is how the renderer is split, and because the
 * split is what makes a code readable: the eyes (the three big squares) carry
 * the scanner's orientation lock, so they can be styled separately from the
 * data modules without hurting detection.
 */
export interface QrStyle {
  foregroundColor: string
  backgroundColor: string
  /** Second stop. `undefined` means a flat colour, not a gradient. */
  gradientColor?: string
  gradientType: "linear" | "radial"
  dotType: DotType
  cornerSquareType: CornerSquareType
  cornerDotType: CornerDotType
  margin: number
  /**
   * Rounding of the code's own outer corners, 0–1.
   *
   * Cosmetic and safe: it clips the quiet-zone background, never a module.
   * A scanner needs the light margin, not square corners.
   */
  backgroundRound: number
  /** Data URL of an uploaded logo. */
  logo?: string
  /** Logo width as a share of the code, 0–1. */
  logoSize: number
}

export type QrDownloadFormat = Extract<FileExtension, "png" | "svg" | "webp">

export type { CornerDotType, CornerSquareType, DotType }
