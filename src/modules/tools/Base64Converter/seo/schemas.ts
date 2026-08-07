/**
 * Structured data for the Base64 converter.
 *
 * Two rules, both of which the inline blob this replaces broke:
 *
 * 1. EVERY CLAIM MUST BE TRUE. The old `featureList` advertised "Katta fayllar
 *    bilan ishlash" beside a hard 10 MB ceiling, "Professional interfeys" and
 *    "Real-time conversion" — marketing, not capabilities — plus a
 *    `softwareVersion: "2.0"` that means nothing, a `dateModified` frozen at
 *    2025-01-01, and a `sameAs` listing the page's own URL.
 * 2. FAQ CONTENT LIVES IN ONE PLACE. The four Q&As were hardcoded in the route
 *    file; they now come from the same
 *    `messages/tools/base64-converter/*.json` keys that `Base64Faq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Base64 Konverter",
  alternateName: ["Base64 Converter", "Base64 Encoder", "Base64 Decoder"],
  description:
    "Matn va fayllarni Base64 va base64url formatlariga o'giradigan bepul vosita. Barcha hisob-kitob brauzerda bajariladi.",
  url: `${BASE_URL}/tools/base64-converter`,
  applicationCategory: ["UtilityApplication", "DeveloperApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UZS"
  },
  author: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL
  },
  publisher: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL
  },
  // Only capabilities the code actually has.
  featureList: [
    "UTF-8 matnni Base64 ga kodlash",
    "Base64 va base64url dekodlash",
    "URL uchun xavfsiz alifbo (base64url) bilan kodlash",
    "Matn fayllarini yuklash (10 MB gacha)",
    "Rasm fayllarini bir marta kodlash (data URI uchun)",
    "Manba va natija hajmini bayt hisobida ko'rsatish",
    "Natijani .txt sifatida yuklab olish"
  ],
  inLanguage: ["uz", "en", "ru"]
}

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

/** The tool's own name, per locale — the only part of the trail that is not shared. */
const BREADCRUMB_NAME = {
  uz: "Base64 Konverter",
  en: "Base64 Converter",
  ru: "Конвертер Base64"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz

  return toolBreadcrumbSchema(locale, "base64-converter", name)
}
