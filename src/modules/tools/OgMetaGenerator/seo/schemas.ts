/**
 * Structured data for the OG meta generator.
 *
 * Every claim must be true, and FAQ content lives in one place — the same
 * `messages/tools/og-meta-generator/*` keys that `OgFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Open Graph Meta Generator",
  alternateName: [
    "OG Tag Generator",
    "Twitter Card Generator",
    "Meta Tag Yaratuvchi"
  ],
  description:
    "Open Graph va Twitter meta taglarini yaratadigan bepul vosita: sahifa Telegram, X, Facebook va LinkedIn'da qanday ko'rinishini oldindan ko'rsatadi, rasm o'lchamini brauzerda tekshiradi va natijani HTML yoki Next.js metadata shaklida beradi.",
  url: `${BASE_URL}/tools/og-meta-generator`,
  applicationCategory: ["DeveloperApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Open Graph (og:) taglarini yaratish",
    "Twitter Card (twitter:) taglarini yaratish",
    "Telegram, X, Facebook va LinkedIn uchun jonli ko'rinish",
    "Har bir platformaning o'z qirqish chegarasi bilan ko'rsatish",
    "Rasmning haqiqiy o'lchami va nisbatini brauzerda o'lchash",
    "Nisbiy manzil va yetib bo'lmaydigan rasmni aniqlash",
    "Natijani HTML yoki Next.js metadata shaklida olish",
    "Mavjud <head> taglarini qo'yib, formaga o'girish",
    "Facebook, LinkedIn va Telegram keshini yangilash havolalari"
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
        name: "Open Graph Meta Generator",
        item: `${baseUrl}/tools/og-meta-generator`
      }
    ]
  }
}
