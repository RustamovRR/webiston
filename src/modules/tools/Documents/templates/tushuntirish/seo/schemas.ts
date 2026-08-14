import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { TUSHUNTIRISH_FAQ_KEYS } from "../constants"

/**
 * Structured data for the explanatory note. Same two rules as every tool here:
 * every claim in `featureList` is something the code actually does, and the
 * FAQ schema reads the same message keys the visible FAQ renders.
 */

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Tushuntirish xati",
  alternateName: [
    "Tushuntirish xati namunasi",
    "Izohnoma",
    "Объяснительная записка (образец)"
  ],
  description:
    "Ish joyiga beriladigan tushuntirish xatini onlayn to'ldirish uchun bepul vosita: hujjat Mehnat kodeksining 313-moddasi talab qiladigan yozma tushuntirish shaklida tuziladi, yakuniy jumlani foydalanuvchi tanlaydi. Barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/tushuntirish-xati`,
  applicationCategory: ["BusinessApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Tushuntirish xatini rasmiy shakl bo'yicha to'ldirish",
    "Yakuniy jumlani tanlash: tan olish, uzrli sabab yoki rad etish",
    "Izohni bir nechta abzas qilib yozish",
    "Hujjat lotin va kirill yozuvida",
    "Chop etishga tayyor A4 varaq va Word (.docx) fayl",
    "Bo'sh shaklni chop etib, qo'lda to'ldirish",
    "Matnni bir bosishda nusxalash"
  ],
  inLanguage: ["uz", "en", "ru"]
}

export function generateFAQSchema(t: Translator) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TUSHUNTIRISH_FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.answer`)
      }
    }))
  }
}

export function generateBreadcrumbSchema(locale: string) {
  return toolBreadcrumbSchema(locale, "tushuntirish-xati", "Tushuntirish xati")
}
