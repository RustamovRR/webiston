import { describe, expect, it } from "vitest"

import { formatUzbekDate, initialsOf } from "../../utils/dates"
import { buildTilxat, composeTilxat } from "./compose"
import type { TilxatData } from "./constants"
import { buildSampleTilxat } from "./constants"

/**
 * The document builder is the product: if a required element is missing or a
 * sum is wrong, somebody signs a paper that does not say what they think it
 * says. Every required element from the bank's legal checklist has an
 * assertion here, and the never-refuse contract has its own block.
 */

const FULL: TilxatData = {
  borrower: {
    fullName: "Aliyev Vali Salimovich",
    passport: "AB 1234567",
    pinfl: "",
    address: "Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi, 12-uy"
  },
  lender: {
    fullName: "Karimov Salim Anvarovich",
    passport: "AA 7654321",
    pinfl: "",
    address: "Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi, 5-uy"
  },
  amount: "5 000 000",
  method: "naqd",
  interestFree: true,
  city: "Toshkent shahri",
  givenDate: "2026-08-12",
  returnDate: "2026-12-31",
  witnesses: ["", ""]
}

describe("buildTilxat", () => {
  it("carries every element the legal checklist requires", () => {
    // Arrange / Act
    const { lotin } = buildTilxat(FULL)

    // Assert — both parties in full, the sum twice, both dates, the method.
    expect(lotin).toContain("TILXAT")
    expect(lotin).toContain("Aliyev Vali Salimovich")
    expect(lotin).toContain("AB 1234567")
    expect(lotin).toContain("Chilonzor tumani")
    expect(lotin).toContain("Karimov Salim Anvarovich")
    expect(lotin).toContain("AA 7654321")
    expect(lotin).toContain("5 000 000 (besh million) so'm")
    expect(lotin).toContain("2026-yil 12-avgust")
    expect(lotin).toContain("2026-yil 31-dekabrgacha")
    expect(lotin).toContain("naqd pul ko'rinishida")
    expect(lotin).toContain("Qarz foizsiz berildi.")
    expect(lotin).toContain("Qarz oluvchi: ______________________ Aliyev V.S.")
  })

  it("writes the sum in digits AND words — the element the checklist is strictest about", () => {
    // Arrange / Act
    const { lotin } = buildTilxat({ ...FULL, amount: "12341234" })

    // Assert
    expect(lotin).toContain(
      "12 341 234 (o'n ikki million uch yuz qirq bir ming ikki yuz o'ttiz to'rt) so'm"
    )
  })

  it("moves the currency inside the brackets when there is tiyin", () => {
    // Arrange / Act — a fractional loan is odd but must not be wrong.
    const { lotin } = buildTilxat({ ...FULL, amount: "5000000,50" })

    // Assert
    expect(lotin).toContain("5 000 000,50 (besh million so'm ellik tiyin)")
  })

  /**
   * The passport series is printed in LATIN on the physical document. A
   * Cyrillic tilxat that renders "AB 1234567" as "АБ 1234567" no longer
   * matches the passport it cites — the one mistake that can void the paper.
   */
  it("keeps both passport series in Latin inside the Cyrillic document", () => {
    // Arrange / Act
    const { kirill } = buildTilxat(FULL)

    // Assert
    expect(kirill).toContain("AB 1234567")
    expect(kirill).toContain("AA 7654321")
    expect(kirill).not.toContain("АБ")
    // And the prose around them did convert.
    expect(kirill).toContain("ТИЛХАТ")
    expect(kirill).toContain("беш миллион")
    expect(kirill).toContain("қарзга олдим")
  })

  it("renders a fillable blank form rather than refusing an empty field", () => {
    // Arrange — nothing filled at all: the state every visitor starts in, and
    // the printable blank form some of them actually want.
    const empty: TilxatData = {
      borrower: { fullName: "", passport: "", pinfl: "", address: "" },
      lender: { fullName: "", passport: "", pinfl: "", address: "" },
      amount: "",
      method: "naqd",
      interestFree: true,
      city: "",
      givenDate: "",
      returnDate: "",
      witnesses: ["", ""]
    }

    // Act
    const { lotin } = buildTilxat(empty)

    // Assert — writing lines, not errors; and no accidental words.
    expect(lotin).toContain("______")
    expect(lotin).toContain("TILXAT")
    expect(lotin).not.toContain("undefined")
    expect(lotin).not.toContain("NaN")
  })

  it("blanks an amount it cannot read instead of guessing", () => {
    // Arrange / Act
    const { lotin } = buildTilxat({ ...FULL, amount: "besh million" })

    // Assert
    expect(lotin).toContain("(______________________) so'm")
    expect(lotin).not.toContain("besh million) so'm")
  })

  it("names the card transfer when that is how the money moved", () => {
    // Arrange / Act
    const { lotin } = buildTilxat({ ...FULL, method: "karta" })

    // Assert
    expect(lotin).toContain("bank kartasiga pul o'tkazish orqali")
  })

  it("drops the interest-free sentence when unchecked, adding nothing", () => {
    // Arrange / Act — stating terms the parties did not agree is worse than
    // silence; an unchecked box removes the sentence and invents no other.
    const { lotin } = buildTilxat({ ...FULL, interestFree: false })

    // Assert
    expect(lotin).not.toContain("foizsiz")
    expect(lotin).not.toContain("foiz")
  })

  it("adds the witness block only when there is a witness", () => {
    // Arrange / Act
    const without = buildTilxat(FULL).lotin
    const withOne = buildTilxat({
      ...FULL,
      witnesses: ["Toshmatov Eshmat Akramovich", ""]
    }).lotin

    // Assert
    expect(without).not.toContain("Guvohlar")
    expect(withOne).toContain("Guvohlar:")
    expect(withOne).toContain("1. ______________________ Toshmatov E.A.")
    expect(withOne).not.toContain("2.")
  })

  it("uses ordinary spaces in the digits, never U+202F", () => {
    // Arrange / Act — this paper gets retyped into bank portals; an invisible
    // non-ASCII space is a validator error nobody can see the cause of.
    const { lotin } = buildTilxat(FULL)

    // Assert
    expect(lotin).not.toMatch(/[\u202f\u2212]/)
  })

  /**
   * Validation reaches the paper: a filled-but-garbage field renders as a
   * writing line, never as the garbage. "aa12341234123412341234" is verbatim
   * from the owner's screenshot — it printed, before this.
   */
  it("blanks invalid fields instead of printing them", () => {
    // Arrange / Act
    const { lotin } = buildTilxat({
      ...FULL,
      borrower: {
        fullName: "12341234",
        passport: "aa12341234123412341234",
        pinfl: "",
        address: "12341234"
      }
    })

    // Assert
    expect(lotin).not.toContain("12341234")
    expect(lotin).toContain("Men, ______")
  })

  it("normalises a valid passport onto the paper", () => {
    // Arrange / Act — typed lowercase and unspaced; printed canonical.
    const { lotin } = buildTilxat({
      ...FULL,
      borrower: { ...FULL.borrower, passport: "ab1234567" }
    })

    // Assert
    expect(lotin).toContain("pasport AB 1234567")
  })

  it("adds JSHSHIR only when a valid one is given, shielded from Cyrillic", () => {
    // Arrange / Act
    const withPinfl = buildTilxat({
      ...FULL,
      borrower: { ...FULL.borrower, pinfl: "30412900123456" }
    })

    // Assert
    expect(withPinfl.lotin).toContain("JSHSHIR: 30412900123456")
    expect(withPinfl.kirill).toContain("30412900123456")
    expect(buildTilxat(FULL).lotin).not.toContain("JSHSHIR")
  })

  it("marks exactly the visitor's values as value segments", () => {
    // Arrange / Act — what the preview bolds.
    const values = composeTilxat(FULL)
      .flatMap((entry) => entry.segments)
      .filter((segment) => segment.kind === "value")
      .map((segment) => segment.text)

    // Assert — the name, the sum and the signature are values; the fixed
    // prose is not.
    expect(values).toContain("Aliyev Vali Salimovich")
    expect(values).toContain("5 000 000 (besh million) so'm")
    expect(values).toContain("Aliyev V.S.")
    expect(values).not.toContain("Men, ")
  })
})

