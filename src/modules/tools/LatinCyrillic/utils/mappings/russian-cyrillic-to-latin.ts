/**
 * Russian Cyrillic to Latin character mappings
 * Based on ISO 9:1995 / GOST 7.79-2000 System B
 *
 * This handles Russian-specific characters that don't exist in Uzbek Cyrillic:
 * Ы, Щ, Ъ (твёрдый знак), Ь (мягкий знак), Э
 */

import type { CharacterMapping } from "../../types"

/**
 * Russian-only Cyrillic characters (not in Uzbek alphabet)
 * These need special handling when detected
 */
export const RUSSIAN_CYRILLIC_TO_LATIN: CharacterMapping = {
  // Russian-specific vowels
  ы: "y", // or "i" in some systems
  э: "e", // Same as Uzbek

  // Russian-specific consonants
  щ: "shch", // or "sch" in German-influenced systems

  // Signs (no sound, modify previous consonant)
  ъ: "'", // Hard sign - usually omitted or apostrophe
  ь: "'", // Soft sign - usually omitted or apostrophe

  // These exist in both but may have different transliteration
  ж: "zh", // Russian: zh, Uzbek: j
  х: "kh", // Russian: kh, Uzbek: x
  ц: "ts", // Same
  ч: "ch", // Same
  ш: "sh", // Same

  // Compound vowels (same as Uzbek)
  ё: "yo",
  ю: "yu",
  я: "ya",
  е: "e" // or "ye" at word start
}

/**
 * Full Russian alphabet mapping for completeness
 * Used when text is detected as Russian
 */
export const RUSSIAN_FULL_MAPPING: CharacterMapping = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "'",
  ы: "y",
  ь: "'",
  э: "e",
  ю: "yu",
  я: "ya"
}

/**
 * Characters that indicate Russian text (not Uzbek)
 */
export const RUSSIAN_ONLY_CHARS = ["ы", "щ", "ъ", "ь", "Ы", "Щ", "Ъ", "Ь"]

/**
 * Check if a character is Russian-only (not in Uzbek Cyrillic)
 */
export function isRussianOnlyChar(char: string): boolean {
  return RUSSIAN_ONLY_CHARS.includes(char)
}
