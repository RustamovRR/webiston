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

/** PNG, because a code snapshot is flat colour and sharp edges. */
const MIME = "image/png"

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      // Null means the browser refused to encode — an over-large canvas is the
      // usual cause. Rejecting keeps the caller from writing `null` to a file.
      if (blob) resolve(blob)
      else reject(new Error("Canvas could not be encoded as PNG"))
    }, MIME)
  })
}

/**
 * A filename that says what it is.
 *
 * Falls back to a fixed stem rather than an empty string — `.png` alone is a
 * hidden file on macOS and Linux.
 */
export function snapshotFileName(title: string): string {
  const stem = title
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")

  return `${stem || "code-snapshot"}.png`
}

export async function downloadSnapshot(
  canvas: HTMLCanvasElement,
  fileName: string
): Promise<void> {
  const blob = await toBlob(canvas)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = fileName
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
    new ClipboardItem({ [MIME]: toBlob(canvas) })
  ])
}
