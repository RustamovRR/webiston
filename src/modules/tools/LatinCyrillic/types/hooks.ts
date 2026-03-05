/**
 * Hook-related types
 */

import type { TransliterationDirection } from "./transliteration"

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

// Sample item for dropdown
export interface SampleItem {
  key: string
  label: string
  value: string
}

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
