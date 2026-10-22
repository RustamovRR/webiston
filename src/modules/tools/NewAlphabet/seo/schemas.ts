import type { getTranslations } from "next-intl/server"

import { NEW_ALPHABET_PATH } from "@/constants/ui"
import { localeUrl, toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

/**
 * Structured data for the new-alphabet converter. The suite's two rules:
 * every `featureList` entry is something the code does — the alphabet rules
 * are tested in `packages/transliteration/__tests__/latin-2027.test.ts`, the
 * converter's files and wiring in `LatinCyrillic/LatinCyrillic.test.tsx`,
 * because it is that converter — and the FAQ schema reads the same message
 * keys the visible FAQ renders.
 *
 * "Rasmiy" appears nowhere. This is not a government converter, and the
 * spelling rules that will settle cases like Isʼhoq are not published yet.
 */

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

/**
 * Per locale, because `url` must be the page's own canonical: a fixed Uzbek
 * URL on /en and /ru described a different page from the one it sat on.
 * `UtilitiesApplication` is Google's spelling (schema.org leaves the value
 * free text); "UtilityApplication", which the other tools still publish, is
 * not on Google's list. Neither earns a rich result today: Google requires
 * `aggregateRating` or `review` for one, and no tool has either.
 */
export const generateApplicationSchema = (locale: string) => ({
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Yangi alifboga o'girish",
  alternateName: [
    "Yangi o'zbek alifbosi konvertori",
    "New Uzbek Alphabet Converter",
    "Конвертер нового узбекского алфавита"
  ],
  description:
    "O'zbek matnini O'RQ-1184-son qonun bilan qabul qilingan yangi lotin alifbosiga (ş, ç, ğ, ö) o'girish uchun bepul vosita. Eski lotin va kirill matnni qabul qiladi; havolalar, kod va mahsulot nomlari o'zgarmaydi. Barcha ish brauzerda bajariladi.",
  url: localeUrl(locale, NEW_ALPHABET_PATH),
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Eski lotin alifbosidan yangi alifboga o'girish",
    "Kirill matnni yangi alifboga o'girish",
    "Yangi alifbodagi matnni eski lotin yoki kirillga qaytarish",
    "Lotin va kirill o'rtasida o'girish",
    "TXT, PDF va DOCX fayldan matn o'qish",
    "Natijani TXT yoki DOCX ko'rinishida saqlash",
    "Ş, Ç, Ğ, Ö harflarini bir bosishda nusxalash",
    "Rumincha ș kabi o'xshash belgilarni to'g'ri harfga almashtirish",
    "Havola, elektron pochta, kod va mahsulot nomlarini o'zgarishsiz qoldirish",
    "Matn brauzerdan chiqmaydi"
  ],
  inLanguage: ["uz", "en", "ru"]
})

export function generateFAQSchema(t: Translator) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.answer`)
      }
    }))
  }
}

/** The tool's own name, per locale — the only part of the trail not shared. */
const BREADCRUMB_NAME = {
  uz: "Yangi alifboga o'girish",
  en: "New Uzbek Alphabet Converter",
  ru: "Новый узбекский алфавит"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz
  return toolBreadcrumbSchema(locale, "yangi-alifbo", name)
}
