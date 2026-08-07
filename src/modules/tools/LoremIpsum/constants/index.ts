import type { LoremBank, LoremFormat, LoremUnit } from "../types"

/**
 * Tool-scoped constants.
 *
 * The word lists themselves stay in `src/constants/tool-constants.ts`, where
 * they already live — they are DATA, and moving them would be a deletion for
 * no gain. What belongs here is everything about how this tool uses them.
 */

export const LOREM_UNITS: readonly LoremUnit[] = [
  "paragraphs",
  "sentences",
  "words",
  "bytes"
]

export const LOREM_FORMATS: readonly LoremFormat[] = ["plain", "html"]

/**
 * Classic first, Uzbek second.
 *
 * The Uzbek bank is the reason this tool is worth rebuilding rather than
 * linking to lipsum.com: Latin filler is a poor proxy for a page that will
 * hold Uzbek. `o'` and `g'` are single letters written with an apostrophe, and
 * `ch`/`sh` are digraphs, so the same sentence occupies visibly more
 * characters — a column sized against Cicero overflows once the real copy
 * arrives.
 */
export const LOREM_BANKS: readonly LoremBank[] = [
  "cicero",
  "uzbek",
  "uzbekCyrillic",
  "bacon",
  "hipster",
  "cupcake"
]

/**
 * Where the comma falls in the classic opening.
 *
 * `Lorem ipsum dolor sit amet, consectetur adipiscing elit` — index 4 is
 * `amet`. The line is quoted, not generated, so its punctuation is fixed.
 */
export const OPENING_COMMA_AFTER = 4

/** The opening every reader recognises, and where the tradition comes from. */
export const LOREM_OPENING = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit"
]

/**
 * How long a generated sentence is, in words.
 *
 * Real prose does not come in one length. The range is wide enough that a
 * paragraph has visible rhythm, and a comma is placed inside the longer ones —
 * without it every sentence read as a flat list, which is not what the text is
 * standing in for.
 */
export const MIN_SENTENCE_WORDS = 4
export const MAX_SENTENCE_WORDS = 18
export const COMMA_MIN_WORDS = 9

export const MIN_PARAGRAPH_SENTENCES = 3
export const MAX_PARAGRAPH_SENTENCES = 7

/**
 * Bounds on the amount.
 *
 * 100 paragraphs is already ~40,000 characters — past the point where anyone
 * reads the result rather than pasting it. Bytes get their own ceiling because
 * the number means something different there.
 */
export const MIN_AMOUNT = 1
export const MAX_AMOUNT = 100
export const MAX_BYTES = 50_000

/** The counts people actually ask for, one press away. */
export const AMOUNT_PRESETS: readonly number[] = [1, 3, 5, 10]

/**
 * Bytes need their own presets: 3 bytes is not a document.
 *
 * These are the sizes a field limit actually comes in — a short input, a
 * `TEXT` column's first page, a 1 KB payload, a 5 KB body.
 */
export const BYTE_PRESETS: readonly number[] = [128, 512, 1024, 5120]

/** What the amount falls back to when the unit stops being bytes. */
export const DEFAULT_AMOUNT = 3
export const DEFAULT_BYTES = 512

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = [
  "whatIsIt",
  "whyUzbek",
  "seo",
  "howMuch",
  "html"
] as const
