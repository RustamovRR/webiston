/**
 * Search terms for the code-snapshot tool.
 *
 * Grouped by language because the three listings compete for different
 * queries, and flattened once at the bottom — `Metadata["keywords"]` wants a
 * mutable `string[]`, which is why the export below is deliberately not
 * `readonly`.
 *
 * Nothing here names a competitor. Bidding on "carbon now sh" would rank for
 * people looking for a different product and bounce them straight back out.
 */

const UZBEK_KEYWORDS = [
  "koddan rasm yasash",
  "kod skrinshoti",
  "kodni rasmga aylantirish",
  "chiroyli kod rasmi",
  "kod rasm generator",
  "dasturlash kodi rasmi",
  "kod suratga olish"
] as const

const ENGLISH_KEYWORDS = [
  "code to image",
  "code screenshot",
  "code snippet image",
  "beautiful code images",
  "code image generator",
  "syntax highlighted screenshot",
  "share code snippet"
] as const

const RUSSIAN_KEYWORDS = [
  "код в картинку",
  "скриншот кода",
  "красивый скриншот кода",
  "картинка из кода",
  "генератор картинок кода",
  "поделиться кодом"
] as const

/** What people are trying to DO, which is usually a longer query. */
const USE_CASE_KEYWORDS = [
  "code screenshot for twitter",
  "code image for blog post",
  "code snippet for presentation",
  "readme code image",
  "kod rasmini telegram uchun"
] as const

const LONG_TAIL_KEYWORDS = [
  "free code screenshot no signup",
  "code to png online",
  "code image with line numbers",
  "dark theme code screenshot",
  "bepul kod skrinshot"
] as const

export const ALL_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...ENGLISH_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...USE_CASE_KEYWORDS,
  ...LONG_TAIL_KEYWORDS
]
