/**
 * Latin to Cyrillic transliteration (Uzbek)
 * Handles greedy digraph matching and special character combinations
 */

import {
  isLatinVowel,
  isUpperCase,
  isWordBoundary,
  normalizeApostrophes,
  preserveCase
} from "./helpers"
import {
  UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS,
  UZBEK_LATIN_TO_CYRILLIC_SINGLE
} from "./mappings"

/**
 * Transliterate Latin text to Cyrillic (Uzbek)
 * Uses greedy matching for digraphs (sh, ch, ng, etc.)
 */
export function transliterateLatinToCyrillic(text: string): string {
  const normalized = normalizeApostrophes(text)
  let result = ""
  let i = 0

  while (i < normalized.length) {
    const char = normalized[i]
    const nextChar = normalized[i + 1] || ""
    const twoChars = char + nextChar
    const lowerChar = char.toLowerCase()
    const lowerTwo = twoChars.toLowerCase()

    // === SPECIAL CASE: 'shch' → 'щ' (must check before 'sh') ===
    const fourChars = normalized.substring(i, i + 4).toLowerCase()
    if (fourChars === "shch") {
      const original = normalized.substring(i, i + 4)
      if (original === original.toUpperCase()) {
        result += "Щ"
      } else {
        result += preserveCase(char, "щ")
      }
      i += 4
      continue
    }

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

      // "ye" → "е" (at word start or after vowel)
      if (nextChar.toLowerCase() === "e") {
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

    // === STANDARD DIGRAPHS (excluding 'ts' - rare in Uzbek, causes issues in compound words) ===
    if (["sh", "ch", "ng"].includes(lowerTwo)) {
      const cyrillic = UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS[lowerTwo]
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

      // 'h after consonant → skip apostrophe, h will become ҳ
      if (nextCharLower === "h" && !isLatinVowel(prevChar)) {
        i++
        continue
      }

      // Check for 'y + vowel pattern (like 'ya, 'ye, 'yo, 'yu)
      // This is Russian soft sign + iotated vowel: ья, ье, ьё, ью
      const afterNext = normalized[i + 2]?.toLowerCase() || ""
      if (nextCharLower === "y" && "aeou".includes(afterNext)) {
        result += "ь"
        i++
        continue
      }

      // O'zbek: Apostrophe after vowel → hard sign (ъ)
      // Examples: a'lo, ma'no, she'r, e'tibor
      // This covers both vowel+'+vowel and vowel+'+consonant
      if (isLatinVowel(prevChar)) {
        result += "ъ"
        i++
        continue
      }

      // Rus: Apostrophe at end of word → soft sign (ь)
      // Example: ochen' → очень
      const isEndOfWord = !nextChar || /[\s.,!?;:-]/.test(nextChar)
      if (isEndOfWord) {
        result += "ь"
        i++
        continue
      }

      // Rus: Apostrophe before vowel after consonant → soft sign (ь)
      // Example: p'esa → пьеса
      if (!isLatinVowel(prevChar) && isLatinVowel(nextCharLower)) {
        result += "ь"
        i++
        continue
      }

      // Default: keep as apostrophe
      result += "'"
      i++
      continue
    }

    // === SINGLE CHARACTER mapping ===
    const cyrillicChar = UZBEK_LATIN_TO_CYRILLIC_SINGLE[lowerChar]
    if (cyrillicChar) {
      result += preserveCase(char, cyrillicChar)
    } else {
      result += char
    }
    i++
  }

  return result
}
