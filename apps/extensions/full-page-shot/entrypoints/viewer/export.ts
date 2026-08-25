import type { Format } from "../../lib/capture"
import { JPEG_MATTE } from "../../lib/paint"
import { buildPdf, type PdfImage, sliceHeightPx } from "../../lib/pdf"

/**
 * Turning the one captured PNG into whatever the visitor asked for.
 *
 * The capture is ALWAYS a lossless PNG and every other format is derived here,
 * on click. The alternative — capturing again in the requested format — would
 * mean a second trip through the debugger, a second yellow banner, and a
 * second walk of the page, to produce a worse image than the one already in
 * memory.
 */

/** High enough that page text stays crisp, low enough to be worth choosing. */
const JPEG_QUALITY = 0.92

/** A little higher: a PDF is usually the copy that gets printed or archived,
 *  and it is already paying for pagination. */
const PDF_QUALITY = 0.94

/** What every export is named: the page's own title and the day. */
export function fileName(title: string, extension: string): string {
  const cleaned = title
    .toLowerCase()
    // Uzbek Latin writes o' and g' with U+02BB / U+02BC as often as with a
    // plain apostrophe, and a title like "Toʻliq" was becoming "to-liq"
    // instead of "toliq" because those two were not on the list.
    .replace(/['`‘’ʻʼ]/g, "")
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `${(cleaned || "screenshot").slice(0, 60)}-${day}.${extension}`
}

/**
 * A canvas past the browser's limits returns a null context, and a very tall
 * PNG can reach it. Every function here returns `null` in that case rather
 * than a PNG wearing the wrong extension — a silent lie is the one outcome a
 * screenshot tool must never produce.
 */
export async function toJpeg(blob: Blob): Promise<Blob | null> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement("canvas")
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext("2d")
  if (!context) {
    bitmap.close()
    return null
  }
  context.fillStyle = JPEG_MATTE
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  return await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  )
}

export async function toFormat(
  blob: Blob,
  format: Format
): Promise<Blob | null> {
  return format === "png" ? blob : await toJpeg(blob)
}

/**
 * Slice the capture into A4 pages and write a PDF around them.
 *
 * One reusable canvas the width of the image by one slice tall — not one the
 * size of the whole screenshot. A 1,200×40,000 capture would otherwise
 * allocate a 48-million-pixel canvas per page; this allocates two million,
 * once.
 */
export async function toPdf(blob: Blob): Promise<Blob | null> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) {
    bitmap.close()
    return null
  }

  const slice = sliceHeightPx(bitmap.width)
  const pages: PdfImage[] = []
  try {
    for (let top = 0; top < bitmap.height; top += slice) {
      const height = Math.min(slice, bitmap.height - top)
      // Assigning the size RESETS the context, so the matte is painted after
      // it and not before — JPEG has no alpha, and an unpainted transparent
      // region comes out black.
      canvas.width = bitmap.width
      canvas.height = height
      context.fillStyle = JPEG_MATTE
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(
        bitmap,
        0,
        top,
        bitmap.width,
        height,
        0,
        0,
        bitmap.width,
        height
      )
      const jpeg = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", PDF_QUALITY)
      )
      if (!jpeg) return null
      pages.push({
        jpeg: new Uint8Array(await jpeg.arrayBuffer()),
        widthPx: canvas.width,
        heightPx: height
      })
    }
  } finally {
    bitmap.close()
  }

  return new Blob([buildPdf(pages)], { type: "application/pdf" })
}

/** Hand a blob to the browser as a download. An extension page can do this
 *  itself, which is why the manifest asks for no `downloads` permission. */
export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  anchor.click()
  // Revoked on the next frame: revoking synchronously can cancel the download
  // before the browser has read the blob.
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}
