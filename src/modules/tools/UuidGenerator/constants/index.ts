import type { UuidFormat, UuidVersion } from "../types"

/**
 * Tool-scoped constants.
 */

interface VersionMeta {
  /** i18n key. */
  key: string
  /** Bits of randomness in one value. 0 for Nil, which has none. */
  entropyBits: number
  /** Does a batch sort by creation time? The reason v7 exists. */
  sortable: boolean
  /**
   * Is the value guessable from another one? True for anything with a clock
   * in it — which is why those versions must never be used as a token.
   */
  predictable: boolean
}

/**
 * Ordered by what a visitor should reach for.
 *
 * v4 first because it is the right answer to nearly every question. v7 second
 * because it is the right answer to the one that matters most — a primary key
 * — and it is the version this tool did not have. v1 is kept because people
 * still arrive looking for it, and Nil because it is the value you need when
 * a column is `NOT NULL` and you have nothing to put in it.
 */
export const UUID_VERSIONS: readonly UuidVersion[] = ["v4", "v7", "v1", "nil"]

export const VERSION_META = {
  v4: { key: "v4", entropyBits: 122, sortable: false, predictable: false },
  v7: { key: "v7", entropyBits: 74, sortable: true, predictable: true },
  v1: { key: "v1", entropyBits: 62, sortable: false, predictable: true },
  nil: { key: "nil", entropyBits: 0, sortable: false, predictable: true }
} as const satisfies Record<UuidVersion, VersionMeta>

export const UUID_FORMATS: readonly UuidFormat[] = [
  "standard",
  "compact",
  "braces"
]

/**
 * How many values one press produces.
 *
 * 1000 is not a guess: the whole batch is generated synchronously and held in
 * memory, and 1000 v4 values cost well under a millisecond. The ceiling is
 * what a person can plausibly want out of a browser tab — past that it is a
 * seed script, not a web tool.
 */
export const MAX_UUID_COUNT = 1000
export const MIN_UUID_COUNT = 1

/** The counts people actually ask for, one press away. */
export const COUNT_PRESETS: readonly number[] = [1, 5, 10, 50, 100]

/**
 * How many rows are put in the DOM at once.
 *
 * The same guard the JSON formatter's tree needed: 1000 rows, each with its
 * own copy button, is 1000 mounted React components for a list nobody reads
 * past the first screen of.
 */
export const ROW_CHUNK = 100

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = [
  "what",
  "v4OrV7",
  "collision",
  "secret",
  "privacy"
] as const
