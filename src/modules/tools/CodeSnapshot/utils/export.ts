import {
  DEFAULT_EXPORT_FORMAT,
  EXPORT_FORMATS,
  type ExportFormatId
} from "../constants"

/**
 * Getting the picture out of the browser.
 *
 * Two exits, and they fail in different ways, so they are separate functions
 * rather than one with a flag: a download always works, while the clipboard
 * needs a permission, a secure context and a browser that implements
 * `ClipboardItem` — Firefox did not until recently. The UI offers copy and
 * falls back to download when it reports failure, which is only possible if
 * failure is something a caller can catch.
 */

/**
 * The clipboard is PNG and only PNG.
 *
 * `ClipboardItem` is specified around a small set of "mandatory data types",
 * and `image/png` is the one every engine implements. Writing `image/webp`
 * throws in Safari and is refused by Firefox, so the format picker deliberately
 * governs the DOWNLOAD only — copying a picture nobody can paste would be a
 * worse trade than a larger file.
 */
const CLIPBOARD_MIME = "image/png"

const formatById = (id: ExportFormatId) =>
  EXPORT_FORMATS.find((format) => format.id === id) ?? EXPORT_FORMATS[0]

/**
 * Encode, and verify what actually came back.
 *
 * `toBlob` does NOT report an unsupported type — it silently produces a PNG
 * instead. Measured: `toBlob(cb, "image/avif")` in Chrome hands over a blob of
 * type `image/png`. Without this check the tool would name that file `.avif`
 * and hand the visitor something no viewer opens.
 */
function encode(
  canvas: HTMLCanvasElement,
  id: ExportFormatId
): Promise<{ blob: Blob; extension: string }> {
  const format = formatById(id)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Null means the browser refused to encode at all — an over-large
        // canvas is the usual cause. Rejecting keeps the caller from writing
        // `null` to a file.
        if (!blob) {
          reject(new Error(`Canvas could not be encoded as ${format.mime}`))
          return
        }
        const actual =
          EXPORT_FORMATS.find((item) => item.mime === blob.type) ??
          formatById(DEFAULT_EXPORT_FORMAT)
        resolve({ blob, extension: actual.extension })
      },
      format.mime,
      format.quality
    )
  })
}

/**
 * A filename that says what it is.
 *
 * Falls back to a fixed stem rather than an empty string — `.png` alone is a
 * hidden file on macOS and Linux. The extension is supplied by the caller,
 * which learned it from the blob the browser actually produced rather than
 * from the one it asked for.
 */
export function snapshotFileName(title: string, extension = "png"): string {
  const stem = title
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")

  return `${stem || "code-snapshot"}.${extension}`
}

export async function downloadSnapshot(
  canvas: HTMLCanvasElement,
  title: string,
  formatId: ExportFormatId = DEFAULT_EXPORT_FORMAT
): Promise<void> {
  const { blob, extension } = await encode(canvas, formatId)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = snapshotFileName(title, extension)
  // Attached before the click, as `QrGenerator/utils/export.ts:77` and three
  // other tools in this repo already do. Firefox has historically ignored a
  // synthetic download click on an anchor that is not in the document, and
  // there is no reason for this tool to be the one that finds out again.
  document.body.appendChild(link)
  link.click()
  link.remove()

  // Released on the next frame, not immediately: revoking synchronously can
  // beat the browser to reading the URL and produce a zero-byte download.
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}

/**
 * Copy the image itself — not a data URL — to the clipboard.
 *
 * The `ClipboardItem` is constructed with the blob PROMISE rather than an
 * awaited blob. Safari ends the user-gesture window as soon as the handler
 * awaits, and a `navigator.clipboard.write` outside that window is rejected;
 * handing over the promise keeps the write synchronous from its point of view.
 */
export async function copySnapshotToClipboard(
  canvas: HTMLCanvasElement
): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard images are not supported in this browser")
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      [CLIPBOARD_MIME]: encode(canvas, "png").then(({ blob }) => blob)
    })
  ])
}
