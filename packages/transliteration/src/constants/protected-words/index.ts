/**
 * Protected words - barrel export
 * Words that should NOT be transliterated
 */

export { BRANDS_AND_PLATFORMS } from "./brands"
export { FRAMEWORKS_AND_TOOLS } from "./frameworks"
export { INTERNATIONAL_ACRONYMS } from "./international"
export { JAVASCRIPT_KEYWORDS } from "./javascript"
export { MEDICAL_SCIENTIFIC } from "./medical"
export { PROGRAMMING_TERMS } from "./programming"
export { TECHNOLOGY_TERMS } from "./technology"

// Combine all protected words
import { BRANDS_AND_PLATFORMS } from "./brands"
import { FRAMEWORKS_AND_TOOLS } from "./frameworks"
import { INTERNATIONAL_ACRONYMS } from "./international"
import { JAVASCRIPT_KEYWORDS } from "./javascript"
import { MEDICAL_SCIENTIFIC } from "./medical"
import { PROGRAMMING_TERMS } from "./programming"
import { TECHNOLOGY_TERMS } from "./technology"

/**
 * Entries that LOOK technical but are ordinary Uzbek, and must therefore be
 * transliterated like any other word. Subtracted from the list below.
 *
 * Each one was found by running the engine over everyday Uzbek text and
 * catching the word that came back still in Latin. Two kinds:
 *
 *   NATIVE WORDS the list happened to collide with
 *     tan   — "tan olmoq" (to admit), "tan" (body) · was protected as tangent
 *     sin   — "sin!" (break!, imperative of sinmoq) · was protected as sine
 *     bar   — "bar" (the venue) · was protected as the unit / progress bar
 *
 *   LOANWORDS UZBEK HAS FULLY ABSORBED and writes in Cyrillic
 *     test → тест · format → формат · super → супер · start → старт
 *     virus → вирус · neon → неон · nafta → нафта
 *
 * Measured before this list existed: 10 of 244 everyday Uzbek words and 12 of
 * 66 common loanwords came out of the converter still in Latin, producing
 * mixed-script output in ordinary prose.
 *
 * The bar for adding an entry here is that a general reader — not a developer —
 * would be surprised to see the word left in Latin. Brand and product names
 * (React, GitHub, Docker) do NOT belong here: nobody wants "Гитҳуб".
 */
const UZBEK_HOMOGRAPHS = new Set([
  "tan",
  "sin",
  "bar",
  "test",
  "format",
  "super",
  "start",
  "virus",
  "neon",
  "nafta"
])

export const NON_TRANSLITERATABLE_WORDS = [
  ...FRAMEWORKS_AND_TOOLS,
  ...PROGRAMMING_TERMS,
  ...JAVASCRIPT_KEYWORDS,
  ...BRANDS_AND_PLATFORMS,
  ...TECHNOLOGY_TERMS,
  ...INTERNATIONAL_ACRONYMS,
  ...MEDICAL_SCIENTIFIC
].filter((word) => !UZBEK_HOMOGRAPHS.has(word.toLowerCase()))

/**
 * All apostrophe/quote variants that should be normalized to standard apostrophe (')
 * Using Unicode escape sequences for reliability
 */
export const APOSTROPHE_VARIANTS = [
  "\u0060", // ` Grave accent
  "\u00B4", // ´ Acute accent
  "\u2019", // ' Right single quotation mark
  "\u2018", // ' Left single quotation mark
  "\u02BB", // ʻ Modifier letter turned comma
  "\u02BC", // ʼ Modifier letter apostrophe
  "\u02BF", // ʿ Modifier letter left half ring
  "\u02C8", // ˈ Modifier letter vertical line
  "\u2032", // ′ Prime
  "\u02B9", // ʹ Modifier letter prime
  "\u0027" // ' Standard apostrophe (target)
] as const

/**
 * Characters that indicate word boundaries
 */
export const WORD_BOUNDARY_CHARS = /[\s(\-"'«»„""]/
