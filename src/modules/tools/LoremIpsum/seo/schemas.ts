/**
 * Structured data for the lorem ipsum generator.
 *
 * Every claim must be true, and FAQ content lives in one place — the same
 * `messages/tools/lorem-ipsum/*` keys that `LoremFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Lorem Ipsum Generator",
  alternateName: [
    "Filler Text Generator",
    "Namunaviy Matn Generatori",
    "O'zbekcha Lorem Ipsum"
  ],
  description:
    "Maket va dizayn uchun namunaviy matn yaratadigan bepul vosita: abzas, gap, so'z yoki aniq bayt hajmida, klassik lotincha yoki o'zbekcha ro'yxatdan, matn yoki HTML shaklida.",
  url: `${BASE_URL}/tools/lorem-ipsum`,
  applicationCategory: ["DeveloperApplication", "DesignApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Abzas, gap va so'z bo'yicha matn yaratish",
    "Aniq bayt hajmida matn yaratish",
    "Klassik lotincha (Cicero) ro'yxati",
    "O'zbekcha so'zlar ro'yxati (lotin va kirill)",
    "Bacon, Hipster va Cupcake ro'yxatlari",
    "Natijani oddiy matn yoki HTML shaklida olish",
    "Nusxalash va fayl sifatida saqlash"
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

/** The tool's own name, per locale — the only part of the trail that is not shared. */
const BREADCRUMB_NAME = {
  uz: "Lorem Ipsum Generator",
  en: "Lorem Ipsum Generator",
  ru: "Генератор Lorem Ipsum"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz
  return toolBreadcrumbSchema(locale, "lorem-ipsum", name)
}
