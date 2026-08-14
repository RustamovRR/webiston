/**
 * Search terms for the resume builder.
 *
 * Aimed at the audience the positioning names (initiatives/resume-builder.md):
 * the mass Uzbek jobseeker, not IT. So "rezyume namunasi" and «резюме
 * образец» carry the weight, and English CV terms are a thin tail — FlowCV
 * and LinkedIn own that query space and we are not fighting for it.
 *
 * The Cyrillic-Uzbek block is load-bearing here: GSC shows «лотин кирилл»
 * traffic arriving at the converter, i.e. this audience types Cyrillic, and
 * nobody serves them a resume builder in it.
 */

const UZBEK_KEYWORDS = [
  "rezyume yaratish",
  "rezyume yozish",
  "rezyume namunasi",
  "rezyume tuzish",
  "rezyume qanday yoziladi",
  "ish uchun rezyume",
  "rezyume shakli",
  "cv yaratish o'zbek tilida",
  "bepul rezyume"
] as const

const UZBEK_CYRILLIC_KEYWORDS = [
  "резюме яратиш",
  "резюме намунаси",
  "резюме ёзиш",
  "иш учун резюме"
] as const

const RUSSIAN_KEYWORDS = [
  "резюме образец узбекистан",
  "составить резюме онлайн бесплатно",
  "как написать резюме",
  "резюме для работы образец",
  "создать резюме онлайн"
] as const

const ENGLISH_KEYWORDS = [
  "uzbek cv builder",
  "resume builder uzbekistan",
  "free cv maker uzbek"
] as const

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...UZBEK_CYRILLIC_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...ENGLISH_KEYWORDS
]
