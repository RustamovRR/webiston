/**
 * Script detection utilities
 * Detects whether text is Latin, Cyrillic, or mixed
 */

import type { ScriptType } from "./types"

// Unicode ranges for script detection
const CYRILLIC_RANGE = /[\u0400-\u04FF]/
const LATIN_RANGE = /[a-zA-Z]/

// Uzbek-specific Cyrillic characters
const UZBEK_CYRILLIC = /[ўғқҳЎҒҚҲ]/

// Russian-specific Cyrillic characters (not in Uzbek)
const RUSSIAN_ONLY_CYRILLIC = /[ыщъьЫЩЪЬ]/

/**
 * Detect the primary script type of the text
 */
export function detectScript(text: string): ScriptType {
  if (!text || text.trim().length === 0) {
    return "unknown"
  }

  let latinCount = 0
  let cyrillicCount = 0

  for (const char of text) {
    if (LATIN_RANGE.test(char)) {
      latinCount++
    } else if (CYRILLIC_RANGE.test(char)) {
      cyrillicCount++
    }
  }

  const total = latinCount + cyrillicCount

  if (total === 0) {
    return "unknown"
  }

  // If both scripts present with significant amounts
  if (latinCount > 0 && cyrillicCount > 0) {
    const latinRatio = latinCount / total
    const cyrillicRatio = cyrillicCount / total

    // Consider mixed if both have at least 20%
    if (latinRatio >= 0.2 && cyrillicRatio >= 0.2) {
      return "mixed"
    }
  }

  // Dominant script
  if (cyrillicCount > latinCount) {
    return "cyrillic"
  }

  return "latin"
}

/**
 * Check if text is primarily Latin script
 */
export function isLatinText(text: string): boolean {
  return detectScript(text) === "latin"
}

/**
 * Check if text is primarily Cyrillic script
 */
export function isCyrillicText(text: string): boolean {
  return detectScript(text) === "cyrillic"
}

/**
 * Check if text contains Uzbek-specific Cyrillic characters
 */
export function hasUzbekCyrillic(text: string): boolean {
  return UZBEK_CYRILLIC.test(text)
}

/**
 * Check if text contains Russian-only Cyrillic characters
 * (characters not used in Uzbek Cyrillic)
 */
export function hasRussianOnlyCyrillic(text: string): boolean {
  return RUSSIAN_ONLY_CYRILLIC.test(text)
}

/**
 * Detect if Cyrillic text is Uzbek or Russian
 * Returns 'uzbek', 'russian', or 'unknown'
 */
export function detectCyrillicLanguage(
  text: string
): "uzbek" | "russian" | "unknown" {
  if (!isCyrillicText(text)) {
    return "unknown"
  }

  const hasUzbek = hasUzbekCyrillic(text)
  const hasRussian = hasRussianOnlyCyrillic(text)

  if (hasUzbek && !hasRussian) {
    return "uzbek"
  }

  if (hasRussian && !hasUzbek) {
    return "russian"
  }

  // If both or neither, default to uzbek for this tool's context
  return hasUzbek ? "uzbek" : "unknown"
}
