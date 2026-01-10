/**
 * Type definitions for LatinCyrillic module
 */

// Translation direction
export type TransliterationDirection = "latin-to-cyrillic" | "cyrillic-to-latin"

// Script detection result
export type ScriptType = "latin" | "cyrillic" | "mixed" | "unknown"

// Transliteration mode
export type TransliterationMode = "uzbek" | "russian" | "auto"

// Translation function type (from next-intl)
export type TranslationFunction = (key: string) => string

// Sample text keys
export type SampleTextKey =
  | "LATIN_GREETING"
  | "LATIN_PARAGRAPH"
  | "CYRILLIC_GREETING"
  | "CYRILLIC_PARAGRAPH"
  | "RUSSIAN_GREETING"
  | "RUSSIAN_PARAGRAPH"

// Hook return type
export interface UseLatinCyrillicResult {
  // State
  direction: TransliterationDirection
  sourceText: string
  convertedText: string

  // Actions
  setDirection: (direction: TransliterationDirection) => void
  setSourceText: (text: string) => void
  handleSwap: () => void
  handleClear: () => void
  loadSample: (sampleKey: SampleTextKey) => void

  // Computed
  sourceLang: string
  targetLang: string
  sourcePlaceholder: string
  samples: SampleItem[]
}

// Sample item for dropdown
export interface SampleItem {
  key: string
  label: string
  value: string
}

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
