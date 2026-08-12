/**
 * Uzbek numerals as a shared library.
 *
 * Promoted out of the NumberToWords tool at its SECOND consumer — the tilxat
 * generator embeds the same sum-in-words into a legal document — which is
 * exactly the promotion rule in `code-rules.md` §14 and CLAUDE.md ("a new
 * shared abstraction only at the ~2nd–3rd real consumer").
 */

/** 0–9. Index IS the digit. */
export const UZBEK_UNITS = [
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
] as const

/** Tens, indexed by the tens digit. Index 0 and 1 never render on their own. */
export const UZBEK_TENS = [
  "",
  "o'n",
  "yigirma",
  "o'ttiz",
  "qirq",
  "ellik",
  "oltmish",
  "yetmish",
  "sakson",
  "to'qson"
] as const

export const UZBEK_HUNDRED = "yuz"

/**
 * Scale words, indexed by group of three digits from the right.
 *
 * The empty first entry is the units group, which takes no scale word.
 * Stopping at `kvadrillion` is a decision, not an omission: it covers every
 * value below 10^18, and a sum larger than that is a typing mistake rather
 * than an amount — see `MAX_DIGITS`.
 */
export const UZBEK_SCALES = [
  "",
  "ming",
  "million",
  "milliard",
  "trillion",
  "kvadrillion"
] as const

/*
 * **Written style counts everything: "bir yuz", "bir ming", "bir million".**
 *
 * Settled by the owner (1 560 → "bir ming besh yuz oltmish so'm") and
 * confirmed against official usage: Uzbek legislation on lex.uz writes
 * "bazaviy hisoblash miqdorining **bir yuz ellik** baravari" — the hundred is
 * counted too. Speech drops the leading "bir" on yuz and ming; documents do
 * not, because a written sum has to be unambiguous when read back.
 *
 * There is deliberately no constant to flip. "Count every unit" leaves
 * `integerToWords` with zero special cases, which is the shape a settled
 * decision should have — an earlier draft carried a `STANDALONE_SCALE_INDEX`
 * for the conversational form and it was the only branch in the algorithm.
 */

/** So'm and its hundredth. Tiyin is out of circulation but still printed. */
export const CURRENCY_MAJOR = "so'm"
export const CURRENCY_MINOR = "tiyin"

/**
 * The longest integer accepted, in digits.
 *
 * `kvadrillion` covers 10^15 to 10^18-1, so 18 digits is exactly what the
 * scale table can name. Anything longer is refused with a message instead of
 * being silently truncated — a sum on a document is the last place to guess.
 */
export const MAX_DIGITS = 18

/** How many digits the fractional part keeps. Tiyin is hundredths, so two. */
export const MINOR_DIGITS = 2

/**
 * Output modes.
 *
 * `sum` is the reason this tool exists — an invoice, a contract or a payment
 * order has to carry the amount in words — so it is the default. `plain` is
 * for the cases that are not money at all: a quantity, a page count, a year.
 */
export const OUTPUT_MODES = ["sum", "plain"] as const
export type OutputMode = (typeof OUTPUT_MODES)[number]
export const DEFAULT_MODE: OutputMode = "sum"
