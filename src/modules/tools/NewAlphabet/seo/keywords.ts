/**
 * Search terms for the 2027-alphabet converter.
 *
 * NOT measured. The queries did not exist before 21.10.2026, and Search
 * Console and Metrica showed this site no new-alphabet phrase at all on
 * 2026-10-22 — no impressions, because no page ranked for one. These are the
 * phrasings the news coverage and the existing converters use. Once the page
 * is indexed, `pnpm gsc` shows what people actually type; replace guesses
 * with that.
 *
 * "eski alifbo" is how people name the 1995 alphabet, though it stays the
 * official one until 22.04.2027 — the searcher's word, not the law's.
 */

const UZBEK_KEYWORDS = [
  "yangi alifbo",
  "yangi o'zbek alifbosi",
  "yangi lotin alifbosi",
  "yangi alifboga o'girish",
  "yangi alifbo 2027",
  "yangi alifbo konvertor",
  "eski alifbodan yangi alifboga",
  "28 harfli alifbo",
  "o'zbek alifbosi o'zgarishi",
  "ş harfi",
  "ğ harfi"
] as const

const UZBEK_CYRILLIC_KEYWORDS = [
  "янги алифбо",
  "янги ўзбек алифбоси",
  "янги лотин алифбоси",
  "янги алифбога ўгириш"
] as const

const RUSSIAN_KEYWORDS = [
  "новый узбекский алфавит",
  "новый узбекский алфавит 2027",
  "реформа узбекского алфавита",
  "конвертер нового узбекского алфавита"
] as const

const ENGLISH_KEYWORDS = [
  "new uzbek alphabet",
  "uzbek alphabet 2027",
  "uzbek latin alphabet reform",
  "new uzbek alphabet converter"
] as const

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...UZBEK_CYRILLIC_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
