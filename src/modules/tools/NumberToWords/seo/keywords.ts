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
  "shartnoma summasi so'z bilan"
] as const

const RUSSIAN_KEYWORDS = [
  "сумма прописью",
  "число прописью",
  "сумма прописью узбекский",
  "сумма прописью на узбекском",
  "цифры прописью сум",
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
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
