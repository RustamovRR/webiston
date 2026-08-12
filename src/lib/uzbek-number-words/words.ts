import { toCyrillic } from "@webiston/transliteration"
import type { Amount } from "./amount"
import {
  CURRENCY_MAJOR,
  CURRENCY_MINOR,
  type OutputMode,
  UZBEK_HUNDRED,
  UZBEK_SCALES,
  UZBEK_TENS,
  UZBEK_UNITS
} from "./constants"

/**
 * The sum, in Uzbek words. Both scripts.
 *
 * The Cyrillic half is one call to `@webiston/transliteration` — the package
 * this site already ships and already tests — which is the whole reason this
 * tool belongs here rather than anywhere else. Every competitor would have to
 * write and maintain a transliteration engine to offer the second script;
 * here it is an import.
 */

export interface SumInWords {
  latin: string
  cyrillic: string
}

/**
 * `0n` and `1000n` would be the readable spelling, but this repo targets
 * ES2017 (`tsconfig.json`) and TypeScript rejects a bigint literal below
 * ES2020. Raising the target for one tool would change the emit for all 269
 * routes, so the constants are hoisted here instead of calling `BigInt()`
 * inside the division loop.
 */
const ZERO = BigInt(0)
const GROUP_BASE = BigInt(1000)

/**
 * One group of three digits, 1–999.
 *
 * `100` is `bir yuz`, with the digit counted. Speech drops the `bir`; the
 * WRITTEN form — the one on a hisob-faktura, and the one Uzbek law itself
 * uses ("bir yuz ellik baravari", lex.uz) — keeps it, and this tool writes
 * documents. The rule is uniform across yuz and every scale word, which is
 * why this function has no branches on the value being one.
 */
function groupToWords(group: number): string {
  const parts: string[] = []
  const hundreds = Math.floor(group / 100)
  const tens = Math.floor((group % 100) / 10)
  const units = group % 10

  if (hundreds > 0) {
    parts.push(UZBEK_UNITS[hundreds], UZBEK_HUNDRED)
  }
  if (tens > 0) parts.push(UZBEK_TENS[tens])
  if (units > 0) parts.push(UZBEK_UNITS[units])

  return parts.join(" ")
}

/**
 * Split into groups of three, low-order first, without ever leaving bigint.
 *
 * Going through `Number` here would defeat the point of parsing into a bigint
 * in the first place: the value can exceed 2^53, and one rounded group is a
 * sum that reads back as a different sum.
 */
function groupsOf(value: bigint): number[] {
  const groups: number[] = []
  let rest = value
  while (rest > ZERO) {
    groups.push(Number(rest % GROUP_BASE))
    rest /= GROUP_BASE
  }
  return groups
}

/**
 * A whole number in words, or `null` when it is past the scale table.
 *
 * `null` rather than a partial answer: the caller shows "too large", which is
 * the honest outcome. Naming only the groups we have words for would produce a
 * confident sentence describing the wrong amount.
 */
export function integerToWords(value: bigint): string | null {
  if (value === ZERO) return UZBEK_UNITS[0]

  const groups = groupsOf(value)
  if (groups.length > UZBEK_SCALES.length) return null

  const parts: string[] = []
  // High-order first, which is the order they are spoken in. Every non-zero
  // group is fully named — 1 000 is "bir ming", never "ming"; a zero group is
  // fully SILENT — 1 000 001 is "bir million bir", never "... nol ming bir".
  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const group = groups[index]
    if (group === 0) continue

    parts.push(groupToWords(group))
    if (index > 0) parts.push(UZBEK_SCALES[index])
  }

  return parts.join(" ")
}

/**
 * The finished line, in both scripts.
 *
 * In `sum` mode the tiyin part is spelled out only when it is non-zero. An
 * invoice for a round amount says "besh yuz ming so'm"; adding "nol tiyin" to
 * every one of them is noise, and the digits are on screen beside it.
 *
 * **`plain` mode names whole numbers only, and that is deliberate.** Uzbek
 * reads a decimal as a fraction — 12.5 is "o'n ikki butun besh o'ndan", and
 * the denominator changes with the number of places. Getting that subtly wrong
 * on a document is worse than not offering it, so the fractional part is left
 * out here and the caller says so. In `sum` mode there is no such problem: the
 * hundredth of a so'm has a name, and it is `tiyin`.
 */
export function amountToWords(
  amount: Amount,
  mode: OutputMode
): SumInWords | null {
  const whole = integerToWords(amount.integer)
  if (whole === null) return null

  const parts: string[] = []
  if (amount.negative) parts.push("minus")
  parts.push(whole)
  if (mode === "sum") parts.push(CURRENCY_MAJOR)

  if (mode === "sum" && amount.fraction > 0) {
    const minor = integerToWords(BigInt(amount.fraction))
    if (minor === null) return null
    parts.push(minor, CURRENCY_MINOR)
  }

  const latin = parts.join(" ")
  return { latin, cyrillic: toCyrillic(latin) }
}

/**
 * The first letter raised, the way a sum is written on a document.
 *
 * Applied at the edge rather than inside `integerToWords`, so the words
 * function stays composable — the tiyin half must not be capitalised.
 */
export function capitalise(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text
}
