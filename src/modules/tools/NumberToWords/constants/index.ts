/**
 * Uzbek numerals, and the decisions baked into them.
 *
 * The apostrophe is **U+0027**, the plain ASCII one, and that is not a
 * shortcut: `toLatin` in `@webiston/transliteration` emits U+0027, and the
 * Uzbek message bundles use it 1,374 times against 17 for the typographic
 * `‘`. A tool that sits beside the transliterator has to spell `o'n` the same
 * way the transliterator does, or a copied sum stops round-tripping.
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

/**
 * **Every scale word is counted. `yuz` is not.**
 *
 * 1 560 is "**bir ming** besh yuz oltmish so'm" — settled by the owner against
 * the convention actually used on Uzbek documents, and it overrides the
 * conversational form. In speech "ming so'm" is what people say; on a
 * hisob-faktura the thousands are counted like every other scale, because the
 * written sum has to be unambiguous when read aloud.
 *
 * `yuz` is the exception and stays bare: 100 is "yuz", 1 560 is "bir ming
 * **besh yuz** oltmish" — the hundreds inside a group take their own digit,
 * and a lone hundred takes none. This mirrors Russian document practice, which
 * Uzbek accounting follows: "одна тысяча пятьсот шестьдесят", never "один сто".
 *
 * There is no constant to flip any more: the rule is "count every scale", so
 * `integerToWords` has no special case left. That is the shape a settled
 * decision should have.
 */
export const HUNDRED_STANDS_ALONE = true

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

/**
 * The questions this tool answers, in the order they are asked.
 *
 * One list, read by BOTH the visible FAQ and the `FAQPage` structured data —
 * so the schema cannot describe questions the page does not show, which is a
 * mistake this repo has already made and fixed once.
 */
export const FAQ_KEYS = [
  "why",
  "scripts",
  "birMing",
  "tiyin",
  "limit",
  "privacy"
] as const
