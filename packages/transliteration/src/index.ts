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
export {
  detectScript,
  detectUzbekScript,
  isCyrillicDominant,
  isLatinText
} from "./detect-script"
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
// The 2027 alphabet (Law OʻRQ-1184) — the letters, for anything that renders them
export type { Latin2027Letter } from "./mappings"
export {
  LATIN_2027_LETTERS,
  LATIN_2027_LOOKALIKES,
  TUTUQ_BELGISI
} from "./mappings"
export {
  MAX_USER_TERM_LENGTH,
  MAX_USER_TERMS,
  normaliseUserTerms
} from "./protection"
export type { ConversionOptions } from "./transliterate"
export {
  isCyrillicText,
  toCyrillic,
  toLatin,
  toUzbekScript
} from "./transliterate"
export type {
  CharacterMapping,
  DigraphMapping,
  ScriptType,
  TransliterationDirection,
  TransliterationMode,
  TransliterationOptions,
  UzbekScript
} from "./types"