describe("formatUzbekDate", () => {
  it("writes the date the way a document does", () => {
    // Arrange / Act / Assert
    expect(formatUzbekDate("2026-08-12")).toBe("2026-yil 12-avgust")
    expect(formatUzbekDate("2026-01-02")).toBe("2026-yil 2-yanvar")
    expect(formatUzbekDate("2026-12-31")).toBe("2026-yil 31-dekabr")
  })

  it("returns null for anything that is not a date", () => {
    // Arrange / Act / Assert — null, so the caller decides what a missing
    // date looks like; the builder renders a writing line.
    expect(formatUzbekDate("")).toBeNull()
    expect(formatUzbekDate("12.08.2026")).toBeNull()
    expect(formatUzbekDate("2026-13-01")).toBeNull()
  })
})

describe("initialsOf", () => {
  it("keeps the surname and initials the rest", () => {
    // Arrange / Act / Assert — the signature-line convention.
    expect(initialsOf("Aliyev Vali Salimovich")).toBe("Aliyev V.S.")
    expect(initialsOf("Karimova Nodira")).toBe("Karimova N.")
  })

  it("leaves a single name alone and empties an empty one", () => {
    // Arrange / Act / Assert — "" not a blank: the BUILDER owns what a
    // missing value looks like on paper.
    expect(initialsOf("Aliyev")).toBe("Aliyev")
    expect(initialsOf("  ")).toBe("")
  })
})

describe("buildSampleTilxat", () => {
  /**
   * The sample is what a first-time visitor judges the tool by, so it must
   * survive the tool's OWN validation — a passport or JSHSHIR that renders as
   * a writing line would advertise the form as broken.
   */
  it("fills every field with something the builder accepts", () => {
    // Arrange / Act
    const segments = composeTilxat(
      buildSampleTilxat(new Date(2026, 7, 12))
    ).flatMap((entry) => entry.segments)

    // Assert — not one `blank` segment left anywhere on the paper.
    expect(segments.filter((segment) => segment.kind === "blank")).toEqual([])
  })

  it("dates the sample from today, returning in the future", () => {
    // Arrange
    // Local constructor, not an ISO string: `new Date("2026-08-12")` is UTC
    // midnight and lands on the 11th in any negative offset.
    const now = new Date(2026, 7, 12)

    // Act
    const sample = buildSampleTilxat(now)

    // Assert — a sample loan already overdue teaches the wrong thing.
    expect(sample.givenDate).toBe("2026-08-12")
    expect(sample.returnDate > sample.givenDate).toBe(true)
    expect(formatUzbekDate(sample.returnDate)).not.toBeNull()
  })
})
