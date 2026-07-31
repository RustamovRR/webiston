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
 * What counts as "still inside a word" on the TRAILING edge.
 *
 * Wider than `\b`, because in Uzbek Latin the apostrophe is part of a LETTER —
 * `o'` and `g'` are single characters of the alphabet — while JavaScript's
 * `\b` treats it as a separator. Without this a protected word could match up
 * to an apostrophe that belongs to the next letter.
 *
 * Every apostrophe variant is listed because protection runs on RAW input,
 * before `normalizeApostrophes` has folded them together.
 */
const WORD_CHAR = "[\\w'‘’ʻʼʿˈ′ʹ´`]"

/** Every apostrophe shape, for the o'/g' test below. */
const APOSTROPHES = "'‘’ʻʼʿˈ′ʹ´`"

/**
 * Does the match at `offset` start in the middle of an Uzbek letter?
 *
 * `o'` and `g'` are single letters of the Uzbek alphabet, but JavaScript's
 * `\b` sees the apostrophe as a separator and offers everything after it as a
 * standalone token. Scanning this repo's own 226 Uzbek chapters — 22,928
 * distinct words — found exactly three protected acronyms reachable this way,
 * and all three sit inside common words:
 *
 *   o'sha  ("that")        → `sha` (the hash family) → "ўsha"
 *   ko'rsa ("if he sees")  → `rsa` (the cipher)      → "кўrsa"
 *   o'ram  ("a roll")      → `ram` (the memory)      → "ўram"
 *
 * The test is deliberately narrow: only an apostrophe preceded by o or g, so a
 * quoted term like 'React' is still protected. Corpus leaks after this: 0.
 */
function startsInsideUzbekLetter(text: string, offset: number): boolean {
  const previous = text[offset - 1]
  const beforeThat = text[offset - 2]

  return (
    previous !== undefined &&
    APOSTROPHES.includes(previous) &&
    beforeThat !== undefined &&
    "ogOG".includes(beforeThat)
  )
}

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
  const plainSuffix = `(?:${UZBEK_SUFFIXES.join("|")})`

  // Uzbek attaches suffixes to foreign words through an apostrophe —
  // Google'da, React'ni, GitHub'dan, TikTok'gacha, LLM'larni. Anything after
  // that apostrophe is the suffix, so this does not consult the suffix list at
  // all: listing only the known endings left `TikTok'gacha` half-converted as
  // `TikTokъгача`, and enumerating every Uzbek ending is not a list anyone can
  // finish.
  //
  // It also applies to entries of ANY length, unlike `plainSuffix`. The length
  // floor exists because a bare 3-letter stem is weak evidence (`bun` + `i`
  // would eat `buni`); an apostrophe seam is strong evidence on its own, and
  // the one Uzbek construction that looks like it — o'/g' — is rejected before
  // it gets here.
  const apostropheSuffix = `[${APOSTROPHES}][a-zA-Z]+`

  // Suffixed form first: alternation is ordered, so `reactda` must get the
  // chance to match `react` + `da` before the bare `react` branch takes it and
  // leaves `da` behind to be transliterated on its own.
  //
  // `\b` on the leading edge, deliberately, after trying both alternatives:
  //
  //   A lookbehind `(?<!WORD_CHAR)` reads best, but this regex is built at
  //   MODULE SCOPE — on a browser without lookbehind (Safari before 16.4) the
  //   `new RegExp` throws while the module is still evaluating and the whole
  //   tool page dies rather than degrading.
  //
  //   Consuming the character instead, `(^|NOT_WORD_CHAR)`, makes this branch
  //   start matching one position EARLIER than the URL and email branches, so
  //   it wins the leftmost race against them: `info@webiston.uz` was split at
  //   the space and came out `info@webiston.уз`.
  //
  // `\b`'s one real flaw is that it treats the Uzbek apostrophe as a
  // separator, which exposed the `sha` inside `o'sha`. That is handled where
  // it belongs — `sha` is listed in UZBEK_HOMOGRAPHS — and the trailing
  // lookahead still refuses to match into a following apostrophe.
  // The trailing guard is `\\w` only, NOT WORD_CHAR: an apostrophe AFTER a
  // protected word is a closing quote or the seam handled by `suffix` above,
  // never a continuation of the word. Including it here meant `'React'` (in
  // quotes) failed to match at all and came out `ъРеасть`.
  // Both branches end with an OPTIONAL apostrophe seam, because the two stack:
  // `rendering'ning` is a list entry (`render`) plus a plain suffix (`ing`)
  // plus an apostrophe suffix (`'ning`). Allowing the seam on only one of them
  // left `'ning` outside the placeholder, converted on its own as `ънинг`.
  return (
    "\\b(?:" +
    `(?:${suffixable.join("|")})${plainSuffix}(?:${apostropheSuffix})?` +
    `|(?:${all.join("|")})(?:${apostropheSuffix})?` +
    ")(?!\\w)"
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
    // Non-capturing: with no capture groups anywhere in this regex the replace
    // callback signature is a fixed (match, offset, string).
    "\\b(?:https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*",
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

  const maskedText = safeText.replace(
    protectionRegex,
    (match: string, offset: number) => {
      if (startsInsideUzbekLetter(safeText, offset)) return match

      const index = protectedParts.length
      protectedParts.push(match)
      return createPlaceholder(index)
    }
  )

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
