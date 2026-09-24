import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { TATIL_FAQ_KEYS } from "../constants"

/**
 * Structured data for the ta'til arizasi. Same two rules as every tool here:
 * every claim in `featureList` is something the code actually does, and the
 * FAQ schema reads the same message keys the visible FAQ renders.
 */

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Ta'til arizasi",
  alternateName: [
    "Ta'til arizasi namunasi",
    "Mehnat ta'tili arizasi",
    "Заявление на отпуск (образец)"
  ],
  description:
    "Mehnat ta'tili yoki ish haqi saqlanmaydigan ta'til arizasini onlayn to'ldirish uchun bepul vosita: ta'tilning tugash sanasi Mehnat kodeksining 221-moddasi bo'yicha, bayram kunlarini hisobga olib, o'zi hisoblanadi. Barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/tatil-arizasi`,
  applicationCategory: ["BusinessApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Yillik mehnat ta'tili va ish haqi saqlanmaydigan ta'til arizasi",
    "Ta'tilning tugash sanasini avtomatik hisoblash",
    "Ta'tilga to'g'ri kelgan bayram kunlarini hisobdan chiqarish (MK 221-modda)",
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
    mainEntity: TATIL_FAQ_KEYS.map((key) => ({
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
  return toolBreadcrumbSchema(locale, "tatil-arizasi", "Ta'til arizasi")
}
