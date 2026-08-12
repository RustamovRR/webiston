import { toCyrillic, toLatin } from "@webiston/transliteration"
import { describe, expect, it } from "vitest"

import {
  UZBEK_HUNDRED,
  UZBEK_SCALES,
  UZBEK_TENS,
  UZBEK_UNITS
} from "./constants"
import { amountToWords, capitalise, integerToWords } from "./words"

/**
 * The numerals themselves.
 *
 * This file is the product. Everything else in the tool is a text field and a
 * copy button; if `integerToWords` is wrong, the tool writes a wrong amount
 * onto somebody's invoice, and they will not notice until the bank does.
 *
 * Two kinds of proof, on purpose:
 *
 * 1. **Exact strings** for the cases a human settled — the owner's own
 *    examples, the lex.uz "bir yuz" convention, the shapes real invoices take.
 * 2. **An independent evaluator** that reads the words BACK into a number, run
 *    over the first hundred thousand values and a set of giants. It shares no
 *    code shape with the generator, so a bug would have to be made twice, in
 *    two directions, to survive it.
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
   * The convention the whole tool stands on, settled by the owner and
   * confirmed against the law: WRITTEN Uzbek counts yuz and ming — lex.uz
   * says "bir yuz ellik baravari", a hisob-faktura says "bir ming so'm".
   * Speech drops the "bir"; documents never do, and this tool writes
   * documents.
   */
  it("counts yuz and ming the way official documents do", () => {
    // Arrange / Act / Assert
    expect(words(100)).toBe("bir yuz")
    expect(words(1000)).toBe("bir ming")
    expect(words(100_000)).toBe("bir yuz ming")
    expect(words(1_000_100)).toBe("bir million bir yuz")
    expect(words(1100)).toBe("bir ming bir yuz")
  })

  it("writes the owner's own examples exactly", () => {
    // Arrange / Act / Assert — the two sums the rule was settled on.
    expect(words(1560)).toBe("bir ming besh yuz oltmish")
    expect(words(2560)).toBe("ikki ming besh yuz oltmish")
  })

  it("keeps bir on million and above", () => {
    // Arrange / Act / Assert — same rule, bigger scales.
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
   * 1 000 001 is "bir million bir" — the empty thousands group is silent. The
   * naive version emits "bir million nol ming bir", which is how you can spot
   * a machine-written sum at a glance.
   */
  it("skips empty groups instead of saying nol", () => {
    // Arrange / Act / Assert
    expect(words(1_000_001)).toBe("bir million bir")
    expect(words(BigInt("1000000007"))).toBe("bir milliard yetti")
    expect(words(2_000_500)).toBe("ikki million besh yuz")
  })

  it("handles the awkward shapes around a bare one", () => {
    // Arrange / Act / Assert — each of these has tripped a real
    // implementation somewhere: a one leading a group, trailing a group, or
    // wrapped around an empty tens place.
    expect(words(101)).toBe("bir yuz bir")
    expect(words(110)).toBe("bir yuz o'n")
    expect(words(1001)).toBe("bir ming bir")
    expect(words(1010)).toBe("bir ming o'n")
    expect(words(11_000)).toBe("o'n bir ming")
    expect(words(111_111)).toBe("bir yuz o'n bir ming bir yuz o'n bir")
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
      "to'qqiz kvadrillion yetti trillion bir yuz to'qson to'qqiz milliard ikki yuz ellik to'rt million yetti yuz qirq ming to'qqiz yuz to'qson uch"
    )
  })

  it("names the largest value the scale table can hold", () => {
    // Arrange — 10^18 − 1: every group saturated at 999.
    const group = "to'qqiz yuz to'qson to'qqiz"

    // Act / Assert
    expect(integerToWords(BigInt("999999999999999999"))).toBe(
      `${group} kvadrillion ${group} trillion ${group} milliard ${group} million ${group} ming ${group}`
    )
  })

  it("refuses a value past the scale table rather than half-naming it", () => {
    // Arrange / Act / Assert — 19 digits. A confident sentence describing the
    // wrong amount is the failure mode worth preventing here.
    expect(integerToWords(BigInt(10) ** BigInt(18))).toBeNull()
  })
})

/**
 * Words, read back into a number by code that shares nothing with the
 * generator.
 *
 * The generator splits into groups and walks a table; this walks the WORDS —
 * a unit before `yuz` multiplies, a scale word closes a group. A mistake in
 * one direction (a dropped group, a swapped table entry, a phantom `nol`)
 * cannot cancel out in the other, so agreement over a hundred thousand values
 * is close to a proof, not a spot check. An unknown token throws, so the
 * vocabulary is checked for free.
 */
function evaluate(text: string): bigint {
  const unitOf = new Map<string, number>()
  UZBEK_UNITS.forEach((word, digit) => {
    if (digit > 0) unitOf.set(word, digit)
  })
  UZBEK_TENS.forEach((word, ten) => {
    if (ten > 0) unitOf.set(word, ten * 10)
  })
  const scaleOf = new Map<string, number>()
  UZBEK_SCALES.forEach((word, index) => {
    if (index > 0) scaleOf.set(word, index)
  })

  let total = BigInt(0)
  let group = 0
  let pending = 0
  for (const token of text.split(" ")) {
    if (token === UZBEK_HUNDRED) {
      group += pending * 100
      pending = 0
    } else if (scaleOf.has(token)) {
      const power = scaleOf.get(token) as number
      total += BigInt(group + pending) * BigInt(1000) ** BigInt(power)
      group = 0
      pending = 0
    } else if (unitOf.has(token)) {
      pending += unitOf.get(token) as number
    } else {
      throw new Error(`unknown numeral: "${token}" in "${text}"`)
    }
  }
  return total + BigInt(group + pending)
}

