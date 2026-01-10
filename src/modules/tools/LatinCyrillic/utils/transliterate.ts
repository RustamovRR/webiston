/**
 * Main transliteration module
 * Handles Latin ↔ Cyrillic conversion for Uzbek and Russian
 *
 * Architecture:
 * 1. Protect special content (URLs, emails, code blocks, technical terms)
 * 2. Detect script and language
 * 3. Apply appropriate transliteration algorithm
 * 4. Restore protected content
 */

import { NON_TRANSLITERATABLE_WORDS } from "../constants"
import {
  isLatinVowel,
  isUpperCase,
  isWordBoundary,
  normalizeApostrophes,
  preserveCase
} from "./helpers"
import {
  isRussianOnlyChar,
  RUSSIAN_CYRILLIC_TO_LATIN,
  UZBEK_CYRILLIC_TO_LATIN_SINGLE,
  UZBEK_CYRILLIC_TO_LATIN_SPECIAL,
  UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS,
  UZBEK_LATIN_TO_CYRILLIC_SINGLE
} from "./mappings"

// =============================================================================
// PROTECTION SYSTEM - Preserve content that shouldn't be transliterated
// =============================================================================

const PLACEHOLDER_PREFIX = "\u0000"
const PLACEHOLDER_SUFFIX = "\u0000"

function createPlaceholder(index: number): string {
  return `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`
}

function buildProtectionRegex(): RegExp {
  const apostrophes = "[`´''ʻʼʿˈ′']"
  const patterns = [
    // Code blocks (triple backticks)
    "```[\\s\\S]*?```",
    // Inline code (single backticks)
    "`[^`]+?`",
    // Email addresses
    "\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b",
    // URLs
    "\\b(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*",
    // Protected words (not adjacent to apostrophes)
    `(^|[^${apostrophes}])\\b(${NON_TRANSLITERATABLE_WORDS.join("|")})\\b(?=$|[^${apostrophes}])`
  ]
  return new RegExp(patterns.join("|"), "gi")
}

const protectionRegex = buildProtectionRegex()

interface ProtectionResult {
  maskedText: string
  protectedParts: string[]
}

function protectContent(text: string): ProtectionResult {
  const protectedParts: string[] = []

  const maskedText = text.replace(protectionRegex, (match, p1, p2) => {
    const index = protectedParts.length
    if (p2) {
      // Protected word match: p1 is prefix (keep), p2 is the word (mask)
      protectedParts.push(p2)
      return `${p1}${createPlaceholder(index)}`
    }
    // Full match (code block, email, url)
    protectedParts.push(match)
    return createPlaceholder(index)
  })

  return { maskedText, protectedParts }
}

function restoreContent(text: string, protectedParts: string[]): string {
  const placeholderRegex = new RegExp(
    `${PLACEHOLDER_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}`,
    "g"
  )
  return text.replace(placeholderRegex, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)] || ""
  })
}

// =============================================================================
// LATIN TO CYRILLIC (Uzbek)
// =============================================================================

