import type { QrDownloadFormat } from "../types"
import { documentToSvg, type QrDocument } from "./render"

/**
 * Saving the code.
 *
 * The SVG is the source of truth for every format: raster output is that same
 * SVG drawn onto a canvas at whatever size is asked for. One picture, three
 * containers — so a PNG can never disagree with the preview, which is exactly
 * what happened when the download path did its own compositing.
 */

/** Raster exports are rendered at this edge length. Print wants the headroom. */
const RASTER_SIZE = 1024

export async function downloadQr(
  doc: QrDocument,
  format: QrDownloadFormat,
  fileName: string
): Promise<void> {
  const svg = documentToSvg(doc)
  const blob =
    format === "svg"
      ? new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      : await rasterise(svg, doc, format)

  save(blob, `${fileName}.${format}`)
}

async function rasterise(
  svg: string,
  doc: QrDocument,
  format: Exclude<QrDownloadFormat, "svg">
): Promise<Blob> {
  const { width, height } = doc.layout
  const scale = RASTER_SIZE / Math.max(width, height)

  const canvas = document.createElement("canvas")
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)

  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas is unavailable")

  // A data URL, not an object URL: an SVG loaded from a blob URL is treated as
  // a foreign document, which taints the canvas and makes `toBlob` throw the
  // moment the code carries an embedded logo.
  const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  const image = await loadImage(source)

  // WEBP and PNG both carry alpha; the frame may be transparent, and painting
  // a white plate under it would defeat the point.
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const mime = format === "png" ? "image/png" : "image/webp"
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime)
  )
  if (!blob) throw new Error("Export failed")
  return blob
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Could not rasterise the SVG"))
    image.src = src
  })
}

function save(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}
