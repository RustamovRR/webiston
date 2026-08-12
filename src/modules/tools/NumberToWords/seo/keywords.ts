/**
 * Search terms for the sum-in-words tool.
 *
 * Grouped by language and flattened once at the bottom — `Metadata["keywords"]`
 * wants a mutable `string[]`, which is why the export is not `readonly`.
 *
 * The Uzbek block is the whole point. Two searches for these phrases return a
 * blog post about the algorithm, a code tutorial and a 2010s Excel macro on a
 * forum — there is no modern tool ranking for them. The Russian block matters
 * for the same reason in the other direction: documents in Uzbekistan are
 * routinely bilingual, and "сумма прописью" is how half the country asks.
 */

const UZBEK_KEYWORDS = [
  "summani so'z bilan yozish",
  "raqamni so'z bilan yozish",
  "sonni so'z bilan yozish",
  "raqamlarni so'zga aylantirish",
  "summa so'z bilan",
  "so'm so'z bilan yozish",
  "hisob-faktura summa so'z bilan",
  "shartnoma summasi so'z bilan",
  // "harf bilan" is how at least as many people phrase it as "so'z bilan" —
  // the Excel macro this tool replaces was itself named "summani harf
  // yordamida yozish" on the forums that still rank for these queries.
  "raqamni harf bilan yozish",
  "summani harflarda yozish",
  "pul summasini so'z bilan yozish",
  "to'lov summasi so'z bilan"
] as const

/**
 * Uzbek in CYRILLIC script — its own block, and nobody else's territory.
 *
 * The accountants this tool serves are the demographic most likely to type
 * their query in Cyrillic Uzbek, and no competing page targets that spelling
 * at all: the same searches that are thin in Latin Uzbek are EMPTY in
 * Cyrillic. These also feed the site's own ⌘K search index, which folds
 * keywords into per-tool tags.
 */
const UZBEK_CYRILLIC_KEYWORDS = [
  "суммани сўз билан ёзиш",
  "рақамни сўз билан ёзиш",
  "сонни сўз билан ёзиш",
  "суммани ҳарф билан ёзиш"
] as const

const RUSSIAN_KEYWORDS = [
  "сумма прописью",
  "число прописью",
  "сумма прописью узбекский",
  "сумма прописью на узбекском",
  "сумма прописью на узбекском языке онлайн",
  "сумма прописью в сумах",
  "цифры прописью сум",
  "число прописью на узбекском",
  "перевести число в слова"
] as const

const ENGLISH_KEYWORDS = [
  "number to words uzbek",
  "amount in words uzbek",
  "uzbek number spelling",
  "sum in words som",
  "spell out number uzbek"
] as const

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...UZBEK_CYRILLIC_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
