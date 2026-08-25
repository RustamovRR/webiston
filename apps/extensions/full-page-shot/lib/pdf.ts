/**
 * The screenshot as a PDF — no library, ~9 kB of code instead of ~350 kB.
 *
 * WHY PDF AT ALL, when PNG and JPEG already exist. A screenshot is usually on
 * its way somewhere: an email, a Telegram message, a printed report, a
 * complaint to a bank. PNG is an image and behaves like one — it opens in a
 * viewer, it prints at whatever size the viewer feels like, and a 30,000px one
 * prints as a single unreadable strip. PDF is the format that survives that
 * trip: fixed pages, predictable printing, and every office on earth opens it.
 *
 * WHY IT IS PAGINATED. A PDF page may not exceed 200 inches (14,400 pt) on a
 * side, so a long capture cannot be one page even if that were desirable. A4
 * slices are what makes it printable, and A4 rather than Letter because that
 * is the paper in this country.
 *
 * WHY JPEG INSIDE. A PDF image stream is raw, filtered bytes. JPEG drops
 * straight in under `/DCTDecode` with no transformation at all. PNG would mean
 * deflating raw RGB — 144 MB of it for a 1,200×40,000 capture before
 * compression — for a file the user already has losslessly.
 */

/** A4 in PostScript points (72 to the inch), the PDF default unit. */
export const A4 = { width: 595.28, height: 841.89 } as const

export interface PdfImage {
  /** Raw JPEG bytes, embedded verbatim as a `/DCTDecode` stream. */
  jpeg: Uint8Array
  widthPx: number
  heightPx: number
}

const ascii = (text: string) => new TextEncoder().encode(text)

/** PDF cares about exact byte offsets, so the file is assembled as bytes and
 *  never as a string that something might re-encode on the way out. */
class ByteWriter {
  private readonly chunks: Uint8Array[] = []
  length = 0

  push(part: Uint8Array | string): void {
    const bytes = typeof part === "string" ? ascii(part) : part
    this.chunks.push(bytes)
    this.length += bytes.length
  }

  /**
   * `Uint8Array<ArrayBuffer>`, not a bare `Uint8Array`. The bare form widens
   * to `ArrayBufferLike`, which includes `SharedArrayBuffer` and is therefore
   * not a `BlobPart` — the caller wraps this in a Blob, and the narrowing is
   * what lets it.
   */
  concat(): Uint8Array<ArrayBuffer> {
    const out = new Uint8Array(this.length)
    let at = 0
    for (const chunk of this.chunks) {
      out.set(chunk, at)
      at += chunk.length
    }
    return out
  }
}

/** Trailing zeros in a PDF number are noise; 2 decimals is finer than a
 *  printer resolves. */
const pt = (value: number) => Number(value.toFixed(2)).toString()

/**
 * One A4 page per image, each drawn full-width and flush to the TOP.
 *
 * Top rather than centred because the pages are consecutive slices of one
 * continuous screenshot: centring the last, short slice would open a gap in
 * the middle of the document that does not exist on the page it came from.
 */
