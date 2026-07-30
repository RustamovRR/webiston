/**
 * Password generation — pure, and cryptographically sound.
 *
 * Extracted out of `usePasswordGenerator`'s `useCallback` for two reasons:
 *
 * 1. **Security.** Every character used to come from `Math.random()`, which is
 *    explicitly *not* a CSPRNG — V8 seeds it per-context and its output is
 *    predictable from a short observed sequence. For a password generator that
 *    is the whole product being wrong, not a code-style nit. This module uses
 *    `crypto.getRandomValues`, which is available in every browser Next 16
 *    targets and in Node ≥ 19 as a global.
 * 2. **Testability.** Randomness inside a React callback cannot be asserted on.
 *    Here it can — and `randomInt` is injectable so tests can make it
 *    deterministic.
 */

export const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  /** Glyphs people misread for one another when typing a password by hand. */
  similar: "il1Lo0O"
} as const

export const MEMORABLE_WORDS = [
  "Computer",
  "Security",
  "Password",
  "Digital",
  "Network",
  "System",
  "Data",
  "Server",
  "Cloud",
  "Mobile",
  "Website",
  "Application",
  "Software",
  "Hardware",
  "Internet",
  "Protocol",
  "Crypto",
  "Secure",
  "Strong",
  "Safe",
  "Tech",
  "Code",
  "User",
  "Admin",
  "Login",
  "Access",
  "Guard",
  "Shield",
  "Vault",
  "Key",
  "Lock",
  "Token"
] as const

/** Symbols used by the memorable format — a readable subset of `symbols`. */
const MEMORABLE_SYMBOLS = "!@#$%^&*"

export interface PasswordSettings {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  passwordType: "random" | "memorable" | "strong"
}

/** Returns an integer in [0, max). Injectable so tests can be deterministic. */
export type RandomInt = (max: number) => number

/**
 * Uniform integer in [0, max) from the platform CSPRNG.
 *
 * Uses rejection sampling, not `% max`. Modulo on a 32-bit draw is biased
 * whenever `max` does not divide 2^32 — for a 26-letter alphabet the low
 * letters come up measurably more often. Discarding the non-uniform tail costs
 * an occasional extra draw and removes the bias entirely.
 */
export const secureRandomInt: RandomInt = (max) => {
  if (max <= 0)
    throw new RangeError(`secureRandomInt: max must be > 0, got ${max}`)
  const limit = Math.floor(0x1_0000_0000 / max) * max
  const buf = new Uint32Array(1)
  let draw: number
  do {
    crypto.getRandomValues(buf)
    draw = buf[0]
  } while (draw >= limit)
  return draw % max
}

const pick = <T>(items: ArrayLike<T>, rand: RandomInt): T =>
  items[rand(items.length)]

/** The alphabet a given set of settings allows. May be empty. */
export function buildAlphabet(settings: PasswordSettings): string {
  let chars = ""
  if (settings.includeUppercase) chars += CHAR_SETS.uppercase
  if (settings.includeLowercase) chars += CHAR_SETS.lowercase
  if (settings.includeNumbers) chars += CHAR_SETS.numbers
  if (settings.includeSymbols) chars += CHAR_SETS.symbols

  if (settings.excludeSimilar) {
    chars = [...chars].filter((c) => !CHAR_SETS.similar.includes(c)).join("")
  }
  return chars
}

/** Fisher–Yates, so every permutation is equally likely. */
function shuffle<T>(items: T[], rand: RandomInt): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

export class NoCharactersSelectedError extends Error {
  constructor() {
    super("At least one character type must be selected")
    this.name = "NoCharactersSelectedError"
  }
}

/**
 * Generate a password for `settings`.
 *
 * Throws `NoCharactersSelectedError` when the settings permit no characters —
 * the caller decides how to surface that. Returning `""` would look like a
 * successfully generated empty password.
 */
export function generatePassword(
  settings: PasswordSettings,
  rand: RandomInt = secureRandomInt
): string {
  const alphabet = buildAlphabet(settings)

  if (settings.passwordType === "memorable") {
    const word1 = pick(MEMORABLE_WORDS, rand)
    const word2 = pick(MEMORABLE_WORDS, rand)
    const number = String(rand(1000)).padStart(3, "0")
    const symbol = settings.includeSymbols ? pick(MEMORABLE_SYMBOLS, rand) : ""

    let result = `${word1}${word2}${number}${symbol}`

    if (result.length > settings.length) {
      return result.slice(0, settings.length)
    }
    // Pad to the requested length. Without an alphabet there is nothing to pad
    // with, so the memorable password stands on its own rather than looping.
    while (result.length < settings.length && alphabet) {
      result += pick(alphabet, rand)
    }
    return result
  }

  if (!alphabet) throw new NoCharactersSelectedError()

  if (settings.passwordType === "strong") {
    // One character guaranteed from each enabled class, then filled and
    // shuffled — so "strong" actually means "contains every selected type",
    // which a plain random draw only usually achieves.
    const required: string[] = []
    if (settings.includeUppercase)
      required.push(pick(CHAR_SETS.uppercase, rand))
    if (settings.includeLowercase)
      required.push(pick(CHAR_SETS.lowercase, rand))
    if (settings.includeNumbers) required.push(pick(CHAR_SETS.numbers, rand))
    if (settings.includeSymbols) required.push(pick(CHAR_SETS.symbols, rand))

    for (let i = required.length; i < settings.length; i++) {
      required.push(pick(alphabet, rand))
    }
    // A requested length shorter than the number of enabled classes cannot hold
    // one of each; truncating keeps the contract "never longer than requested".
    return shuffle(required, rand).join("").slice(0, settings.length)
  }

  let result = ""
  for (let i = 0; i < settings.length; i++) result += pick(alphabet, rand)
  return result
}
