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
 */

/** Comfortably above what any export needs, small enough to embed. */
const MAX_EDGE = 512

export type LogoError = "unreadable"

export interface LogoResult {
  dataUrl?: string
  error?: LogoError
}

export async function prepareLogo(file: File): Promise<LogoResult> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)

    // Already small enough: keep the original bytes rather than re-encoding,
    // which would throw away an SVG's sharpness or a PNG's transparency
    // precision for no gain.
    const longestEdge = Math.max(image.width, image.height)
    if (longestEdge <= MAX_EDGE) return { dataUrl: await toDataUrl(file) }

    const scale = MAX_EDGE / longestEdge
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)

    const context = canvas.getContext("2d")
    if (!context) return { error: "unreadable" }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    // PNG, not JPEG: a logo over a QR code needs its transparency, and a JPEG
    // matte would paint a white box back into the middle of the modules.
    return { dataUrl: canvas.toDataURL("image/png") }
  } catch {
    return { error: "unreadable" }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("unreadable"))
    image.src = src
  })
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("unreadable"))
    reader.readAsDataURL(file)
  })
}