describe("generator against the independent evaluator", () => {
  it("agrees on every value below one hundred thousand", () => {
    // Arrange / Act — plain comparison in the loop; 100 000 `expect` calls
    // would dominate the runtime without adding information.
    const mismatches: string[] = []
    for (let value = 1; value < 100_000; value += 1) {
      const text = integerToWords(BigInt(value))
      if (text === null || evaluate(text) !== BigInt(value)) {
        mismatches.push(`${value} -> ${text}`)
      }
    }

    // Assert
    expect(mismatches).toEqual([])
  })

  it("agrees on the giants", () => {
    // Arrange — one value per scale word, plus the boundaries.
    const giants = [
      "1000000",
      "1000001",
      "999999999",
      "1000000007",
      "123456789012",
      "9007199254740993",
      "123456789012345678",
      "999999999999999999"
    ].map(BigInt)

    // Act / Assert
    for (const value of giants) {
      const text = integerToWords(value)
      expect(text).not.toBeNull()
      expect(evaluate(text as string)).toBe(value)
    }
  })
})

describe("amountToWords", () => {
  const amount = (integer: bigint, fraction = 0, negative = false) => ({
    integer,
    fraction,
    negative
  })

  it("appends so'm in sum mode", () => {
    // Arrange / Act / Assert — the owner's example, with its currency.
    expect(amountToWords(amount(BigInt(1560)), "sum")?.latin).toBe(
      "bir ming besh yuz oltmish so'm"
    )
    expect(amountToWords(amount(BigInt(500_000)), "sum")?.latin).toBe(
      "besh yuz ming so'm"
    )
  })

  it("spells the tiyin out", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt(1_250_000), 50), "sum")?.latin).toBe(
      "bir million ikki yuz ellik ming so'm ellik tiyin"
    )
    // A single-digit fraction is 5 tiyin, not 50 — the parser owns padding.
    expect(amountToWords(amount(BigInt(1000), 5), "sum")?.latin).toBe(
      "bir ming so'm besh tiyin"
    )
  })

  it("leaves a round amount without a nol tiyin", () => {
    // Arrange / Act / Assert — every invoice would carry it otherwise.
    expect(amountToWords(amount(BigInt(1000), 0), "sum")?.latin).toBe(
      "bir ming so'm"
    )
  })

  it("names a zero amount the way a bank form does", () => {
    // Arrange / Act / Assert — "0 so'm 50 tiyin" is a real line on a real
    // payment order.
    expect(amountToWords(amount(BigInt(0), 0), "sum")?.latin).toBe("nol so'm")
    expect(amountToWords(amount(BigInt(0), 50), "sum")?.latin).toBe(
      "nol so'm ellik tiyin"
    )
  })

  it("names a whole number without a currency in plain mode", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt(2026)), "plain")?.latin).toBe(
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
    expect(amountToWords(amount(BigInt(12), 50), "plain")?.latin).toBe(
      "o'n ikki"
    )
  })

  it("says minus in front", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt(400), 0, true), "sum")?.latin).toBe(
      "minus to'rt yuz so'm"
    )
  })

  /**
   * The second script is one call to `@webiston/transliteration`, and it is
   * the reason this tool belongs on this site rather than anywhere else.
   */
  it("hands back the same sum in Cyrillic", () => {
    // Arrange / Act
    const result = amountToWords(amount(BigInt(1_250_000), 50), "sum")

    // Assert
    expect(result?.cyrillic).toBe(
      "бир миллион икки юз эллик минг сўм эллик тийин"
    )
  })

  /**
   * The seam with the transliterator, tested as a round trip.
   *
   * Someone will paste the Cyrillic sum into the converter next door, or feed
   * a Latin sum through `toCyrillic` themselves. If any numeral does not
   * survive the trip — an apostrophe form, a `ў`, a `қ` — the two tools
   * disagree about the same amount on the same site.
   */
  it("round-trips every numeral through the transliterator", () => {
    // Arrange — values chosen to cover the whole vocabulary: every unit, every
    // ten, yuz, and every scale word.
    const values = [
      "1234567890",
      "9876543210",
      "111213141516",
      "999999999999999999",
      "1560"
    ].map(BigInt)

    for (const value of values) {
      // Act
      const latin = integerToWords(value) as string
      const there = toCyrillic(latin)
      const back = toLatin(there)

      // Assert
      expect(back).toBe(latin)
      expect(evaluate(back)).toBe(value)
    }
  })

  it("reports nothing at all rather than a truncated sum", () => {
    // Arrange / Act / Assert
    expect(amountToWords(amount(BigInt(10) ** BigInt(18)), "sum")).toBeNull()
  })
})

describe("capitalise", () => {
  it("raises the first letter, the way a document writes a sum", () => {
    // Arrange / Act / Assert
    expect(capitalise("besh yuz ming so'm")).toBe("Besh yuz ming so'm")
  })

  it("survives an apostrophe in the first word", () => {
    // Arrange / Act / Assert — `o'n` starts with a plain letter, but the
    // apostrophe sits at index 1 and a byte-minded implementation could eat it.
    expect(capitalise("o'n bir so'm")).toBe("O'n bir so'm")
  })

  it("leaves an empty string alone", () => {
    // Arrange / Act / Assert
    expect(capitalise("")).toBe("")
  })
})
