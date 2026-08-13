import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { ARIZA_FAQ_KEYS } from "../constants"

/**
 * Structured data for the resignation ariza. Same two rules as every tool
 * here: every claim in `featureList` is something the code actually does, and
 * the FAQ schema reads the same message keys the visible FAQ renders.
 */

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Ishdan bo'shash arizasi",
  alternateName: [
    "Ariza namunasi",
    "Ishdan bo'shash arizasi namunasi",
    "Заявление на увольнение (образец)"
  ],
  description:
    "O'z xohishiga ko'ra ishdan bo'shash arizasini onlayn to'ldirish uchun bepul vosita: oxirgi ish kuni Mehnat kodeksining 160-moddasidagi ogohlantirish muddati bo'yicha o'zi hisoblanadi. Barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/ishdan-boshash-arizasi`,
  applicationCategory: ["BusinessApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Arizani rasmiy shakl bo'yicha to'ldirish",
    "Oxirgi ish kunini ogohlantirish muddati bo'yicha avtomatik hisoblash",
    "Xodim toifasiga qarab muddat (14 kun, 1 oy, 2 oy, 3 kun, 7 kun)",
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
    mainEntity: ARIZA_FAQ_KEYS.map((key) => ({
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
  return toolBreadcrumbSchema(
    locale,
    "ishdan-boshash-arizasi",
    "Ishdan bo'shash arizasi"
  )
}
