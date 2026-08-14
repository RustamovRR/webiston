/**
 * Print one element of the page, scoped by a body class.
 *
 * Two details this carries, both paid for in the document family:
 *
 * - The class comes OFF on `afterprint`, not after `window.print()` returns.
 *   Safari can return before its dialog closes, and a class removed too early
 *   prints the whole page chrome.
 * - `document.title` is swapped for the duration. A browser prints the title
 *   in its own header band AND offers it as the filename when the destination
 *   is "Save as PDF" — so a page called "Tilxat Yozish — Tayyor Namuna, Chop
 *   Etish | Webiston" was landing on top of a document someone signs, and
 *   saving under that whole string. The document's own stem is the answer to
 *   both, and it makes the PDF and the .docx come out under one name.
 *
 * The date and URL in that band are the browser's, not ours: the only CSS
 * lever is `@page { margin: 0 }`, which strips the margin from the middle
 * pages of a multi-page document. Correct paper beats cosmetics the reader
 * can switch off in one click.
 */
export function printWithTitle(bodyClass: string, fileTitle: string): void {
  const pageTitle = document.title
  document.title = fileTitle
  document.body.classList.add(bodyClass)
  window.addEventListener(
    "afterprint",
    () => {
      document.body.classList.remove(bodyClass)
      document.title = pageTitle
    },
    { once: true }
  )
  window.print()
}
