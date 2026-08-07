/**
 * Structured data for the microphone test.
 *
 * Every claim has to be true. The schema this replaces advertised a tool whose
 * "audio quality analysis" was a four-step grade of a number that measured
 * nothing — a page can be penalised for a rich result it does not deliver, and
 * a reader who arrives expecting one is worse served than one who never came.
 */

import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"
import { FAQ_KEYS } from "../constants/faq"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Microphone Test",
  alternateName: ["Mikrofon Testi", "Mic Test", "Microphone Check"],
  description:
    "Mikrofonni brauzerda sinash: dBFS darajasi, to'lqin va spektr, jonli tinglash, yozib olish hamda brauzerning audio filtrlarini o'chirish. Ovoz qurilmadan chiqmaydi.",
  url: `${BASE_URL}/tools/microphone-test`,
  applicationCategory: ["DeveloperApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript and a secure (HTTPS) connection",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only what the code does. Nothing here is a rating, a score or a grade.
  featureList: [
    "Ovoz darajasi dBFS'da, cho'qqi ushlagichi bilan",
    "Klipping ogohlantirishi",
    "To'lqin va chastota spektri",
    "O'z ovozingizni jonli eshitish",
    "Yozib olish va darhol tinglash",
    "Karnay va quloqchin testi — chap va o'ng kanal alohida",
    "Diagnostika hisobotini bir bosishda nusxalash",
    "Aks-sado, shovqin bostirish va avtomatik kuchaytirishni o'chirish",
    "Bir nechta mikrofon orasida almashish",
    "Hamma narsa qurilmada — hech narsa serverga yuborilmaydi"
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
      acceptedAnswer: { "@type": "Answer", text: t(`items.${key}.answer`) }
    }))
  }
}

/**
 * The tool's own name, per locale — the only part of the trail that is not
 * shared.
 */
const BREADCRUMB_NAME = {
  uz: "Mikrofon Testi",
  en: "Microphone Test",
  ru: "Проверка микрофона"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz

  return toolBreadcrumbSchema(locale, "microphone-test", name)
}
