import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

type Translator = Awaited<ReturnType<typeof getTranslations>>

/**
 * Structured data for the resume builder. Same rule as every tool here:
 * every claim in `featureList` is something the code actually does today —
 * no docx or template switcher listed until they ship.
 */

const BASE_URL = "https://webiston.uz"

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Rezyume yaratish",
  alternateName: [
    "Rezyume namunasi",
    "CV yaratish",
    "Создать резюме онлайн (Узбекистан)"
  ],
  description:
    "Ish qidiruvchilar uchun bepul rezyume yaratish vositasi: ma'lumotlarni to'ldiring, tayyor rezyumeni chop eting. O'zbekistondagi talablar hisobga olingan, barcha ma'lumot faqat brauzerda saqlanadi.",
  url: `${BASE_URL}/tools/rezyume`,
  applicationCategory: ["BusinessApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  featureList: [
    'Ikki shablon: an\'anaviy „Klassik" va ikki ustunli „Zamonaviy"',
    "Rezyumeni bo'limlar bo'yicha to'ldirish",
    "Ish tajribasi va ta'lim tartibini o'zgartirish",
    "Butun hujjatni lotin va kirill yozuvi o'rtasida almashtirish",
    "Hujjat tili: o'zbek, rus yoki ingliz — sayt tilidan mustaqil",
    "O'zbekistondagi odat: tug'ilgan sana va surat (ixtiyoriy)",
    "Tayyor namunani ko'rish",
    "Chop etishga tayyor A4 varaq va PDF",
    "Word (.docx) faylini yuklab olish",
    "Ma'lumot faqat qurilmangizda saqlanadi"
  ],
  inLanguage: ["uz", "en", "ru"]
}

export function generateBreadcrumbSchema(locale: string) {
  return toolBreadcrumbSchema(locale, "rezyume", "Rezyume yaratish")
}

/**
 * `FAQPage` from the SAME message keys `ResumeFaq` renders.
 *
 * Structured data that answers a question the page does not visibly answer is
 * a Google policy violation, not a shortcut — so the schema takes the
 * translator rather than a copy of the text.
 */
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
