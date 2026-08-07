/**
 * Structured data for the device info tool.
 *
 * Every claim must be true, and FAQ content lives in one place — the same
 * `messages/tools/device-info/*` keys that `DeviceFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Device Info",
  alternateName: [
    "Qurilma Ma'lumotlari",
    "Browser Info Checker",
    "User Agent Checker"
  ],
  description:
    "Brauzer, operatsion tizim, ekran, qurilma, tarmoq va foydalanuvchi afzalliklari haqida sayt ruxsatsiz o'qiy oladigan ma'lumotlarni ko'rsatadigan bepul vosita.",
  url: `${BASE_URL}/tools/device-info`,
  applicationCategory: ["DeveloperApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Brauzer nomi va versiyasi (User-Agent Client Hints orqali)",
    "Rendering engine (Blink, WebKit, Gecko)",
    "Operatsion tizim va arxitektura",
    "Ekran va oyna o'lchami, piksel zichligi, orientatsiya",
    "Qurilma turi, sensorli nuqtalar, yadro soni",
    "Tarmoq holati va tezlik bahosi",
    "Foydalanuvchi afzalliklari: mavzu, harakat, kontrast",
    "Hammasini JSON sifatida nusxalash va saqlash"
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
  uz: "Qurilma Ma'lumotlari",
  en: "Device Info",
  ru: "Сведения об устройстве"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz

  return toolBreadcrumbSchema(locale, "device-info", name)
}
