/**
 * Search terms for the ta'til arizasi.
 *
 * The same gap as the resignation ariza: "ta'til arizasi namunasi" returns
 * static templates (advice.uz), a Scribd PDF and portal .docs. None of them
 * knows that a holiday inside the leave is not counted (MK 221), so none of
 * them can say what day it ends.
 *
 * "o'z hisobidan" is how people SAY unpaid leave; "ish haqi saqlanmaydigan"
 * is how the code says it. Both are here because the searcher uses the first
 * and the document uses the second.
 */

const UZBEK_KEYWORDS = [
  "ta'til arizasi",
  "ta'til arizasi namunasi",
  "mehnat ta'tili arizasi",
  "yillik mehnat ta'tili arizasi",
  "navbatdagi mehnat ta'tili arizasi",
  "ta'tilga chiqish arizasi",
  "o'z hisobidan ta'til arizasi",
  "ish haqi saqlanmaydigan ta'til arizasi",
  "ta'til arizasi qanday yoziladi",
  "otpuska uchun ariza"
] as const

const UZBEK_CYRILLIC_KEYWORDS = [
  "таътил аризаси",
  "таътил аризаси намунаси",
  "меҳнат таътили аризаси",
  "ўз ҳисобидан таътил аризаси"
] as const

const RUSSIAN_KEYWORDS = [
  "заявление на отпуск узбекистан",
  "заявление на отпуск образец",
  "заявление на ежегодный отпуск",
  "заявление на отпуск без сохранения заработной платы",
  "заявление на отпуск за свой счет"
] as const

const ENGLISH_KEYWORDS = [
  "leave application uzbekistan",
  "annual leave request uzbek",
  "vacation request letter uzbekistan"
] as const

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...UZBEK_CYRILLIC_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
