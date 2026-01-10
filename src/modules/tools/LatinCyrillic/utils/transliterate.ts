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
 * Detect if text contains predominantly Cyrillic characters
 * Returns true if Cyrillic characters are more than Latin
 */
export function isCyrillicText(text: string): boolean {
  if (!text || text.length < 2) return false

  // Cyrillic Unicode range: U+0400 to U+04FF
  const cyrillicRegex = /[\u0400-\u04FF]/g
  // Latin Unicode range: basic Latin letters
  const latinRegex = /[a-zA-Z]/g

  const cyrillicMatches = text.match(cyrillicRegex) || []
  const latinMatches = text.match(latinRegex) || []

  return (
    cyrillicMatches.length > 0 && cyrillicMatches.length >= latinMatches.length
  )
}

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
