/**
 * Content protection system
 * Preserves URLs, emails, code blocks, and technical terms from transliteration
 */

import { NON_TRANSLITERATABLE_WORDS, UZBEK_SUFFIXES } from "./constants"

const PLACEHOLDER_PREFIX = "\u0000"
const PLACEHOLDER_SUFFIX = "\u0000"

/**
 * The placeholder delimiter, stripped from the input before masking.
 *
 * Without this the scheme is forgeable: text that already contains
 * U+0000 "0" U+0000 is indistinguishable from placeholder #0, so
 * `restoreContent` substitutes an unrelated protected span into it. Measured
 * before the strip, the input `React \u00000\u0000 salom` came out as
 * `React React salom` -- quietly duplicating content the user never wrote.
 *
 * Deleting NUL rather than escaping it is deliberate: it is a control
 * character with no meaning in prose, and it reaches this function only from a
 * mis-decoded file (a UTF-16 .txt read as UTF-8 is full of them).
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: matching the NUL delimiter is the entire point — see the comment above
const PLACEHOLDER_DELIMITER = /\u0000/g

function createPlaceholder(index: number): string {
  return `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`
}

/**
 * What counts as "inside a word" for protection purposes.
 *
 * NOT `\b`. In Uzbek Latin the apostrophe is part of a LETTER — `o'` and `g'`
 * are single characters of the alphabet — but JavaScript's `\b` treats it as a
 * separator. That handed the protected-word list a boundary in the middle of
 * `o'sha` ("that"), where it matched the trailing `sha` against the SHA hash
 * family and left the word half-converted: `o'sha` → `ўsha`.
 *
 * Every apostrophe variant is listed because protection runs on RAW input,
 * before `normalizeApostrophes` has folded them together.
 */
const WORD_CHAR = "[\\w'‘’ʻʼʿˈ′ʹ´`]"

/**
 * Uzbek suffixes only attach to entries this long or longer.
 *
 * The suffix expansion is what turns a 3-letter entry into a common Uzbek
 * word: `bun` (the JS runtime) + `i`/`ga`/`dan` swallowed `buni`, `bunga`,
 * `bundan` — three of the most frequent words in the language — and `tan` +
 * `ga`/`i` swallowed `tanga` (coin) and `tani`. A 3-letter stem carries almost
 * no evidence of being technical; a 4-letter one does, which is where the real
 * cases live (`reactda`, `dockerga`, `javascriptni`).
 */
const SUFFIXABLE_MIN_LENGTH = 4

// Create regex pattern for protected words, with Uzbek suffixes on the
// entries long enough to earn them.
function buildProtectedWordsPattern(): string {
  const byLengthDesc = (a: string, b: string) => b.length - a.length
  const all = [...NON_TRANSLITERATABLE_WORDS].sort(byLengthDesc)
  const suffixable = all.filter((w) => w.length >= SUFFIXABLE_MIN_LENGTH)
  const suffix = `(?:${UZBEK_SUFFIXES.join("|")})`

  // Suffixed form first: alternation is ordered, so `reactda` must get the
  // chance to match `react` + `da` before the bare `react` branch takes it and
  // leaves `da` behind to be transliterated on its own.
  return (
    `(?<!${WORD_CHAR})` +
    `(?:(?:${suffixable.join("|")})${suffix}|(?:${all.join("|")}))` +
    `(?!${WORD_CHAR})`
  )
}

function buildProtectionRegex(): RegExp {
  const patterns = [
    // Code blocks (triple backticks)
    "```[\\s\\S]*?```",
    // Inline code (single backticks)
    "`[^`]+?`",
    // HTML tags: <tag>, </tag>, <tag attr="value">
    //
    // `[^<>]{0,400}` rather than `[^>]*`: the open-ended version scanned to the
    // END OF THE INPUT for every unclosed "<tag" before backtracking, which is
    // quadratic in the number of them. Measured: 68 KB of prose containing
    // 2,000 unclosed <div ran in 63 ms, 273 KB with 8,000 took 6,605 ms -- a
    // 4x input for a 105x cost, i.e. a pasted HTML fragment freezes the tab.
    // Excluding "<" is also simply correct: a tag cannot contain one.
    "<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^<>]{0,400})?\\/?>",
    // Email addresses
    "\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b",
    // Social media handles (@username, @user_name, @user123)
    "@[a-zA-Z_][a-zA-Z0-9_]*",
    // URLs
    "\\b(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*",
    // File names with extensions (config.json, backup_v2.tar.gz)
    "\\b[a-zA-Z0-9_-]+(?:\\.[a-zA-Z0-9]+)+\\b",
    // Technical terms with hyphen+number at END (COVID-19, v2.3, NOT Tez-tibbiy)
    "\\b[A-Za-z]+-\\d+(?:\\.\\d+)*\\b",
    // HTML heading tags (h1-h6)
    "\\bh[1-6]\\b",
    // Protected words with optional Uzbek suffixes
    buildProtectedWordsPattern()
  ]
  return new RegExp(patterns.join("|"), "gi")
}

const protectionRegex = buildProtectionRegex()

export interface ProtectionResult {
  maskedText: string
  protectedParts: string[]
}

/**
 * Protect special content from transliteration
 * Replaces URLs, emails, code blocks, etc. with placeholders
 */
export function protectContent(text: string): ProtectionResult {
  const protectedParts: string[] = []
  // See PLACEHOLDER_DELIMITER: the masking scheme is only unforgeable if the
  // delimiter cannot already be in the text.
  const safeText = text.replace(PLACEHOLDER_DELIMITER, "")

  const maskedText = safeText.replace(protectionRegex, (match) => {
    const index = protectedParts.length
    protectedParts.push(match)
    return createPlaceholder(index)
  })

  return { maskedText, protectedParts }
}

/**
 * Restore protected content after transliteration
 * Replaces placeholders with original content
 */
export function restoreContent(text: string, protectedParts: string[]): string {
  const placeholderRegex = new RegExp(
    `${PLACEHOLDER_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}`,
    "g"
  )
  return text.replace(placeholderRegex, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)] || ""
  })
}
