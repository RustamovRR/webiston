/**
 * Read an uploaded image and shrink it to what the destination can actually
 * use — the QR code's centre logo, a CV photo, anything that ends up embedded
 * rather than linked.
 *
 * Downscaling is not a nicety in either case. An embedded image travels as a
 * data URL: inside an exported SVG (where a 6.7 MB upload produced a 9 MB
 * "vector" file) or inside `localStorage` (where a phone photo alone blows
 * the ~5 MB quota and silently kills the whole saved draft). Rejecting large
 * files instead — the first version of the QR logo did — reads to the visitor
 * as "the upload button does nothing".
 */

export type ImageError = "unreadable"

export interface ImageResult {
  dataUrl?: string
  error?: ImageError
}

export interface DownscaleOptions {
  /** Longest edge, in pixels, after scaling. */
  maxEdge: number
  /**
   * PNG keeps transparency (a logo over QR modules needs it); JPEG is far
   * smaller and right for a photograph, which has no transparency to lose.
   */
  format?: "image/png" | "image/jpeg"
  /** JPEG only, 0–1. */
  quality?: number
  /**
   * Skip re-encoding when the original is already small enough. Correct for a
   * logo — re-encoding throws away PNG precision for nothing — and wrong for
   * a photo, where a small-but-heavy JPEG still needs compressing.
   */
  passThroughIfSmall?: boolean
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("unreadable"))
    image.src = src
  })
}

export function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("unreadable"))
    reader.readAsDataURL(file)
  })
}

export async function downscaleImage(
  file: File,
  {
    maxEdge,
    format = "image/png",
    quality,
    passThroughIfSmall = false
  }: DownscaleOptions
): Promise<ImageResult> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const longestEdge = Math.max(image.width, image.height)

    if (passThroughIfSmall && longestEdge <= maxEdge) {
      return { dataUrl: await toDataUrl(file) }
    }

    const scale = Math.min(1, maxEdge / longestEdge)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)

    const context = canvas.getContext("2d")
    if (!context) return { error: "unreadable" }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return { dataUrl: canvas.toDataURL(format, quality) }
  } catch {
    return { error: "unreadable" }
  } finally {
    // Always: an early return that leaked the URL would hold the file in
    // memory for the life of the page.
    URL.revokeObjectURL(objectUrl)
  }
}
