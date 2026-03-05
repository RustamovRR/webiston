/**
 * Uzbek Cyrillic to Latin character mappings
 * Based on official O'zbekiston Respublikasi standartlari
 */

import type { CharacterMapping } from "../types"

/**
 * Single character mappings (Cyrillic → Latin)
 */
export const UZBEK_CYRILLIC_TO_LATIN_SINGLE: CharacterMapping = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e", // Context-dependent: 'ye' at word start
  ж: "j",
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
  х: "x",

  // Uzbek-specific characters
  қ: "q",
  ғ: "g'",
  ҳ: "h",
  ў: "o'"
}

/**
 * Special Cyrillic characters that map to multiple Latin chars
 */
export const UZBEK_CYRILLIC_TO_LATIN_SPECIAL: CharacterMapping = {
  // Compound vowels
  ё: "yo",
  ю: "yu",
  я: "ya",

  // Consonant clusters
  ш: "sh",
  ч: "ch",
  ц: "ts",

  // Hard/soft signs
  ъ: "'",
  э: "e" // Always 'e', context handled separately
}

/**
 * Digraph: нг → ng
 * Must be handled separately in the algorithm
 */
export const UZBEK_CYRILLIC_DIGRAPH = {
  нг: "ng"
}
