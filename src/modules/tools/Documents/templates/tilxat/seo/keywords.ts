/**
 * Search terms for the tilxat tool.
 *
 * The gap was verified the same way number-to-words was: "tilxat namunasi"
 * queries return legal-advice ARTICLES (adliya.uz, yuristpro.uz, bank blogs)
 * and template dumps — no interactive tool. The articles explain what a
 * tilxat must contain; none of them writes one for you.
 *
 * The Cyrillic-Uzbek block exists for the same reason it does on
 * number-to-words: the demographic writing tilxats skews older and searches
 * in Cyrillic, and nobody targets that spelling.
 */

const UZBEK_KEYWORDS = [
  "tilxat namunasi",
  "tilxat yozish",
  "qarz tilxati",
  "tilxat shakli",
  "tilxat qanday yoziladi",
  "pul qarz berish tilxat",
  "qarz olganlik haqida tilxat",
  "tilxat namunasi qarz uchun",
  "tilxat blanka"
] as const

const UZBEK_CYRILLIC_KEYWORDS = [
  "тилхат намунаси",
  "тилхат ёзиш",
  "қарз тилхати",
  "тилхат шакли"
] as const

const RUSSIAN_KEYWORDS = [
  "расписка о займе узбекистан",
  "расписка образец узбекистан",
  "долговая расписка образец",
  "расписка о получении денег",
  "как написать расписку о долге"
] as const

const ENGLISH_KEYWORDS = [
  "loan receipt template uzbek",
  "promissory note uzbekistan",
  "tilxat template"
] as const

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...UZBEK_CYRILLIC_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
