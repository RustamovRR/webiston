import { MAX_DIGITS, MINOR_DIGITS } from "../constants"

/**
 * Reading the number a person actually typed or pasted.
 *
 * Nobody types a bare integer into an invoice field. They paste `1 250 000,50`
 * out of 1C, or `1,250,000.50` out of a spreadsheet, or type `1 250 000` with
 * the spaces their keyboard puts there. All three mean the same amount, and a
 * tool that only accepts one of them is a tool people give up on.
 */

export interface Amount {
  /**
   * The whole part, as a **bigint**.
   *
   * Not a `number`, and this is the one place precision genuinely matters:
   * `Number` stops being exact above 2^53 ≈ 9×10^15, which is inside the range
   * this tool names words for. A sum that reads back as a different sum is the
   * worst possible failure for a document.
   */
  integer: bigint
  /** Hundredths — tiyin. Always 0–99. */
  fraction: number
  negative: boolean
}

/** Why a string could not be read as an amount. */
export type AmountError = "empty" | "invalid" | "tooLarge"

export type ParseResult =
  | { ok: true; amount: Amount }
  | { ok: false; error: AmountError }

/**
 * Every character people use to group thousands, stripped before parsing.
 *
 * Written as ESCAPES, never as the characters themselves: U+00A0, U+202F and
 * U+2009 are indistinguishable from an ordinary space in an editor, and a
 * character class nobody can read is one nobody can fix.
 *
 * - `\s` — the ordinary space someone types
 * - `\u00a0` — non-breaking space, what a copy out of a spreadsheet carries
 * - `\u202f` — narrow no-break space, what `Intl.NumberFormat` emits
 * - `\u2009` — thin space, used by some accounting software
 * - the apostrophes — a thousands separator in Swiss typography and in some
 *   software localised for this region
 */
const GROUPING = /[\s\u00a0\u202f\u2009'’ʼ`]/g

/**
 * Decide which of `.` and `,` is the decimal point.
 *
 * The rule is the one every spreadsheet uses, and it is unambiguous in every
 * real case: a separator that appears more than once is grouping the
 * thousands, and when both appear the LAST one is the decimal point. So
 * `1.250.000` is a million and a quarter, `1,250,000.50` has fifty tiyin, and
 * `1250000,50` has fifty tiyin too.
 *
 * The genuinely ambiguous input is a single separator followed by exactly
 * three digits — `1.500` is either one and a half or fifteen hundred. It is
 * read as GROUPING, because this is a money tool: sums are written with
 * thousands separators far more often than with three decimal places, and
 * so'm has only two of those anyway.
 */
function splitDecimal(text: string): { whole: string; fraction: string } {
  const dots = (text.match(/\./g) ?? []).length
  const commas = (text.match(/,/g) ?? []).length

  let decimal: "." | "," | null = null
  if (dots > 0 && commas > 0) {
    decimal = text.lastIndexOf(".") > text.lastIndexOf(",") ? "." : ","
  } else if (dots === 1) {
    decimal = "."
  } else if (commas === 1) {
    decimal = ","
  }

  if (decimal) {
    const at = text.lastIndexOf(decimal)
    const after = text.slice(at + 1)
    // Exactly three digits after a lone separator is thousands, not tiyin.
    if (!/^\d{3}$/.test(after)) {
      return {
        whole: text.slice(0, at).replace(/[.,]/g, ""),
        fraction: after
      }
    }
  }

  return { whole: text.replace(/[.,]/g, ""), fraction: "" }
}

/**
 * Turn what was typed into an amount, or say why it could not be.
 *
 * Refuses rather than guesses. An amount is going onto a document; a tool that
 * quietly reads `12ab` as 12 is worse than one that says it cannot.
 */
export function parseAmount(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: "empty" }

  const negative = trimmed.startsWith("-")
  const body = (negative ? trimmed.slice(1) : trimmed).replace(GROUPING, "")
  if (!body) return { ok: false, error: "invalid" }

  const { whole, fraction } = splitDecimal(body)
  // `whole` may legitimately be empty for `.5`; everything else must be digits.
  if (!/^\d*$/.test(whole) || !/^\d*$/.test(fraction)) {
    return { ok: false, error: "invalid" }
  }
  if (!whole && !fraction) return { ok: false, error: "invalid" }

  const digits = whole.replace(/^0+(?=\d)/, "")
  if (digits.length > MAX_DIGITS) return { ok: false, error: "tooLarge" }

  const integer = BigInt(digits || "0")
  // Padded, then cut: `.5` is fifty tiyin, not five, and `.5678` is
  // fifty-six — a third decimal place has no meaning in so'm.
  const minor = Number(
    fraction.padEnd(MINOR_DIGITS, "0").slice(0, MINOR_DIGITS) || "0"
  )

  return {
    ok: true,
    amount: {
      integer,
      fraction: minor,
      // `-0` is not an amount. Without this the words come out as "minus nol
      // so'm", which no document has ever said.
      negative: negative && (integer > BigInt(0) || minor > 0)
    }
  }
}

/** U+202F. No-break, so a long sum never wraps between its thousands. */
const GROUP_GAP = "\u202f"

/**
 * The amount, grouped, for the "you typed" echo under the field.
 *
 * Reading a long sum back in groups of three is how someone checks they typed
 * what they meant, and it is the only way to catch a missing zero by eye.
 */
export function formatAmount(amount: Amount): string {
  const grouped = amount.integer
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_GAP)
  const sign = amount.negative ? "−" : ""
  return amount.fraction > 0
    ? `${sign}${grouped},${String(amount.fraction).padStart(MINOR_DIGITS, "0")}`
    : `${sign}${grouped}`
}
