import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

/**
 * Structured data for the tilxat tool. Same two rules as every tool here:
 * every claim in `featureList` is something the code actually does, and the
 * FAQ schema reads the same message keys the visible FAQ renders.
 */

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Tilxat yozish",
  alternateName: [
    "Tilxat namunasi",
    "Qarz tilxati",
    "Расписка о займе по-узбекски"
  ],
  description:
    "Qarz tilxatini onlayn to'ldirib, chop etish uchun bepul vosita: summa avtomatik so'z bilan yoziladi, hujjat lotin va kirill yozuvida tayyorlanadi. Barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/tilxat`,
  applicationCategory: ["BusinessApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Qarz tilxatini shakl bo'yicha to'ldirish",
    "Summani avtomatik so'z bilan yozish (raqam va so'z)",
    "Hujjat lotin va kirill yozuvida",
    "Chop etishga tayyor A4 varaq",
    "Bo'sh shaklni chop etib, qo'lda to'ldirish",
    "Guvohlar va foizsiz qarz bandi",
    "Matnni bir bosishda nusxalash"
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

export function generateBreadcrumbSchema(locale: string) {
  return toolBreadcrumbSchema(locale, "tilxat", "Tilxat yozish")
}
