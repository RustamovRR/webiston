import { describe, expect, it } from "vitest"

import { A4, buildPdf, pageCount, sliceHeightPx } from "../lib/pdf"

/**
 * A PDF is a byte format with self-referential offsets: a reader seeks to the
 * position the xref table names and expects an object header to be sitting
 * there. Nothing about that shows up as a type error, and a file that is one
 * byte out simply fails to open. So the tests check the OFFSETS, not the text.
 */

/** Stand-in image data. `buildPdf` embeds the bytes verbatim and never parses
 *  them, so the contents only need to be recognisable. */
const fakeJpeg = (marker: number) =>
  new Uint8Array([0xff, 0xd8, 0xff, marker, 0x00, 0x10, 0xff, 0xd9])

const decode = (bytes: Uint8Array) => new TextDecoder("latin1").decode(bytes)

describe("buildPdf", () => {
  it("writes xref offsets that land exactly on their object headers", () => {
    // Arrange
    const pages = [
      { jpeg: fakeJpeg(0xe0), widthPx: 1200, heightPx: 1697 },
      { jpeg: fakeJpeg(0xe1), widthPx: 1200, heightPx: 400 }
    ]

    // Act
    const bytes = buildPdf(pages)
    const text = decode(bytes)

    // Assert — every entry after the free head must point at "<n> 0 obj".
    const table = text.slice(text.lastIndexOf("\nxref\n") + 6)
    const entries = table.split("\n").slice(1)
    const offsets = entries
      .filter((line) => line.endsWith(" 00000 n "))
      .map((line) => Number(line.slice(0, 10)))
    expect(offsets).toHaveLength(2 + pages.length * 3)
    offsets.forEach((offset, index) => {
      expect(text.slice(offset, offset + 8)).toContain(`${index + 1} 0 obj`)
    })
  })

  it("keeps every xref entry exactly 20 bytes", () => {
    // Arrange
    const bytes = buildPdf([
      { jpeg: fakeJpeg(0xe0), widthPx: 800, heightPx: 900 }
    ])
    const text = decode(bytes)

    // Act
    // Past "xref" AND past the "0 <count>" subsection header that follows it.
    const start = text.indexOf("xref\n")
    const firstEntry = text.indexOf("\n", text.indexOf("\n", start) + 1) + 1
    const body = text.slice(firstEntry, text.indexOf("trailer"))

    // Assert — readers index into this table by multiplication.
    expect(body.length % 20).toBe(0)
  })

  it("points startxref at the xref keyword", () => {
    // Arrange
    const text = decode(
      buildPdf([{ jpeg: fakeJpeg(0xe0), widthPx: 800, heightPx: 900 }])
    )

    // Act
    const at = text.lastIndexOf("startxref\n") + "startxref\n".length
    const declared = Number(text.slice(at, text.indexOf("\n", at)))

    // Assert
    expect(text.slice(declared, declared + 4)).toBe("xref")
  })

  it("embeds the image bytes verbatim", () => {
    // Arrange
    const jpeg = fakeJpeg(0xe2)

    // Act
    const bytes = buildPdf([{ jpeg, widthPx: 100, heightPx: 100 }])

    // Assert — a re-encode anywhere in the path would corrupt the stream.
    const needle = decode(jpeg)
    expect(decode(bytes)).toContain(needle)
  })

  it("gives every page an A4 MediaBox and draws flush to the top", () => {
    // Arrange — a short last slice is the case that would otherwise float.
    const pages = [{ jpeg: fakeJpeg(0xe0), widthPx: 600, heightPx: 300 }]

    // Act
    const text = decode(buildPdf(pages))

    // Assert
    expect(text).toContain(`/MediaBox [0 0 ${A4.width} ${A4.height}]`)
    // 600×300 at A4 width draws 297.64pt tall, so its origin is the page
    // height minus that — not 0, which would drop it to the bottom.
    const drawn = (300 / 600) * A4.width
    expect(text).toContain(`0 ${Number((A4.height - drawn).toFixed(2))} cm`)
  })

  it("declares as many /Kids as it writes pages", () => {
    // Arrange
    const pages = Array.from({ length: 5 }, () => ({
      jpeg: fakeJpeg(0xe0),
      widthPx: 1000,
      heightPx: 1414
    }))

    // Act
    const text = decode(buildPdf(pages))

    // Assert
    expect(text).toContain("/Count 5")
    expect(text.match(/\/Type \/Page\b/g)).toHaveLength(5)
  })

  it("refuses to write a PDF with no pages", () => {
    // Arrange / Act / Assert
    expect(() => buildPdf([])).toThrow()
  })
})

describe("pagination", () => {
  it("slices at the A4 aspect ratio of the captured width", () => {
    // Arrange / Act
    const slice = sliceHeightPx(1200)

    // Assert
    expect(slice).toBe(Math.floor(1200 * (A4.height / A4.width)))
  })

  it("never reports zero pages for a real image", () => {
    // Arrange / Act / Assert — a 1px-tall capture is still one page.
    expect(pageCount(1200, 1)).toBe(1)
  })

  it("counts a partial last page", () => {
    // Arrange
    const slice = sliceHeightPx(1200)

    // Act / Assert
    expect(pageCount(1200, slice * 3 + 1)).toBe(4)
  })
})
