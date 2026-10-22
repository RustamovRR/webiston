/**
 * Letter-level conversion between the 1995 and the 2027 Uzbek Latin alphabets.
 *
 * Pure functions over Latin text: no protection, no Cyrillic. The public
 * entry point, `toUzbekScript`, runs them inside the same protect → convert →
 * restore cycle as `toLatin` and `toCyrillic`, so links, code and product
 * names are never touched.
 *
 * The two alphabets differ by four letters (see `mappings/latin-2027.ts`), so
 * the substitutions are trivial. The work is in three apostrophe decisions,
 * each of which the 1995 spelling leaves to context:
 *
 *   1. `o'` is ö before a letter, or as a word of its own — an initial
 *      (Ö. Hoşimov), a vocative (Ö, Vatan!). At the END of a longer word it is
 *      not: word-final ў does not occur in Uzbek, so `kino'` is a word and a
 *      quote mark. `g'` is different — tog', bog', sog' end in it — so it
 *      converts at the end of a word too, unless `findQuoteMarks` says that
 *      apostrophe closes a quotation.
 *   2. An apostrophe BETWEEN TWO LETTERS is the tutuq and is written as
 *      U+02BC, the mark both the 1995 and the 2027 texts use for it. One
 *      anywhere else is a quotation mark and stays what it was.
 *   3. `s'h` keeps its tutuq. The 1995 rules (§17) put it there because s+h
 *      would otherwise read as sh; with Ş in the alphabet that reason is gone,
 *      but no new rule has replaced §17 yet, and keeping the mark is the
 *      reading that is right under both.
 */

import { isUpperCase, normalizeApostrophes } from "./helpers"
import {
  LATIN_2027_LETTER_CHARS,
  LATIN_2027_LETTERS,
  LATIN_2027_LOOKALIKES,
  type Latin2027Letter,
  TUTUQ_BELGISI
} from "./mappings"
import { findQuoteMarks } from "./quotes"

const LETTER = /\p{L}/u

function isLetter(char: string | undefined): boolean {
  return char !== undefined && LETTER.test(char)
}

const BY_OLD_SPELLING = new Map(
  LATIN_2027_LETTERS.map((letter) => [letter.old, letter])
)

const BY_NEW_LETTER = new Map<
  string,
  { letter: Latin2027Letter; upper: boolean }
>(
  LATIN_2027_LETTERS.flatMap((letter) => [
    [letter.upper, { letter, upper: true }],
    [letter.lower, { letter, upper: false }]
  ])
)

/**
 * One scan each, to skip work that is not there.
 *
 * Every function below runs on every keystroke over the whole text, and on
 * ordinary 1995-Latin or Cyrillic prose — nearly all of it — there is nothing
 * for them to do. Without these guards each call still copied the text: NFC,
 * six look-alike passes, a character-by-character rebuild. Linear, but enough
 * garbage that the engine's own linear-time test (`-tsiya`, 230 KB) began
 * failing under the full suite's parallel load — 2 runs in 3. A regex test
 * allocates nothing.
 */
const NEW_LETTER = new RegExp(`[${LATIN_2027_LETTER_CHARS}]`)
const LOOKALIKE = new RegExp(
  `[${LATIN_2027_LOOKALIKES.map(([lookalike]) => lookalike).join("")}]`
)
const COMBINING_MARK = /\p{M}/u

/**
 * The new letters as the law writes them, whatever was typed.
 *
 * NFC first: it composes s + U+0327 into ş and g + U+0306 into ğ — the
 * spellings a keyboard without the letters produces — and turns ǵ and ŏ typed
 * as base + accent into the precomposed look-alikes the table then replaces.
 */
export function normaliseLatin2027(text: string): string {
  let result = COMBINING_MARK.test(text) ? text.normalize("NFC") : text
  if (!LOOKALIKE.test(result)) return result

  for (const [lookalike, letter] of LATIN_2027_LOOKALIKES) {
    result = result.split(lookalike).join(letter)
  }
  return result
}

/** Does the text contain any of the eight new letters? */
export function hasLatin2027Letter(text: string): boolean {
  return NEW_LETTER.test(text)
}

/**
 * 1995 Latin → 2027 Latin. Text already in the new alphabet passes through,
 * so a half-converted document comes out whole.
 */
export function oldLatinToNew(text: string): string {
  const source = normalizeApostrophes(text)
  const quoteMarks = findQuoteMarks(source)
  let result = ""

  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    const pair = (char + (source[i + 1] ?? "")).toLowerCase()
    const letter = BY_OLD_SPELLING.get(pair)

    // Decision 1 — see the header. And never when that apostrophe closes a
    // quote: 'pedagog' stays pedagog, as it does on the way to Cyrillic.
    if (
      letter &&
      (pair !== "o'" || isLetter(source[i + 2]) || !isLetter(source[i - 1])) &&
      !quoteMarks.has(i + 1)
    ) {
      // One letter out, so only the first character's case carries: SH, Sh
      // and sh become Ş, Ş and ş.
      result += isUpperCase(char) ? letter.upper : letter.lower
      i++
      continue
    }

    // Decision 2 — and, through it, decision 3: the `'` in `s'h` sits
    // between two letters like any other tutuq.
    if (char === "'" && isLetter(source[i - 1]) && isLetter(source[i + 1])) {
      result += TUTUQ_BELGISI
      continue
    }

    result += char
  }

  return result
}

/**
 * 2027 Latin → 1995 Latin. The reverse needs one decision the forward
 * direction does not: Ş is "SH" inside ŞAHAR and "Sh" in Şahar, so an upper
 * case letter looks at its neighbours, the way `applyCaseAware` does for ш.
 */
export function newLatinToOld(text: string): string {
  if (!NEW_LETTER.test(text)) return text

  let result = ""

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const found = BY_NEW_LETTER.get(char)

    if (!found) {
      result += char
      continue
    }

    const { letter, upper } = found
    if (!upper) {
      result += letter.old
      continue
    }

    const allCaps =
      isUpperCase(text[i + 1] ?? "") || isUpperCase(text[i - 1] ?? "")
    result += allCaps
      ? letter.old.toUpperCase()
      : letter.old.charAt(0).toUpperCase() + letter.old.slice(1)
  }

  return result
}