export function buildPdf(images: PdfImage[]): Uint8Array<ArrayBuffer> {
  if (images.length === 0) throw new Error("buildPdf: no pages")

  const out = new ByteWriter()
  /** `offsets[n]` is the byte position of object `n`. Index 0 is the free
   *  head entry the format requires and nothing ever points at. */
  const offsets: number[] = [0]

  const object = (number: number, body: (writer: ByteWriter) => void): void => {
    offsets[number] = out.length
    out.push(`${number} 0 obj\n`)
    body(out)
    out.push("\nendobj\n")
  }

  out.push("%PDF-1.4\n")
  // A comment of high-bit bytes: it is what tells every tool in the chain to
  // treat the file as binary rather than text. Omitting it is how a PDF gets
  // corrupted by something well-meaning in the middle.
  out.push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))

  // Object numbering, fixed up front so the /Kids array can be written before
  // the pages themselves exist: 1 catalog, 2 page tree, then three per page.
  const pageObject = (index: number) => 3 + index * 3
  const contentObject = (index: number) => 4 + index * 3
  const imageObject = (index: number) => 5 + index * 3
  const total = 2 + images.length * 3

  object(1, (w) => w.push("<< /Type /Catalog /Pages 2 0 R >>"))
  object(2, (w) => {
    const kids = images.map((_, i) => `${pageObject(i)} 0 R`).join(" ")
    w.push(`<< /Type /Pages /Count ${images.length} /Kids [${kids}] >>`)
  })

  images.forEach((image, index) => {
    const drawWidth = A4.width
    const drawHeight = (image.heightPx / image.widthPx) * A4.width
    // PDF's origin is the BOTTOM-left, so "flush to the top" is the page
    // height minus the drawn height — not zero.
    const y = A4.height - drawHeight
    const content = `q ${pt(drawWidth)} 0 0 ${pt(drawHeight)} 0 ${pt(y)} cm /X0 Do Q`

    object(pageObject(index), (w) =>
      w.push(
        `<< /Type /Page /Parent 2 0 R ` +
          `/MediaBox [0 0 ${pt(A4.width)} ${pt(A4.height)}] ` +
          `/Resources << /XObject << /X0 ${imageObject(index)} 0 R >> >> ` +
          `/Contents ${contentObject(index)} 0 R >>`
      )
    )
    object(contentObject(index), (w) => {
      w.push(`<< /Length ${content.length} >>\nstream\n`)
      w.push(content)
      w.push("\nendstream")
    })
    object(imageObject(index), (w) => {
      w.push(
        `<< /Type /XObject /Subtype /Image ` +
          `/Width ${image.widthPx} /Height ${image.heightPx} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ` +
          `/Length ${image.jpeg.length} >>\nstream\n`
      )
      w.push(image.jpeg)
      w.push("\nendstream")
    })
  })

  // The cross-reference table. Every entry is EXACTLY 20 bytes — readers seek
  // into this by multiplication, so a byte of drift makes the file unopenable.
  const xrefAt = out.length
  out.push(`xref\n0 ${total + 1}\n`)
  out.push("0000000000 65535 f \n")
  for (let n = 1; n <= total; n++) {
    out.push(`${String(offsets[n] ?? 0).padStart(10, "0")} 00000 n \n`)
  }
  out.push(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\n`)
  out.push(`startxref\n${xrefAt}\n%%EOF\n`)

  return out.concat()
}

/**
 * How far back a page break may be pulled to land in white space.
 *
 * A screenshot sliced at a fixed interval cuts through whatever happens to be
 * at that height — usually the middle of a line of text, which is the one
 * thing that makes a paginated screenshot look machine-made. Pulling the cut
 * up to the quietest row nearby costs a little white space at the bottom of
 * some pages and buys a break that reads as deliberate.
 *
 * 12% of a page: enough to clear a paragraph, small enough that a page is
 * never conspicuously short, and it only ever moves the cut EARLIER so no
 * page can overflow its sheet.
 */
export const BREAK_WINDOW = 0.12

/**
 * The quietest row in a band — the one with the smallest spread between its
 * lightest and darkest pixel.
 *
 * A row of body text swings from the page background to the ink colour; a row
 * of margin barely moves. Range beats an average here because an average
 * cannot tell "uniform grey" from "black and white in equal measure".
 *
 * Ties go to the LAST row, so an all-white band cuts at the bottom of the
 * window and the page stays as full as it can.
 */
export function findQuietRow(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let bestRow = height - 1
  let bestRange = Number.POSITIVE_INFINITY
  for (let y = 0; y < height; y++) {
    let min = 255
    let max = 0
    const row = y * width * 4
    // Every fourth pixel: text is never one pixel wide at these resolutions,
    // and the sampling makes this cheap enough to run per page break.
    for (let x = 0; x < width; x += 4) {
      const at = row + x * 4
      // `noUncheckedIndexedAccess` is on: a typed array still widens to
      // `| undefined` here, and the fallback costs nothing.
      const r = pixels[at] ?? 0
      const g = pixels[at + 1] ?? 0
      const b = pixels[at + 2] ?? 0
      const l = (r * 3 + g * 6 + b) / 10
      if (l < min) min = l
      if (l > max) max = l
    }
    const range = max - min
    if (range <= bestRange) {
      bestRange = range
      bestRow = y
    }
  }
  return bestRow
}

/** How tall one A4 slice is, in the source image's own pixels. */
export function sliceHeightPx(imageWidthPx: number): number {
  return Math.max(1, Math.floor(imageWidthPx * (A4.height / A4.width)))
}

/** How many A4 pages an image of this size becomes. */
export function pageCount(imageWidthPx: number, imageHeightPx: number): number {
  return Math.max(1, Math.ceil(imageHeightPx / sliceHeightPx(imageWidthPx)))
}
