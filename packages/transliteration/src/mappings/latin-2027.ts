/**
 * The Uzbek Latin alphabet as amended by Law OʻRQ-1184.
 *
 * Signed and published 21.10.2026; in force 22.04.2027 (art. 4: six months
 * after official publication). https://lex.uz/uz/docs/8548754
 *
 *   A B D E F G Ğ H I J K L M N O Ö P Q R S Ş Ç T U V X Y Z ʼ
 *
 * 28 letters and the tutuq belgisi, against 1995's 26 letters and three
 * digraphs. Four letters change shape — the table below — and Ng stops being
 * a letter of its own. Ng needs no mapping: it was always spelled n + g, so
 * no text changes when the alphabet stops calling it one letter.
 *
 * There is no C in the new alphabet. Some sites converting "to the new
 * alphabet" write ts → c, which follows a 2019 draft, not the law.
 *
 * Every code point is an escape, never a literal. ş (U+015F, cedilla) and
 * ș (U+0219, comma below) are the same picture in most fonts and different
 * letters to every search engine and spell-checker. These are the characters
 * the law's own table on lex.uz uses — read from its HTML, not from a font.
 */

export interface Latin2027Letter {
  /** The 1995 spelling, lower case, with the ASCII apostrophe. */
  readonly old: string
  readonly upper: string
  readonly lower: string
  /** The Uzbek Cyrillic letter both spellings stand for. */
  readonly cyrillic: string
}

/** In the order of the law's table: Ğ after G, Ö after O, Ş and Ç after S. */
export const LATIN_2027_LETTERS: readonly Latin2027Letter[] = [
  { old: "g'", upper: "\u011E", lower: "\u011F", cyrillic: "ғ" },
  { old: "o'", upper: "\u00D6", lower: "\u00F6", cyrillic: "ў" },
  { old: "sh", upper: "\u015E", lower: "\u015F", cyrillic: "ш" },
  { old: "ch", upper: "\u00C7", lower: "\u00E7", cyrillic: "ч" }
]

/**
 * U+02BC MODIFIER LETTER APOSTROPHE — and it is not new. The 1995 rules on
 * lex.uz already use it for the tutuq (68 times; oʻ and gʻ use U+02BB, 608
 * times). What the reform changes is that oʻ and gʻ stop needing a mark at
 * all, which leaves this as the only apostrophe in the alphabet.
 */
export const TUTUQ_BELGISI = "\u02BC"

/** All eight new letters, upper and lower, for one-character membership tests. */
export const LATIN_2027_LETTER_CHARS = LATIN_2027_LETTERS.map(
  (letter) => letter.upper + letter.lower
).join("")

/**
 * Characters people type for a new letter that are not that letter.
 *
 * Normalisation covers the decomposed spellings (s + U+0327 is ş after NFC);
 * this covers the precomposed WRONG ones, each of which has a source:
 *
 *   ș Ș  comma below — the Romanian letter, and what several keyboard layouts
 *        and fonts produce when asked for "s with a mark under it"
 *   ǵ Ǵ  the May 2019 draft's Gʻ, widely reprinted at the time
 *   ŏ Ŏ  the March 2021 draft's Oʻ
 *
 * ó (the 2019 draft's Oʻ) is deliberately NOT here: unlike the others it is
 * an ordinary letter in names Uzbek text quotes — José, Gómez — and turning
 * those into ö would be a corruption, not a correction.
 *
 * Pairs, not an object: as object keys the escapes are rewritten into bare
 * identifiers by the formatter, and the point of an escape is that nobody
 * has to trust what a glyph looks like.
 */
export const LATIN_2027_LOOKALIKES: readonly (readonly [
  lookalike: string,
  letter: string
])[] = [
  ["\u0219", "\u015F"],
  ["\u0218", "\u015E"],
  ["\u01F5", "\u011F"],
  ["\u01F4", "\u011E"],
  ["\u014F", "\u00F6"],
  ["\u014E", "\u00D6"]
]