function transliterateLatinToCyrillic(text: string): string {
  const normalized = normalizeApostrophes(text)
  let result = ""
  let i = 0

  while (i < normalized.length) {
    const char = normalized[i]
    const nextChar = normalized[i + 1] || ""
    const twoChars = char + nextChar
    const lowerChar = char.toLowerCase()
    const lowerTwo = twoChars.toLowerCase()

    // === SPECIAL CASE: 'y' combinations ===
    if (lowerChar === "y") {
      const nextTwo = normalized.substring(i + 1, i + 3).toLowerCase()

      // "yo'" should be "й" + "ў", not "ё"
      if (nextTwo === "o'") {
        result += preserveCase(char, "й")
        i++
        continue
      }

      // "yo" → "ё"
      if (nextChar.toLowerCase() === "o") {
        result += preserveCase(char, "ё")
        i += 2
        continue
      }

      // "ya" → "я"
      if (nextChar.toLowerCase() === "a") {
        result += preserveCase(char, "я")
        i += 2
        continue
      }

      // "yu" → "ю"
      if (nextChar.toLowerCase() === "u") {
        result += preserveCase(char, "ю")
        i += 2
        continue
      }

      // "ye" at word start → "е"
      if (nextChar.toLowerCase() === "e" && isWordBoundary(normalized, i)) {
        result += preserveCase(char, "е")
        i += 2
        continue
      }

      // Standalone "y" → "й"
      result += preserveCase(char, "й")
      i++
      continue
    }

    // === SPECIAL CASE: 'e' at word start → 'э' ===
    if (lowerChar === "e" && isWordBoundary(normalized, i)) {
      result += preserveCase(char, "э")
      i++
      continue
    }

    // === DIGRAPHS with apostrophe ===
    if (lowerTwo === "g'" || lowerTwo === "o'") {
      const cyrillic = UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS[lowerTwo]
      result += preserveCase(char, cyrillic)
      i += 2
      continue
    }

    // === SPECIAL CASE: "ng'" should be "н" + "ғ", not "нг" ===
    if (lowerTwo === "ng" && normalized[i + 2] === "'") {
      result += preserveCase(char, "н")
      i++
      continue
    }

    // === STANDARD DIGRAPHS ===
    if (["sh", "ch", "ng", "ts"].includes(lowerTwo)) {
      const cyrillic = UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS[lowerTwo]
      // Handle case for both characters
      if (isUpperCase(char) && isUpperCase(nextChar)) {
        result += cyrillic.toUpperCase()
      } else {
        result += preserveCase(char, cyrillic)
      }
      i += 2
      continue
    }

    // === APOSTROPHE handling ===
    if (char === "'") {
      const prevChar = i > 0 ? normalized[i - 1].toLowerCase() : ""
      const nextCharLower = nextChar.toLowerCase()

      // Apostrophe between vowels → hard sign (ъ)
      if (isLatinVowel(prevChar) || isLatinVowel(nextCharLower)) {
        result += "ъ"
      } else {
        result += "'"
      }
      i++
      continue
    }

    // === SINGLE CHARACTER mapping ===
    const cyrillicChar = UZBEK_LATIN_TO_CYRILLIC_SINGLE[lowerChar]
    if (cyrillicChar) {
      result += preserveCase(char, cyrillicChar)
    } else {
      // Keep character as-is (numbers, punctuation, etc.)
      result += char
    }
    i++
  }

  return result
}

// =============================================================================
// CYRILLIC TO LATIN (Uzbek + Russian support)
// =============================================================================

function transliterateCyrillicToLatin(text: string): string {
  let result = ""
  let i = 0

  while (i < text.length) {
    const char = text[i]
    const nextChar = text[i + 1] || ""
    const lowerChar = char.toLowerCase()
    const lowerNext = nextChar.toLowerCase()

    // === DIGRAPH: нг → ng ===
    if (lowerChar === "н" && lowerNext === "г") {
      if (isUpperCase(char) && isUpperCase(nextChar)) {
        result += "NG"
      } else if (isUpperCase(char)) {
        result += "Ng"
      } else {
        result += "ng"
      }
      i += 2
      continue
    }

    // === RUSSIAN-ONLY characters ===
    if (isRussianOnlyChar(char)) {
      const latinChar = RUSSIAN_CYRILLIC_TO_LATIN[lowerChar]
      if (latinChar) {
        result += preserveCase(char, latinChar)
      } else {
        result += char
      }
      i++
      continue
    }

    // === SPECIAL Cyrillic characters (multi-char output) ===
    const specialChar = UZBEK_CYRILLIC_TO_LATIN_SPECIAL[lowerChar]
    if (specialChar) {
      // Special handling for 'е' at word start → 'ye'
      if (lowerChar === "е" && isWordBoundary(text, i)) {
        result += preserveCase(char, "ye")
      } else {
        result += preserveCase(char, specialChar)
      }
      i++
      continue
    }

    // === SINGLE CHARACTER mapping ===
    const latinChar = UZBEK_CYRILLIC_TO_LATIN_SINGLE[lowerChar]
    if (latinChar) {
      result += preserveCase(char, latinChar)
    } else {
      // Keep character as-is
      result += char
    }
    i++
  }

  return normalizeApostrophes(result)
}

// =============================================================================
// PUBLIC API
// =============================================================================

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
