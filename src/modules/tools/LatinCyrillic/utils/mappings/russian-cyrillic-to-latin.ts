/**
 * Russian Cyrillic to Latin character mappings
 * Based on ISO 9:1995 / GOST 7.79-2000 System B
 *
 * This handles Russian-specific characters that don't exist in Uzbek Cyrillic:
 * Ы, Щ, Ъ (твёрдый знак), Ь (мягкий знак)
 */

import type { CharacterMapping } from "../../types"

/**
 * Russian-only Cyrillic characters (not in Uzbek alphabet)
 * These need special handling when detected
 */
export const RUSSIAN_CYRILLIC_TO_LATIN: CharacterMapping = {
  // Russian-specific vowels
  ы: "y",

  // Russian-specific consonants
  щ: "shch",

  // Signs (modify pronunciation)
  // ъ and ь are handled specially in transliterate.ts
  ъ: "'", // Hard sign - apostrophe before е, ё, ю, я
  ь: "", // Soft sign - usually silent, apostrophe before vowels

  // These exist in both but may have different transliteration in Russian context
  ж: "zh", // Russian: zh (Uzbek: j)
  х: "kh", // Russian: kh (Uzbek: x)
  ц: "ts",
  ч: "ch",
  ш: "sh",

  // Compound vowels
  ё: "yo",
  ю: "yu",
  я: "ya"
  // Note: "е" is handled specially - "ye" at start/after vowel, "e" after consonant
}

/**
 * Characters that indicate Russian text (not Uzbek)
 * Note: ъ is used in both Uzbek and Russian, so it's not Russian-only
 */
export const RUSSIAN_ONLY_CHARS = ["ы", "щ", "ь", "Ы", "Щ", "Ь"]

/**
 * Check if a character is Russian-only (not in Uzbek Cyrillic)
 */
export function isRussianOnlyChar(char: string): boolean {
  return RUSSIAN_ONLY_CHARS.includes(char)
}
