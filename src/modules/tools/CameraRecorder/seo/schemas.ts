/**
 * Structured data for the camera tool.
 *
 * Every claim has to be true. The schema this replaces described "professional
 * camera recording" on a page that could not report the resolution it was
 * actually recording at.
 */

import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants/faq"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Camera Test",
  alternateName: ["Kamera Testi", "Webcam Test", "Camera Recorder"],
  description:
    "Veb-kamerani brauzerda sinash: jonli tasvir, haqiqiy o'lcham va kadr chastotasi, kadr olish va video yozish. Tasvir qurilmadan chiqmaydi.",
  url: `${BASE_URL}/tools/camera-recorder`,
  applicationCategory: ["DeveloperApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript and a secure (HTTPS) connection",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only what the code does.
  featureList: [
    "Jonli kamera tasviri",
    "So'ralgan va haqiqiy o'lcham yonma-yon",
    "Kadr chastotasi (fps) ko'rsatkichi",
    "To'liq o'lchamdagi kadrni PNG sifatida saqlash",
    "Ovoz bilan yoki ovozsiz video yozish",
    "Ko'zgu rejimi — ekranda nima ko'rinsa, faylda ham shu",
    "Bir nechta kamera orasida almashish",
    "Diagnostika hisobotini bir bosishda nusxalash",
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

/** The tool's own name, per locale — the only part of the trail that is not shared. */
const BREADCRUMB_NAME = {
  uz: "Kamera Testi",
  en: "Camera Test",
  ru: "Проверка камеры"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz

  return toolBreadcrumbSchema(locale, "camera-recorder", name)
}
