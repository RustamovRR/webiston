/**
 * Search terms for the resignation ariza.
 *
 * The same gap as the tilxat, and wider: "ishdan bo'shash arizasi namunasi"
 * returns HR articles (kadrovik.uz, norma.uz) and .doc dumps on portal sites.
 * They explain the two-week rule; none of them counts the fourteen days from
 * the day you are filling the form in, which is the mistake that sends an
 * ariza back for rewriting.
 *
 * The Cyrillic-Uzbek block is deliberate: the people writing this document
 * skew older than the developer audience and search in Cyrillic, and nobody
 * targets that spelling.
 */

const UZBEK_KEYWORDS = [
  "ishdan bo'shash arizasi",
  "ishdan bo'shash arizasi namunasi",
  "ariza namunasi",
  "ish haqida ariza namunasi",
  "o'z xohishiga ko'ra ishdan bo'shash arizasi",
  "ishdan bo'shatish arizasi qanday yoziladi",
  "ariza shakli",
  "ishdan ketish arizasi",
  "mehnat shartnomasini bekor qilish arizasi"
] as const

const UZBEK_CYRILLIC_KEYWORDS = [
  "ишдан бўшаш аризаси",
  "ариза намунаси",
  "ишдан бўшаш аризаси намунаси",
  "ариза шакли"
] as const

const RUSSIAN_KEYWORDS = [
  "заявление на увольнение узбекистан",
  "заявление об увольнении образец",
  "заявление по собственному желанию образец",
  "увольнение по собственному желанию узбекистан",
  "как написать заявление на увольнение"
] as const

const ENGLISH_KEYWORDS = [
  "resignation letter uzbekistan",
  "resignation letter template uzbek",
  "two weeks notice uzbekistan"
] as const

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...UZBEK_CYRILLIC_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
