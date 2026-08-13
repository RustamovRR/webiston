import { describe, expect, it } from "vitest"

import {
  isDateOrderValid,
  isValidAddress,
  isValidName,
  isValidPassport,
  isValidPinfl,
  normalisePassport
} from "./validate"

/**
 * The guards between a keyboard and a signed paper. Every rejected shape here
 * is something a real visitor typed — the passport case is verbatim from the
 * owner's screenshot.
 */

describe("isValidPassport", () => {
  it("accepts the three ways people type the same passport", () => {
    // Arrange / Act / Assert
    expect(isValidPassport("AB1234567")).toBe(true)
    expect(isValidPassport("AB 1234567")).toBe(true)
    expect(isValidPassport("ab 1234567")).toBe(true)
  })

  it("rejects the garbage the screenshot showed", () => {
    // Arrange / Act / Assert — 20 digits after two letters went straight onto
    // the sheet before this existed.
    expect(isValidPassport("aa12341234123412341234")).toBe(false)
    expect(isValidPassport("A1234567")).toBe(false)
    expect(isValidPassport("ABC1234567")).toBe(false)
    expect(isValidPassport("AB123456")).toBe(false)
    expect(isValidPassport("1234567AB")).toBe(false)
    expect(isValidPassport("")).toBe(false)
  })
})

describe("normalisePassport", () => {
  it("settles every variant into the printed form", () => {
    // Arrange / Act / Assert
    expect(normalisePassport("ab1234567")).toBe("AB 1234567")
    expect(normalisePassport("AB 1234567")).toBe("AB 1234567")
    expect(normalisePassport(" ab 1234567 ")).toBe("AB 1234567")
  })

  it("leaves an invalid value exactly as typed", () => {
    // Arrange / Act / Assert — normalising garbage would hide it from the
    // validator that is about to flag it.
    expect(normalisePassport("abc123")).toBe("abc123")
  })
})

describe("isValidPinfl", () => {
  it("accepts exactly fourteen digits", () => {
    // Arrange / Act / Assert
    expect(isValidPinfl("30412900123456")).toBe(true)
    expect(isValidPinfl("3041 2900 1234 56")).toBe(true)
  })

  it("rejects anything else", () => {
    // Arrange / Act / Assert
    expect(isValidPinfl("3041290012345")).toBe(false)
    expect(isValidPinfl("304129001234567")).toBe(false)
    expect(isValidPinfl("3041290012345a")).toBe(false)
  })
})

describe("isValidName", () => {
  it("accepts names in either script, with Uzbek apostrophes", () => {
    // Arrange / Act / Assert
    expect(isValidName("Aliyev Vali Salimovich")).toBe(true)
    expect(isValidName("G'ofurov O'ktam")).toBe(true)
    expect(isValidName("Ғофуров Ўктам")).toBe(true)
    expect(isValidName("Sag'dullayeva-Karimova N.")).toBe(true)
  })

  it("rejects digits and near-empty input", () => {
    // Arrange / Act / Assert
    expect(isValidName("12341234")).toBe(false)
    expect(isValidName("Aliyev 2-uy")).toBe(false)
    expect(isValidName("A")).toBe(false)
  })
})

describe("isValidAddress", () => {
  it("wants some letters, allows any real address shape", () => {
    // Arrange / Act / Assert
    expect(isValidAddress("Toshkent shahri, Chilonzor tumani, 12-uy")).toBe(
      true
    )
    expect(isValidAddress("Тошкент, Юнусобод, 5-уй")).toBe(true)
  })

  it("rejects a digits-only address", () => {
    // Arrange / Act / Assert — "12341234" from the screenshot.
    expect(isValidAddress("12341234")).toBe(false)
    expect(isValidAddress("12-uy")).toBe(false)
  })
})

describe("isDateOrderValid", () => {
  it("wants the return on or after the loan", () => {
    // Arrange / Act / Assert
    expect(isDateOrderValid("2026-08-12", "2026-12-31")).toBe(true)
    expect(isDateOrderValid("2026-08-12", "2026-08-12")).toBe(true)
    expect(isDateOrderValid("2026-08-12", "2026-08-11")).toBe(false)
  })

  it("says nothing while either date is missing", () => {
    // Arrange / Act / Assert — half-filled is the normal state of the form.
    expect(isDateOrderValid("", "2026-08-11")).toBe(true)
    expect(isDateOrderValid("2026-08-12", "")).toBe(true)
  })
})
