/**
 * Cyrillic to Latin transliteration (Uzbek + Russian support)
 * Handles context-aware "е" conversion and Russian-specific characters
 */

import {
  isCyrillicVowel,
  isUpperCase,
  isWordBoundary,
  normalizeApostrophes,
  preserveCase
} from "./helpers"
import {
  getRussianTimeNameInUzbek,
  isRussianOnlyChar,
  RUSSIAN_CYRILLIC_TO_LATIN,
  UZBEK_CYRILLIC_TO_LATIN_SINGLE,
  UZBEK_CYRILLIC_TO_LATIN_SPECIAL
} from "./mappings"

/**
 * Extract a Cyrillic word starting at given index
 */
function extractCyrillicWord(text: string, startIndex: number): string {
  let word = ""
  let i = startIndex
  while (i < text.length && /[\u0400-\u04FF]/.test(text[i])) {
    word += text[i]
    i++
  }
  return word
}

/**
 * Check if "е" should be transliterated as "ye"
 * Rules:
 * 1. At word start → "ye"
 * 2. After vowel (а, е, ё, и, о, у, ы, э, ю, я) → "ye"
 * 3. After ъ or ь → "ye"
 * 4. After consonant → "e"
 */
function shouldEBeYe(text: string, index: number): boolean {
  if (isWordBoundary(text, index)) {
    return true
  }

  const prevChar = text[index - 1]

  if (isCyrillicVowel(prevChar)) {
    return true
  }

  if ("ъьЪЬ".includes(prevChar)) {
    return true
  }

  return false
}

/**
 * Apply case from source character to target string
 * For multi-char output (digraphs), checks if we're in ALL CAPS context
 */
function applyCaseAware(
  char: string,
  target: string,
  text: string,
  index: number
): string {
  if (!isUpperCase(char)) {
    return target.toLowerCase()
  }

  // Check if next char is also uppercase (ALL CAPS word)
  const nextChar = text[index + 1]
  if (nextChar && isUpperCase(nextChar)) {
    return target.toUpperCase()
  }

  // Check if previous char is uppercase (middle of ALL CAPS word)
  const prevChar = text[index - 1]
  if (prevChar && isUpperCase(prevChar) && !/[\s-]/.test(prevChar)) {
    return target.toUpperCase()
  }

  // Title case - only first letter uppercase
  return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase()
}

/**
 * Transliterate Cyrillic text to Latin (Uzbek + Russian)
 * Handles context-aware rules for "е" and Russian-specific characters
 */
export function transliterateCyrillicToLatin(text: string): string {
  let result = ""
  let i = 0

  while (i < text.length) {
    const char = text[i]
    const nextChar = text[i + 1] || ""
    const lowerChar = char.toLowerCase()
    const lowerNext = nextChar.toLowerCase()

    // === CHECK FOR RUSSIAN MONTH/DAY NAMES ===
    if (/[\u0400-\u04FF]/.test(char) && isWordBoundary(text, i)) {
      const word = extractCyrillicWord(text, i)
      const uzbekEquivalent = getRussianTimeNameInUzbek(word)
      if (uzbekEquivalent) {
        // Preserve case pattern
        if (word === word.toUpperCase()) {
          result += uzbekEquivalent.toUpperCase()
        } else if (isUpperCase(word[0])) {
          result +=
            uzbekEquivalent.charAt(0).toUpperCase() + uzbekEquivalent.slice(1)
        } else {
          result += uzbekEquivalent
        }
        i += word.length
        continue
      }
    }

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

    // === HARD SIGN (ъ) handling - used in both Uzbek and Russian ===
    if (lowerChar === "ъ") {
      result += "'"
      i++
      continue
    }

    // === SPECIAL: "е" handling ===
    if (lowerChar === "е") {
      if (shouldEBeYe(text, i)) {
        result += applyCaseAware(char, "ye", text, i)
      } else {
        result += preserveCase(char, "e")
      }
      i++
      continue
    }

    // === RUSSIAN-ONLY characters ===
    if (isRussianOnlyChar(char)) {
      // Special handling for ь (soft sign)
      if (lowerChar === "ь") {
        const nextLower = nextChar.toLowerCase()
        // ь before iotated vowel (е, ё, ю, я) → apostrophe
        // семья → sem'ya, вьюга → v'yuga, компьютер → komp'yuter
        if ("еёюя".includes(nextLower)) {
          result += "'"
          i++
          continue
        }
        // ь at end of word or before consonant → apostrophe
        // мать → mat', очень → ochen'
        result += "'"
        i++
        continue
      }

      const latinChar = RUSSIAN_CYRILLIC_TO_LATIN[lowerChar]
      if (latinChar) {
        result += applyCaseAware(char, latinChar, text, i)
      } else {
        result += char
      }
      i++
      continue
    }

    // === SPECIAL Cyrillic characters (multi-char output) ===
    const specialChar = UZBEK_CYRILLIC_TO_LATIN_SPECIAL[lowerChar]
    if (specialChar) {
      result += applyCaseAware(char, specialChar, text, i)
      i++
      continue
    }

    // === SINGLE CHARACTER mapping ===
    const latinChar = UZBEK_CYRILLIC_TO_LATIN_SINGLE[lowerChar]
    if (latinChar) {
      result += preserveCase(char, latinChar)
    } else {
      result += char
    }
    i++
  }

  return normalizeApostrophes(result)
}
