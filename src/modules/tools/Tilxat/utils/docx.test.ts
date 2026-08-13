import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { buildSampleTilxat } from "../constants"
import { composeTilxat } from "./document"
import { downloadTilxatDocx } from "./docx"

/**
 * The export is the one path whose output nobody can eyeball in a diff, so
 * the test opens the file it produces: a .docx is a ZIP, and a ZIP starts
 * "PK". A stub that silently produced an empty blob would pass any assertion
 * weaker than this one.
 */

let saved: { blob: Blob; name: string } | null = null

beforeEach(() => {
  saved = null
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: (blob: Blob) => {
      saved = { blob, name: saved?.name ?? "" }
      return "blob:stub"
    },
    revokeObjectURL: () => {}
  })
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    if (saved) saved.name = this.download
  })
  vi.stubGlobal("requestAnimationFrame", (fn: () => void) => {
    fn()
    return 0
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("downloadTilxatDocx", () => {
  it("writes a real .docx for the filled sheet", async () => {
    // Arrange
    const { lotin } = composeTilxat(buildSampleTilxat(new Date(2026, 7, 12)))

    // Act
    await downloadTilxatDocx(lotin, "TILXAT", "tilxat")

    // Assert — named correctly, and genuinely a Word file (ZIP magic "PK").
    expect(saved?.name).toBe("tilxat.docx")
    const bytes = new Uint8Array(await saved!.blob.arrayBuffer())
    expect(bytes.length).toBeGreaterThan(1000)
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK")
  })

  it("exports the blank form too, rather than refusing", async () => {
    // Arrange — the never-refuse contract reaches this path as well: a blank
    // tilxat is a printable form, so it must be a downloadable one.
    const { lotin } = composeTilxat({
      borrower: { fullName: "", passport: "", pinfl: "", address: "" },
      lender: { fullName: "", passport: "", pinfl: "", address: "" },
      amount: "",
      method: "naqd",
      interestFree: true,
      city: "",
      givenDate: "",
      returnDate: "",
      witnesses: ["", ""]
    })

    // Act
    await downloadTilxatDocx(lotin, "TILXAT", "tilxat")

    // Assert
    expect(saved?.blob.size).toBeGreaterThan(1000)
  })
})
