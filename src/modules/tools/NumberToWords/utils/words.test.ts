import { describe, expect, it } from "vitest"

import { amountToWords, capitalise, integerToWords } from "./words"

/**
 * The numerals themselves.
 *
 * This file is the product. Everything else in the tool is a text field and a
 * copy button; if `integerToWords` is wrong, the tool writes a wrong amount
 * onto somebody's invoice, and they will not notice until the bank does.
 *
 * The cases are grouped by the mistake they catch rather than by size.
 */

const words = (value: number | bigint) => integerToWords(BigInt(value))

describe("integerToWords", () => {
  it("names every digit", () => {
    // Arrange / Act / Assert
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(words)).toEqual([
      "nol",
      "bir",
      "ikki",
      "uch",
      "to'rt",
      "besh",
      "olti",
      "yetti",
      "sakkiz",
      "to'qqiz"
    ])
  })

  it("names every ten", () => {
    // Arrange / Act / Assert — `qirq` and `sakson` are the two an incomplete
    // table usually drops, because they break the pattern of the others.
    expect([10, 20, 30, 40, 50, 60, 70, 80, 90].map(words)).toEqual([
      "o'n",
      "yigirma",
      "o'ttiz",
      "qirq",
      "ellik",
      "oltmish",
      "yetmish",
      "sakson",
      "to'qson"
    ])
  })

  it("joins a ten and a unit without a connector", () => {
    // Arrange / Act / Assert — Uzbek has no "and" here, unlike English.
    expect(words(11)).toBe("o'n bir")
    expect(words(21)).toBe("yigirma bir")
    expect(words(99)).toBe("to'qson to'qqiz")
  })

  /**
   * The single most likely bug in any Uzbek implementation.
   *
   * `yuz` and `ming` are native numerals and stand alone at one: 100 is "yuz",
   * 1000 is "ming". A leading `bir` reads as a translation from Russian, and
   * every naive `${unit} ${scale}` loop produces it.
   */
  it("says yuz and ming, never bir yuz or bir ming", () => {
    // Arrange / Act / Assert
    expect(words(100)).toBe("yuz")
    expect(words(1000)).toBe("ming")
    expect(words(100_000)).toBe("yuz ming")
    expect(words(1_000_100)).toBe("bir million yuz")
  })

  /**
   * The mirror of the case above, and it is NOT symmetric.
   *
   * `million` and up are borrowed nouns that have to be counted, so 10^6 is
   * "bir million". An implementation that strips `bir` everywhere for
   * consistency gets this one wrong in the other direction.
   */
  it("keeps bir on million and above", () => {
    // Arrange / Act / Assert
    expect(words(1_000_000)).toBe("bir million")
    expect(words(1_000_000_000)).toBe("bir milliard")
    expect(words(BigInt("1000000000000"))).toBe("bir trillion")
  })

  it("counts hundreds above one", () => {
    // Arrange / Act / Assert
    expect(words(200)).toBe("ikki yuz")
    expect(words(900)).toBe("to'qqiz yuz")
    expect(words(999)).toBe("to'qqiz yuz to'qson to'qqiz")
  })

  /**
   * A zero group must produce NOTHING, not "nol".
   *
   * 1,000,001 is "bir million bir" — the empty thousands group is silent. The
   * naive version emits "bir million nol ming bir", which is how you can spot
   * a machine-written sum at a glance.
   */
  it("skips empty groups instead of saying nol", () => {
    // Arrange / Act / Assert
    expect(words(1_000_001)).toBe("bir million bir")
    expect(words(BigInt("1000000007"))).toBe("bir milliard yetti")
    expect(words(2_000_500)).toBe("ikki million besh yuz")
  })

  it("writes a real invoice amount", () => {
    // Arrange / Act / Assert — 1 250 000 is the shape of most sums this tool
    // will ever see.
    expect(words(1_250_000)).toBe("bir million ikki yuz ellik ming")
    expect(words(204_564)).toBe("ikki yuz to'rt ming besh yuz oltmish to'rt")
    expect(words(12_345)).toBe("o'n ikki ming uch yuz qirq besh")
  })

  /**
   * Past 2^53 a `number` stops being exact, and the parser hands over a
   * bigint for exactly this reason. If the words function converts back to
   * `number` anywhere, this case comes out as a different amount.
   */
  it("stays exact past the safe-integer boundary", () => {
    // Arrange
    const value = BigInt("9007199254740993") // 2^53 + 1, unrepresentable as Number

    // Act / Assert — the final "uch" is the bit `Number` would have lost.
    expect(integerToWords(value)).toBe(
      "to'qqiz kvadrillion yetti trillion yuz to'qson to'qqiz milliard ikki yuz ellik to'rt million yetti yuz qirq ming to'qqiz yuz to'qson uch"
    )
  })

  it("refuses a value past the scale table rather than half-naming it", () => {
    // Arrange / Act / Assert — 19 digits. A confident sentence describing the
    // wrong amount is the failure mode worth preventing here.
    expect(integerToWords(BigInt("10") ** BigInt("18"))).toBeNull()
  })
})

describe("amountToWords", () => {
  const amount = (integer: bigint, fraction = 0, negative = false) => ({
    integer,
    fraction,
    negative
  })

  it("appends so'm in sum mode", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt("500000")), "sum")?.latin).toBe(
      "besh yuz ming so'm"
    )
  })

  it("spells the tiyin out", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt("1250000"), 50), "sum")?.latin).toBe(
      "bir million ikki yuz ellik ming so'm ellik tiyin"
    )
  })

  it("leaves a round amount without a nol tiyin", () => {
    // Arrange / Act / Assert — every invoice would carry it otherwise.
    expect(amountToWords(amount(BigInt("1000"), 0), "sum")?.latin).toBe(
      "ming so'm"
    )
  })

  it("names a whole number without a currency in plain mode", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt("2026")), "plain")?.latin).toBe(
      "ikki ming yigirma olti"
    )
  })

  /**
   * Uzbek reads a decimal as a fraction — 12.5 is "o'n ikki butun besh
   * o'ndan", and the denominator changes with the number of places. Rather
   * than get that subtly wrong, `plain` mode names the whole part and the UI
   * says the rest was left out.
   */
  it("ignores the fractional part in plain mode instead of inventing grammar", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt("12"), 50), "plain")?.latin).toBe(
      "o'n ikki"
    )
  })

  it("says minus in front", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt("400"), 0, true), "sum")?.latin).toBe(
      "minus to'rt yuz so'm"
    )
  })

  /**
   * The second script is one call to `@webiston/transliteration`, and it is
   * the reason this tool belongs on this site rather than anywhere else.
   */
  it("hands back the same sum in Cyrillic", () => {
    // Arrange / Act
    const result = amountToWords(amount(BigInt("1250000"), 50), "sum")

    // Assert
    expect(result?.cyrillic).toBe(
      "бир миллион икки юз эллик минг сўм эллик тийин"
    )
  })

  it("reports nothing at all rather than a truncated sum", () => {
    // Arrange / Act / Assert
    expect(
      amountToWords(amount(BigInt("10") ** BigInt("18")), "sum")
    ).toBeNull()
  })
})

describe("capitalise", () => {
  it("raises the first letter, the way a document writes a sum", () => {
    // Arrange / Act / Assert
    expect(capitalise("besh yuz ming so'm")).toBe("Besh yuz ming so'm")
  })

  it("leaves an empty string alone", () => {
    // Arrange / Act / Assert
    expect(capitalise("")).toBe("")
  })
})
