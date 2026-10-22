/**
 * Core transliteration types
 */

// Translation direction
export type TransliterationDirection = "latin-to-cyrillic" | "cyrillic-to-latin"

// Script detection result
export type ScriptType = "latin" | "cyrillic" | "mixed" | "unknown"

/**
 * The three alphabets Uzbek is written in today. "latin" is the 1995 alphabet
 * (oʻ, gʻ, sh, ch) — the official one until 22.04.2027; "latin-2027" is the one
 * Law OʻRQ-1184 replaces it with (ö, ğ, ş, ç).
 */
export type UzbekScript = "latin" | "latin-2027" | "cyrillic"

// Transliteration mode
export type TransliterationMode = "uzbek" | "russian" | "auto"

// Character mapping types
export interface CharacterMapping {
  [key: string]: string
}

export interface DigraphMapping {
  [key: string]: string
}

// Transliteration options
export interface TransliterationOptions {
  mode?: TransliterationMode
  preserveCase?: boolean
  normalizeApostrophes?: boolean
}
