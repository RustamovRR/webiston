/**
 * Main transliteration module - Public API
 * Handles Latin ↔ Cyrillic conversion for Uzbek and Russian
 *
 * Architecture:
 * 1. Protect special content (URLs, emails, code blocks, technical terms)
 * 2. Detect script and language
 * 3. Apply appropriate transliteration algorithm
 * 4. Restore protected content
 */

import { transliterateCyrillicToLatin } from "./cyrillic-to-latin"
import { transliterateLatinToCyrillic } from "./latin-to-cyrillic"
import { protectContent, restoreContent } from "./protection"

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Detect if text contains predominantly Cyrillic characters.
 *
 * One implementation, in detect-script.ts. There used to be two \u2014 this one
 * counted raw characters, `detectScript` counted them again with different
 * thresholds, and callers picked whichever name they happened to import.
 */
export { isCyrillicDominant as isCyrillicText } from "./detect-script"

/**
 * Convert Latin text to Cyrillic (Uzbek)
 * Handles: URLs, emails, code blocks, technical terms protection
 */
export function toCyrillic(text: string): string {
  if (!text) return ""

  const { maskedText, protectedParts } = protectContent(text)
  const transliterated = transliterateLatinToCyrillic(maskedText)
  return restoreContent(transliterated, protectedParts)
}

/**
 * Convert Cyrillic text to Latin (Uzbek + Russian support)
 * Handles: URLs, emails, code blocks, technical terms protection
 */
export function toLatin(text: string): string {
  if (!text) return ""

  const { maskedText, protectedParts } = protectContent(text)
  const transliterated = transliterateCyrillicToLatin(maskedText)
  return restoreContent(transliterated, protectedParts)
}
