/**
 * Handing a generated file to the browser.
 *
 * Promoted here at its second consumer, per the §14 rule: `LatinCyrillic`'s
 * file export wrote it first, the Tilxat `.docx` export is the second, and the
 * three details below were each paid for once already — a second copy would
 * eventually lose one of them silently (the download simply not happening is
 * an easy bug to ship).
 */

/**
 * Save a blob under `fileName`, then release the object URL.
 *
 * Three details that are not optional:
 *
 * - the anchor is APPENDED before it is clicked — Firefox ignores a click on a
 *   detached element and nothing downloads,
 * - the URL is revoked on the NEXT FRAME, not in the same tick — revoking
 *   immediately can cancel the download before the browser has read the blob,
 * - `download` is set, so a text blob is saved rather than navigated to.
 */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}
