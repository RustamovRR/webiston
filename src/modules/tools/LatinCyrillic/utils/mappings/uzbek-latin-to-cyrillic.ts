/**
 * Uzbek Latin to Cyrillic character mappings
 * Based on official O'zbekiston Respublikasi standartlari
 */

import type { CharacterMapping, DigraphMapping } from "../../types"

/**
 * Single character mappings (Latin → Cyrillic)
 * Order doesn't matter for single chars
 */
export const UZBEK_LATIN_TO_CYRILLIC_SINGLE: CharacterMapping = {
  a: "а",
  b: "б",
  c: "с", // 'c' → 'с' (for foreign words like "practice")
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "ҳ",
  i: "и",
  j: "ж",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "қ",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в", // 'w' → 'в' (for foreign words)
  x: "х",
  y: "й",
  z: "з"
}

/**
 * Digraph mappings (two Latin chars → one/two Cyrillic)
 * These must be checked BEFORE single characters
 * Order matters: longer patterns first
 */
export const UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS: DigraphMapping = {
  // Special Uzbek digraphs with apostrophe
  "g'": "ғ",
  "o'": "ў",

  // Standard digraphs
  sh: "ш",
  ch: "ч",
  ng: "нг",

  // Compound vowels (ya, yo, yu, ye)
  yo: "ё",
  yu: "ю",
  ya: "я",
  ye: "е", // Only at word beginning

  // Foreign loan words
  ts: "ц"
}

/**
 * Special rules for context-dependent transliteration
 */
export const UZBEK_LATIN_SPECIAL_RULES = {
  // 'e' at word beginning becomes 'э'
  E_AT_START: true,

  // 'ye' at word beginning becomes 'е' (not 'йе')
  YE_AT_START: true,

  // Apostrophe between vowels becomes 'ъ'
  APOSTROPHE_HARD_SIGN: true
}
