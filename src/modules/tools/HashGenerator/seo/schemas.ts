/**
 * Structured data for the hash generator.
 *
 * Two rules, both of which the inline blob this replaces broke.
 *
 * Every claim must be true. That blob listed `"Hash taqqoslash"` (hash
 * comparison) and `"Checksum hisoblash"` among the tool's features when it
 * could do neither, and `"Parol hash yaratish"` (password hash generation) as
 * though that were something to advertise rather than to warn against.
 *
 * And FAQ content lives in one place — the same `messages/tools/hash-generator/*`
 * keys that `HashFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Hash Generator",
  alternateName: ["Checksum Calculator", "HMAC Generator", "Hash Yaratuvchi"],
  description:
    "Matn va fayllardan SHA-256, SHA-512, SHA-384, SHA-1 va MD5 hash hisoblaydigan bepul vosita. E'lon qilingan checksum bilan solishtirish va HMAC imzosi ham bor; barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/hash-generator`,
  applicationCategory: ["UtilityApplication", "DeveloperApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "SHA-256, SHA-512, SHA-384, SHA-1 va MD5 hash hisoblash",
    "Fayl baytlaridan hash olish (sha256sum bilan bir xil natija)",
    "E'lon qilingan checksum bilan solishtirish va algoritmni aniqlash",
    "HMAC-SHA imzosini maxfiy kalit bilan hisoblash",
    "Natijani hex yoki Base64 shaklida ko'rsatish",
    "Natijalarni .txt sifatida saqlash"
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
        name: "Hash Generator",
        item: `${baseUrl}/tools/hash-generator`
      }
    ]
  }
}
