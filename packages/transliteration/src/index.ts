// Public API

// Constants (advanced usage)
export {
  APOSTROPHE_VARIANTS,
  NON_TRANSLITERATABLE_WORDS,
  UZBEK_SUFFIXES
} from "./constants"
// Types
export type { DirectionPreference } from "./converter"
// Conversion policy — which direction, and the one call that runs it
export {
  convert,
  convertWithPreference,
  findPreservedTerms,
  oppositeDirection,
  resolveDirection
} from "./converter"
export { detectScript, isCyrillicDominant, isLatinText } from "./detect-script"
// Helpers (advanced usage)
export {
  isCyrillicVowel,
  isLatinVowel,
  isLowerCase,
  isUpperCase,
  isWordBoundary,
  normalizeApostrophes,
  preserveCase
} from "./helpers"
export {
  MAX_USER_TERM_LENGTH,
  MAX_USER_TERMS,
  normaliseUserTerms
} from "./protection"
export type { ConversionOptions } from "./transliterate"
export { isCyrillicText, toCyrillic, toLatin } from "./transliterate"
export type {
  CharacterMapping,
  DigraphMapping,
  ScriptType,
  TransliterationDirection,
  TransliterationMode,
  TransliterationOptions
} from "./types"
