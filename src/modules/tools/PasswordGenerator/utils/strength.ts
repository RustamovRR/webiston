import { buildAlphabet, type PasswordSettings } from "./generate-password"

/**
 * How strong is a password FROM THESE SETTINGS — not "does this string look
 * strong".
 *
 * The scorer this replaces graded the generated string: points for length,
 * points for character variety, minus points for `123` appearing. That is the
 * right shape for auditing a password a HUMAN invented, and the wrong one for
 * a generator — here the search space is known exactly, so the strength is
 * not an impression, it is arithmetic: `length × log2(alphabet)`. The old
 * scorer also hardcoded `95 ** length` for its entropy readout, an alphabet
 * the settings may not allow — a digits-only PIN was credited with the full
 * printable-ASCII space.
 */

export type CrackUnit =
  | "instant"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "years"
  | "centuries"

export interface CrackEstimate {
  unit: CrackUnit
  /** Rounded amount for the units that carry one; `centuries` does not. */
  value?: number
}

export interface StrengthReport {
  /** Entropy in bits — the honest number every serious generator shows. */
  bits: number
  /** 1 (weak) … 5 (very strong), for the meter and the label. */
  level: 1 | 2 | 3 | 4 | 5
  /** How many distinct characters the settings allow. */
  alphabetSize: number
  crack: CrackEstimate
}

/**
 * Offline attack against a stolen hash on rented GPUs — the scenario strength
 * advice is normally quoted for. Deliberately pessimistic: an online attack is
 * rate-limited thousands of times slower.
 */
const GUESSES_PER_SECOND = 1e10

/**
 * Thresholds in bits. 28/36/60/128 are the conventional breakpoints (128 is
 * "computationally infeasible, full stop"), so our labels mean what the
 * literature means by them.
 */
function levelOf(bits: number): StrengthReport["level"] {
  if (bits < 28) return 1
  if (bits < 36) return 2
  if (bits < 60) return 3
  if (bits < 128) return 4
  return 5
}

function crackTime(bits: number): CrackEstimate {
  // Average case: half the space is searched before the hit.
  const seconds = 2 ** (bits - 1) / GUESSES_PER_SECOND

  if (seconds < 1) return { unit: "instant" }
  if (seconds < 60) return { unit: "seconds", value: Math.round(seconds) }
  if (seconds < 3600)
    return { unit: "minutes", value: Math.round(seconds / 60) }
  if (seconds < 86_400) {
    return { unit: "hours", value: Math.round(seconds / 3600) }
  }
  const days = seconds / 86_400
  if (days < 365) return { unit: "days", value: Math.round(days) }
  const years = days / 365
  if (years < 100) return { unit: "years", value: Math.round(years) }
  // Beyond a century the number stops informing anyone; the unit is the news.
  return { unit: "centuries" }
}

/**
 * Entropy of the memorable format, floor estimate.
 *
 * Two words from a 32-entry list, a three-digit number, an optional symbol
 * from eight: 5 + 5 + ~10 (+3) ≈ 23–26 bits. Padding characters can only ADD
 * entropy, so the floor is what gets reported — and it reads "weak", which is
 * simply true. A memorable password's job is a low-stakes account you type by
 * hand; the meter saying so is the tool being honest, not broken.
 */
function memorableBits(settings: PasswordSettings): number {
  const words = 2 * Math.log2(32)
  const number = Math.log2(1000)
  const symbol = settings.includeSymbols ? Math.log2(8) : 0
  return words + number + symbol
}

/** `null` when the settings permit no password at all. */
export function assessStrength(
  settings: PasswordSettings
): StrengthReport | null {
  const alphabetSize = buildAlphabet(settings).length

  if (settings.passwordType === "memorable") {
    const bits = memorableBits(settings)
    return {
      bits: Math.round(bits),
      level: levelOf(bits),
      alphabetSize,
      crack: crackTime(bits)
    }
  }

  if (alphabetSize === 0) return null

  // `strong` guarantees one character per enabled class; the constraint trims
  // the space by a factor too small to move the rounded number, so both random
  // kinds are reported with the same formula.
  const bits = settings.length * Math.log2(alphabetSize)

  return {
    bits: Math.round(bits),
    level: levelOf(bits),
    alphabetSize,
    crack: crackTime(bits)
  }
}
