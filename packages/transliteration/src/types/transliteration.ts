/**
 * Core transliteration types
 */

// Translation direction
export type TransliterationDirection = "latin-to-cyrillic" | "cyrillic-to-latin"

// Script detection result
export type ScriptType = "latin" | "cyrillic" | "mixed" | "unknown"

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
