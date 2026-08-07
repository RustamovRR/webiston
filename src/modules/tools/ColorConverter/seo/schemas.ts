/**
 * Structured data for the colour converter.
 *
 * Two rules this file follows, both of which the inline blob it replaces broke:
 *
 * 1. EVERY CLAIM MUST BE TRUE. The old `featureList` advertised "HSL to CMYK
 *    konvertatsiya" and "Triadic palette" — neither exists in the code — plus a
 *    `softwareVersion: "2.0"` that means nothing and a `dateModified` frozen at
 *    2025-01-01.
 * 2. FAQ CONTENT LIVES IN ONE PLACE. The four Q&As were hardcoded in the route
 *    and rendered NOWHERE. They now come from the same
 *    `messages/tools/color-converter/*.json` keys that `ColorFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Rang O'giruvchi va Palette Generator",
  alternateName: [
    "Color Converter",
    "Palette Generator",
    "Rang Konverter",
    "WCAG Contrast Checker"
  ],
  description:
    "HEX, RGB, HSL, Lab, LCH, OKLab va OKLCH formatlar orasida rang o'giruvchi bepul vosita. WCAG kontrastini tekshiradi va palette hosil qiladi; barcha hisob-kitob brauzerda bajariladi.",
  url: `${BASE_URL}/tools/color-converter`,
  applicationCategory: ["UtilityApplication", "DesignApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UZS"
  },
  author: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL
  },
  publisher: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL
  },
  // Only capabilities the code actually has.
  featureList: [
    "HEX, RGB, HSL, Lab, LCH, OKLab, OKLCH konvertatsiya",
    "Zamonaviy CSS Color 4 sintaksisini o'qish",
    "WCAG 2.1 kontrast tekshiruvi (AA, AAA)",
    "Monoxromatik, analogik va komplementar palette",
    "50–950 rang shkalasi",
    "CSS, Tailwind v4 @theme va SCSS eksporti",
    "Gradient generator (linear, radial, conic)",
    "Rang tarixi va sevimlilar",
    "Ekrandan rang olish (qo'llab-quvvatlaydigan brauzerlarda)"
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

/** The tool's own name, per locale — the only part of the trail that is not shared. */
const BREADCRUMB_NAME = {
  uz: "Rang O'giruvchi va Palette Generator",
  en: "Color Converter",
  ru: "Конвертер цветов"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz
  return toolBreadcrumbSchema(locale, "color-converter", name)
}
