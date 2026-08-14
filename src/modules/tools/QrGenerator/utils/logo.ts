import { downscaleImage } from "@/lib/utils"

/**
 * Prepare an uploaded logo for the middle of a QR code.
 *
 * The first version simply refused anything over 1 MB — `if (file.size > MAX)
 * return` — with no message, no logo and no explanation. A real brand logo is
 * routinely bigger than that, so the honest description of that behaviour is
 * "the upload button does nothing", which is exactly how it was reported.
 *
 * Rejecting was the wrong answer anyway. The logo is drawn at roughly 30% of a
 * 320px code — about 96px — so a 1400x1400 original carries no information the
 * output can use. Downscaling accepts every file AND shrinks what gets embedded:
 * the image travels as a data URL inside the exported SVG, so a 6.7 MB upload
 * would otherwise produce a 9 MB "vector" file.
 *
 * The canvas work itself moved to `src/lib/utils/image.ts` when the resume
 * builder's photo upload became its second consumer. The two OPTIONS here are
 * what stayed behind, because they are what makes this a logo and not a photo:
 * PNG (a JPEG matte would paint a white box back into the middle of the
 * modules) and pass-through when the original is already small, which keeps an
 * SVG's sharpness rather than re-encoding it away.
 */

/** Comfortably above what any export needs, small enough to embed. */
const MAX_EDGE = 512

export type LogoError = "unreadable"

export interface LogoResult {
  dataUrl?: string
  error?: LogoError
}

export function prepareLogo(file: File): Promise<LogoResult> {
  return downscaleImage(file, {
    maxEdge: MAX_EDGE,
    format: "image/png",
    passThroughIfSmall: true
  })
}
