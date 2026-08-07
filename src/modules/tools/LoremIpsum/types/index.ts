/**
 * Tool-scoped types.
 */

/** What the amount counts. */
export type LoremUnit = "paragraphs" | "sentences" | "words" | "bytes"

/** How the text is written out. */
export type LoremFormat = "plain" | "html"

/** Which word list the text is drawn from. */
export type LoremBank =
  | "cicero"
  | "uzbek"
  /** The Uzbek list, transliterated. See `wordsOf`. */
  | "uzbekCyrillic"
  | "bacon"
  | "hipster"
  | "cupcake"

export interface LoremOptions {
  unit: LoremUnit
  amount: number
  bank: LoremBank
  format: LoremFormat
  /** Open with `Lorem ipsum dolor sit amet…`. Classic bank only. */
  startWithLorem: boolean
}
