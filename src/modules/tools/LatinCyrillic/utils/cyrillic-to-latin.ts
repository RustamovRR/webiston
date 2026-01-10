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
  isRussianOnlyChar,
  RUSSIAN_CYRILLIC_TO_LATIN,
  UZBEK_CYRILLIC_TO_LATIN_SINGLE,
  UZBEK_CYRILLIC_TO_LATIN_SPECIAL
} from "./mappings"

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
        result += preserveCase(char, "ye")
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
        // ь before vowel (е, ё, ю, я, а, о, у, и) → apostrophe
        if ("еёюяаоуи".includes(nextLower)) {
          result += "'"
        } else {
          // Soft sign at end of word or before consonant → apostrophe
          result += "'"
        }
        i++
        continue
      }

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
      result += preserveCase(char, specialChar)
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
