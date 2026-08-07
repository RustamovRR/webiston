/**
 * Script detection utilities
 * Detects whether text is Latin, Cyrillic, or mixed
 */

import { protectContent } from "./protection"
import type { ScriptType } from "./types"

// Unicode ranges for script detection
const CYRILLIC_RANGE = /[\u0400-\u04FF]/
const LATIN_RANGE = /[a-zA-Z]/

/**
 * Count the letters that actually get a VOTE on which script this is.
 *
 * The spans `protectContent` masks \u2014 URLs, emails, @handles, code, file names,
 * technical terms \u2014 are Latin by nature and are never transliterated, so
 * counting them decides the direction on characters the converter will not
 * touch. One link was enough to flip a whole Cyrillic article:
 *
 *   "\u0411\u0430\u0442\u0430\u0444\u0441\u0438\u043B: https://gazeta.uz/oz/2024/01/01/latin-kirill/"
 *   \u2192 8 Cyrillic letters vs 34 Latin ones \u2192 classified Latin \u2192 converted the
 *     wrong way, or not at all.
 *
 * Masking first removes exactly those characters (a placeholder is a digit
 * between two NULs and contributes no letter to either side), so the vote is
 * taken on the prose the user actually wants converted.
 *
 * This is shared by every surface: the web tool, the extension popup, the
 * context menu and the in-page popover all resolve direction through here.
 */
function countScripts(text: string): { latin: number; cyrillic: number } {
  const { maskedText } = protectContent(text)
  let latin = 0
  let cyrillic = 0

  for (const char of maskedText) {
    if (LATIN_RANGE.test(char)) {
      latin++
    } else if (CYRILLIC_RANGE.test(char)) {
      cyrillic++
    }
  }

  return { latin, cyrillic }
}

/**
 * Does Cyrillic carry this text? The binary question the converter asks before
 * picking a direction \u2014 deliberately NOT the same as `detectScript`, which has
 * a third "mixed" answer that a direction switch cannot act on.
 */
export function isCyrillicDominant(text: string): boolean {
  if (!text || text.length < 2) return false

  const { latin, cyrillic } = countScripts(text)

  return cyrillic > 0 && cyrillic >= latin
}

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

  const { latin: latinCount, cyrillic: cyrillicCount } = countScripts(text)

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
