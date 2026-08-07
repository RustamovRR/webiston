/**
 * Search terms for the QR generator.
 *
 * Lifted verbatim out of the route file — the same 94 entries, in the same
 * order, regrouped only so the metadata object stays readable. Nothing was
 * dropped: a keyword list is the owner's record of search demand, and trimming
 * one is a deletion.
 *
 * Worth knowing when that trim is considered: the head term "qr code
 * generator" belongs to Adobe, Canva and Bitly. What can actually carry this
 * page is the Uzbek intent and the Russian "бесплатно / без регистрации" one —
 * not the eight long-tail sentences at the bottom.
 */

// O'zbek tilida eng ko'p qidirilgan
export const UZBEK_KEYWORDS = [
  "qr kod yaratish",
  "qr kod generator",
  "qr kod generatori",
  "qr kod yasash",
  "qr kod qilish",
  "qr kod online",
  "bepul qr kod",
  "qr kod bepul",
  "qr kod vositasi",
  "qr kod tool",
  "qr kod yaratuvchi",
  "qr kod maker",
  "qr kod creator",
  "onlayn qr kod",
  "qr kod scanner",
  "qr kod reader",
  "qr kod dekoder",
  "qr kod encoder",
  "tez qr kod",
  "oson qr kod",
  "professional qr kod",
  "o'zbek qr kod",
  "uzbek qr kod"
] as const

// Ingliz tilida
export const ENGLISH_KEYWORDS = [
  "qr code generator",
  "qr code generator online",
  "free qr code generator",
  "qr code maker",
  "qr code creator",
  "online qr generator",
  "qr generator free",
  "create qr code",
  "generate qr code",
  "qr code builder",
  "qr code tool",
  "custom qr code",
  "bulk qr code generator",
  "batch qr code",
  "professional qr code",
  "business qr code",
  "marketing qr code",
  "dynamic qr code",
  "static qr code",
  "high quality qr code",
  "vector qr code",
  "svg qr code",
  "png qr code",
  "jpg qr code"
] as const

// Rus tilida
export const RUSSIAN_KEYWORDS = [
  "qr код генератор",
  "генератор qr кода",
  "создать qr код",
  "qr код онлайн",
  "бесплатный qr код",
  "qr код бесплатно",
  "генератор qr кодов",
  "создание qr кода",
  "qr код maker",
  "qr код creator",
  "qr код инструмент",
  "qr код сервис",
  "быстрый qr код",
  "простой qr код",
  "профессиональный qr код",
  "qr код для бизнеса",
  "qr код для сайта",
  "qr код для wifi",
  "qr код для контактов",
  "qr код для sms",
  "qr код высокого качества"
] as const

// Specific use cases
export const USE_CASE_KEYWORDS = [
  "url qr kod",
  "website qr kod",
  "link qr kod",
  "matn qr kod",
  "text qr kod",
  "wifi qr kod",
  "wifi password qr kod",
  "kontakt qr kod",
  "contact qr kod",
  "vcard qr kod",
  "sms qr kod",
  "email qr kod",
  "telefon qr kod",
  "phone qr kod",
  "location qr kod",
  "map qr kod",
  "event qr kod",
  "calendar qr kod"
] as const

// Long-tail keywords
export const LONG_TAIL_KEYWORDS = [
  "qr kod yaratish va ulardan foydalanish",
  "professional qr kod generator free online",
  "создать qr код бесплатно онлайн высокого качества",
  "webiston qr tools",
  "o'zbek qr generator professional",
  "uzbek qr code generator online free",
  "bulk qr code generator for business",
  "custom qr code with logo generator"
] as const

/**
 * What ships in `<meta name="keywords">`.
 *
 * Unchanged from what the route published: the same 94 terms in the same
 * order. Every other ported tool ships a ~12-term `PRIMARY_KEYWORDS` instead,
 * and this list should probably follow — but that is a deletion, so it waits
 * for the owner.
 */
// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const ALL_KEYWORDS: string[] = [
  ...UZBEK_KEYWORDS,
  ...ENGLISH_KEYWORDS,
  ...RUSSIAN_KEYWORDS,
  ...USE_CASE_KEYWORDS,
  ...LONG_TAIL_KEYWORDS
]
