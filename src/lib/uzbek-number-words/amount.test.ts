import { describe, expect, it } from "vitest"

import { formatAmount, parseAmount } from "./amount"

/**
 * Reading what people actually paste.
 *
 * Nobody types a bare integer into an invoice field: the amount arrives out of
 * 1C, out of a spreadsheet, or off a keyboard that inserts spaces. Every case
 * here is a real shape a sum comes in, and the tool has to read all of them or
 * it gets abandoned at the first paste.
 */

const parsed = (input: string) => {
  const result = parseAmount(input)
  return result.ok ? result.amount : result.error
}

describe("parseAmount", () => {
  it("reads a plain integer", () => {
    // Arrange / Act / Assert
    expect(parsed("1250000")).toMatchObject({
      integer: BigInt("1250000"),
      fraction: 0
    })
  })

  it("reads the spaces a keyboard and a spreadsheet put in", () => {
    // Arrange / Act / Assert — ordinary, non-breaking and narrow no-break
    // space. The last two are what a copy out of a spreadsheet carries, and
    // they look identical on screen to the one a naive `replace(/ /g)` strips.
    expect(parsed("1 250 000")).toMatchObject({ integer: BigInt("1250000") })
    expect(parsed("1 250 000")).toMatchObject({ integer: BigInt("1250000") })
    expect(parsed("1 250 000")).toMatchObject({ integer: BigInt("1250000") })
  })

  it("reads both thousand-separator conventions", () => {
    // Arrange / Act / Assert — English and Continental, both common here.
    expect(parsed("1,250,000")).toMatchObject({ integer: BigInt("1250000") })
    expect(parsed("1.250.000")).toMatchObject({ integer: BigInt("1250000") })
  })

  it("reads tiyin after either decimal mark", () => {
    // Arrange / Act / Assert
    expect(parsed("1250000,50")).toMatchObject({
      integer: BigInt("1250000"),
      fraction: 50
    })
    expect(parsed("1250000.50")).toMatchObject({
      integer: BigInt("1250000"),
      fraction: 50
    })
  })

  /**
   * Both marks present at once: the LAST one is the decimal point.
   *
   * `1,250,000.50` is English, `1.250.000,50` is Continental, and the rule
   * reads both without being told which is which.
   */
  it("takes the last mark as the decimal when both appear", () => {
    // Arrange / Act / Assert
    expect(parsed("1,250,000.50")).toMatchObject({
      integer: BigInt("1250000"),
      fraction: 50
    })
    expect(parsed("1.250.000,50")).toMatchObject({
      integer: BigInt("1250000"),
      fraction: 50
    })
  })

  /**
   * The one genuinely ambiguous input, decided on purpose.
   *
   * `1.500` is either one and a half or fifteen hundred, and nothing in the
   * string says which. It is read as THOUSANDS, because this is a money tool:
   * sums are written with a thousands separator far more often than with three
   * decimal places, and so'm has only two of those.
   */
  it("reads a lone separator before exactly three digits as thousands", () => {
    // Arrange / Act / Assert
    expect(parsed("1.500")).toMatchObject({
      integer: BigInt("1500"),
      fraction: 0
    })
    expect(parsed("1,500")).toMatchObject({
      integer: BigInt("1500"),
      fraction: 0
    })
    // Two digits is unambiguous — nobody groups thousands in pairs.
    expect(parsed("1.50")).toMatchObject({ integer: BigInt("1"), fraction: 50 })
  })

  it("pads and truncates the fraction to tiyin", () => {
    // Arrange / Act / Assert — `.5` is fifty tiyin, not five, and a fourth
    // decimal place has no meaning in so'm.
    //
    // `10.567` is deliberately NOT here: three digits after a lone separator
    // is the ambiguous case, and it is read as thousands — see the test above.
    expect(parsed("10.5")).toMatchObject({
      integer: BigInt("10"),
      fraction: 50
    })
    expect(parsed("10.56")).toMatchObject({
      integer: BigInt("10"),
      fraction: 56
    })
    expect(parsed("10.5678")).toMatchObject({
      integer: BigInt("10"),
      fraction: 56
    })
  })

  it("keeps a leading minus", () => {
    // Arrange / Act / Assert
    expect(parsed("-400")).toMatchObject({
      integer: BigInt("400"),
      negative: true
    })
  })

  it("does not let minus survive on a zero", () => {
    // Arrange / Act / Assert — "-0" would otherwise come out of the words
    // function as "minus nol so'm", which no document has ever said. A
    // negative fraction-only amount is real, though: -0,50 is minus fifty
    // tiyin.
    expect(parsed("-0")).toMatchObject({
      integer: BigInt("0"),
      negative: false
    })
    expect(parsed("-0,00")).toMatchObject({
      integer: BigInt("0"),
      negative: false
    })
    expect(parsed("-0,50")).toMatchObject({ fraction: 50, negative: true })
  })

  it("drops leading zeros without losing the number", () => {
    // Arrange / Act / Assert
    expect(parsed("007")).toMatchObject({ integer: BigInt("7") })
    expect(parsed("0")).toMatchObject({ integer: BigInt("0") })
  })

  /**
   * Refuses rather than guesses.
   *
   * The amount is going onto a document. A parser that quietly reads `12ab`
   * as 12 writes a sum nobody checked.
   */
  it("refuses anything that is not a number", () => {
    // Arrange / Act / Assert
    expect(parsed("12ab")).toBe("invalid")
    expect(parsed("ming so'm")).toBe("invalid")
    expect(parsed("1e6")).toBe("invalid")
    expect(parsed("-")).toBe("invalid")
    expect(parsed("...")).toBe("invalid")
  })

  it("reports an empty field as empty, not as invalid", () => {
    // Arrange / Act / Assert — one is a state, the other is a mistake, and
    // showing a red error on a field nobody has typed in yet is wrong.
    expect(parsed("")).toBe("empty")
    expect(parsed("   ")).toBe("empty")
  })

  it("refuses a value longer than the scale table can name", () => {
    // Arrange / Act / Assert — 19 digits.
    expect(parsed("1".repeat(19))).toBe("tooLarge")
    expect(parsed("1".repeat(18))).toMatchObject({
      integer: BigInt("1".repeat(18))
    })
  })

  /**
   * `Number` stops being exact above 2^53. The parser hands back a bigint so a
   * pasted sum cannot come back as a different sum.
   */
  it("keeps a value past the safe-integer boundary exact", () => {
    // Arrange / Act / Assert
    expect(parsed("9007199254740993")).toMatchObject({
      integer: BigInt("9007199254740993")
    })
  })
})

describe("formatAmount", () => {
  /**
   * The separator is U+202F, a NARROW NO-BREAK space, and it is spelled by
   * codepoint here rather than typed — an ordinary space looks identical in
   * the editor and would make this test a coin flip nobody could debug.
   *
   * No-break, because a sum that wraps between its thousands is unreadable
   * exactly when it is longest.
   */
  const GAP = "\u202f"

  it("groups the digits so a missing zero can be caught by eye", () => {
    // Arrange / Act / Assert
    expect(
      formatAmount({ integer: BigInt("1250000"), fraction: 0, negative: false })
    ).toBe(`1${GAP}250${GAP}000`)
  })

  it("shows the tiyin only when there is any", () => {
    // Arrange / Act / Assert
    expect(
      formatAmount({ integer: BigInt("1000"), fraction: 5, negative: false })
    ).toBe(`1${GAP}000,05`)
    expect(
      formatAmount({ integer: BigInt("1000"), fraction: 0, negative: false })
    ).toBe(`1${GAP}000`)
  })
})
