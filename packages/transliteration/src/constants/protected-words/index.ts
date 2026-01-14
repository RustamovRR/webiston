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

export const NON_TRANSLITERATABLE_WORDS = [
  ...FRAMEWORKS_AND_TOOLS,
  ...PROGRAMMING_TERMS,
  ...JAVASCRIPT_KEYWORDS,
  ...BRANDS_AND_PLATFORMS,
  ...TECHNOLOGY_TERMS,
  ...INTERNATIONAL_ACRONYMS,
  ...MEDICAL_SCIENTIFIC
] as const

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
