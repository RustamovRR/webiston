/**
 * Structured data for the UUID generator.
 *
 * Two rules, both of which the inline blob this replaces broke.
 *
 * Every claim must be true. That blob's `featureList` sold "UUID validation",
 * "Statistika va analytics", "Alohida UUID nusxa olish" (copy a single UUID)
 * and "Professional interfeys" — the page had no validator, no per-value copy
 * and no statistics, and the last one is not a feature.
 *
 * And FAQ content lives in one place — the same
 * `messages/tools/uuid-generator/*` keys that `UuidFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "UUID Generator",
  alternateName: ["GUID Generator", "UUID Inspector", "UUID Yaratuvchi"],
  description:
    "UUID v4, v7 va v1 qiymatlarini yaratadigan va istalgan UUID'ning versiyasi, varianti hamda yaratilgan vaqtini o'qiydigan bepul vosita. Barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/uuid-generator`,
  applicationCategory: ["UtilityApplication", "DeveloperApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "UUID v4 yaratish (122 bit tasodifiy, Web Crypto CSPRNG)",
    "UUID v7 yaratish (vaqt bo'yicha tartiblanadigan, RFC 9562)",
    "UUID v1 yaratish (vaqt belgisi va tasodifiy node bilan)",
    "Nil UUID",
    "Bir marta 1 tadan 1000 tagacha qiymat",
    "Standart, tiresiz va {qavsli} format, katta harf tanlovi",
    "Istalgan UUID versiyasi, varianti va yaratilgan vaqtini aniqlash",
    "Natijalarni .txt yoki .json sifatida saqlash"
  ],
  inLanguage: ["uz", "en"]
}

export function generateFAQSchema(t: Translator) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`items.${key}.question`),
      acceptedAnswer: { "@type": "Answer", text: t(`items.${key}.answer`) }
    }))
  }
}

export function generateBreadcrumbSchema(locale: string) {
  const isEnglish = locale === "en"
  const baseUrl = isEnglish ? `${BASE_URL}/en` : BASE_URL

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEnglish ? "Home" : "Bosh sahifa",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isEnglish ? "Tools" : "Vositalar",
        item: `${baseUrl}/tools`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "UUID Generator",
        item: `${baseUrl}/tools/uuid-generator`
      }
    ]
  }
}
