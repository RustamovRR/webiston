/**
 * Search terms for the tushuntirish xati.
 *
 * The widest gap of the three documents. "tushuntirish xati namunasi" returns
 * HR articles about MK 313 and .doc dumps on portal sites — every one of them
 * a single fixed wording that ADMITS the act, because that is the easiest
 * template to write. Nobody offers the choice of how the note ends, which is
 * the only part of it that matters if the case reaches a court.
 *
 * The Cyrillic-Uzbek block is deliberate, and stronger here than on the other
 * two: this document is most often demanded of factory, school and clinic
 * staff, who search in Cyrillic and are served nothing.
 */

const UZBEK_KEYWORDS = [
  "tushuntirish xati",
  "tushuntirish xati namunasi",
  "tushuntirish xati qanday yoziladi",
  "ishga kechikkanlik uchun tushuntirish xati",
  "tushuntirish xati shakli",
  "intizomiy jazo tushuntirish xati",
  "tushuntirish xati namunasi ish joyiga",
  "izohnoma",
  "izohnoma namunasi"
] as const

const UZBEK_CYRILLIC_KEYWORDS = [
  "тушунтириш хати",
  "тушунтириш хати намунаси",
  "тушунтириш хати қандай ёзилади",
  "изохнома намунаси"
] as const

const RUSSIAN_KEYWORDS = [
  "объяснительная записка",
  "объяснительная записка образец узбекистан",
  "объяснительная записка на работу образец",
  "как написать объяснительную записку",
  "объяснительная за опоздание образец"
] as const

const ENGLISH_KEYWORDS = [
  "explanatory note template uzbekistan",
  "employee written explanation uzbekistan",
  "explanatory letter disciplinary uzbek"
] as const

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...UZBEK_CYRILLIC_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
