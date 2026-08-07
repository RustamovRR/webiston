import { toCyrillic } from "@webiston/transliteration"

import { ALTERNATIVE_TEXTS } from "@/constants/tool-constants"

import {
  COMMA_MIN_WORDS,
  LOREM_OPENING,
  MAX_PARAGRAPH_SENTENCES,
  MAX_SENTENCE_WORDS,
  MIN_PARAGRAPH_SENTENCES,
  MIN_SENTENCE_WORDS,
  OPENING_COMMA_AFTER
} from "../constants"
import type { LoremBank, LoremOptions } from "../types"

/**
 * Filler text.
 *
 * The output IS the product here, so the generator is where the work goes.
 * What this replaces produced sentences of 5–15 words with no punctuation but
 * a full stop, which reads as a list rather than as prose and defeats the one
 * job filler has: standing in for real copy convincingly enough that layout
 * decisions made against it survive contact with the real thing.
 *
 * `Math.random()` is correct here and deliberate. The password and UUID tools
 * had to move OFF it because their output is a secret; nothing about a
 * paragraph of `dolor sit amet` is.
 */

/**
 * The Cyrillic list is DERIVED, not a second list to keep in step.
 *
 * Uzbek is written in both alphabets and plenty of publishing here is still
 * Cyrillic, so a designer laying out that kind of page needs filler in it —
 * and the letters are not a one-to-one swap: `sh` and `ch` become single
 * characters (ш, ч) while `x` becomes ҳ, so the same words occupy a visibly
 * different width. No competitor offers this, and it costs one call to a
 * package this site already ships.
 *
 * Converted once and cached: 113 words through the engine on every keystroke
 * would be work for an answer that cannot change.
 */
let cyrillicWords: string[] | null = null

export function wordsOf(bank: LoremBank): string[] {
  if (bank === "uzbekCyrillic") {
    cyrillicWords ??= ALTERNATIVE_TEXTS.uzbek.words.map((word) =>
      toCyrillic(word)
    )
    return cyrillicWords
  }
  return ALTERNATIVE_TEXTS[bank].words
}

const pick = <T>(list: readonly T[]): T =>
  list[Math.floor(Math.random() * list.length)]

const between = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const capitalise = (word: string): string =>
  word.charAt(0).toUpperCase() + word.slice(1)

/**
 * One sentence: a capital, a comma if it is long enough to want one, a stop.
 *
 * The comma lands between the third word and the third from last, which is
 * where a clause boundary falls in real writing — never after the first word
 * or immediately before the full stop.
 */
export function makeSentence(words: string[], opening?: string[]): string {
  const length = opening
    ? Math.max(opening.length, between(MIN_SENTENCE_WORDS, MAX_SENTENCE_WORDS))
    : between(MIN_SENTENCE_WORDS, MAX_SENTENCE_WORDS)

  const picked = Array.from({ length }, (_, index) =>
    opening && index < opening.length ? opening[index] : pick(words)
  )

  if (opening) {
    // The classic line is not a random arrangement of those eight words — it
    // reads `…dolor sit amet, consectetur adipiscing elit`, and a comma
    // dropped anywhere else inside it makes the one sentence everybody
    // recognises look subtly wrong. Caught by a test that asserted the
    // opening survives; it did not.
    picked[OPENING_COMMA_AFTER] = `${picked[OPENING_COMMA_AFTER]},`
  } else if (picked.length >= COMMA_MIN_WORDS) {
    const at = between(2, picked.length - 3)
    picked[at] = `${picked[at]},`
  }

  return `${capitalise(picked.join(" "))}.`
}

export function makeParagraph(words: string[], opening?: string[]): string {
  const count = between(MIN_PARAGRAPH_SENTENCES, MAX_PARAGRAPH_SENTENCES)
  return Array.from({ length: count }, (_, index) =>
    makeSentence(words, index === 0 ? opening : undefined)
  ).join(" ")
}

/**
 * The classic opening, but only where it belongs.
 *
 * `Lorem ipsum dolor sit amet` is Latin. The old tool offered the toggle for
 * every word list and then silently ignored it on four of the five — a control
 * that does nothing is worse than one that is not there, so the UI hides it
 * outside the classic bank and this function is the single place that decides.
 */
function openingFor(options: LoremOptions): string[] | undefined {
  return options.startWithLorem && options.bank === "cicero"
    ? LOREM_OPENING
    : undefined
}

/**
 * Exactly N bytes.
 *
 * Measured with `TextEncoder`, not `String.length`: the Uzbek bank is ASCII
 * today, but a mode whose whole purpose is a size limit must not report UTF-16
 * code units and call them bytes — the same defect already fixed in the JSON
 * formatter and the Base64 converter.
 *
 * The last word IS cut mid-way when it has to be. That is what asking for a
 * byte count means, and padding to a word boundary would return a different
 * number than the one requested.
 */
function makeBytes(words: string[], amount: number): string {
  const encoder = new TextEncoder()
  let text = ""

  while (encoder.encode(text).length < amount) {
    text += `${pick(words)} `
  }

  const bytes = encoder.encode(text).slice(0, amount)
  // `TextDecoder` without `fatal` replaces a truncated multi-byte sequence
  // rather than throwing; trailing whitespace is trimmed off the display, not
  // off the count.
  return new TextDecoder().decode(bytes)
}

/**
 * The generator only ever produces PLAIN text; HTML is a view of it.
 *
 * That split is what lets the format control switch back and forth without
 * re-rolling the words underneath it — the same rule the UUID generator
 * follows for delimiters and case. Regenerating on a display change reads as
 * a broken control.
 *
 * Paragraphs become paragraphs; anything else is one block of prose, because
 * wrapping a list of ten words in ten `<p>` elements would be a lie about what
 * was asked for.
 */
export function applyFormat(text: string, options: LoremOptions): string {
  if (options.format !== "html" || !text) return text

  return options.unit === "paragraphs"
    ? text
        .split("\n\n")
        .map((block) => `<p>${block}</p>`)
        .join("\n")
    : `<p>${text}</p>`
}

/** Joins the blocks the way the unit reads: paragraphs stack, prose runs on. */
function wrap(blocks: string[], options: LoremOptions): string {
  return blocks.join(options.unit === "paragraphs" ? "\n\n" : " ")
}

export function generateLorem(options: LoremOptions): string {
  const words = wordsOf(options.bank)
  const opening = openingFor(options)

  switch (options.unit) {
    case "paragraphs":
      return wrap(
        Array.from({ length: options.amount }, (_, index) =>
          makeParagraph(words, index === 0 ? opening : undefined)
        ),
        options
      )

    case "sentences":
      return wrap(
        Array.from({ length: options.amount }, (_, index) =>
          makeSentence(words, index === 0 ? opening : undefined)
        ),
        options
      )

    case "words": {
      const picked = Array.from({ length: options.amount }, (_, index) =>
        opening && index < opening.length ? opening[index] : pick(words)
      )
      return wrap([capitalise(picked.join(" "))], options)
    }

    case "bytes":
      return wrap([makeBytes(words, options.amount)], options)
  }
}

/** What the visitor gets told about the result. */
export function measure(text: string) {
  const trimmed = text.trim()
  return {
    characters: text.length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    bytes: new TextEncoder().encode(text).length
  }
}
