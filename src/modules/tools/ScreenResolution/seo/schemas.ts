/**
 * Structured data for the screen resolution tool.
 *
 * Every claim must be true, and FAQ content lives in one place — the same
 * `messages/tools/screen-resolution/*` keys that `ScreenFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Screen Resolution",
  alternateName: [
    "Ekran O'lchami",
    "Viewport Size Checker",
    "Breakpoint Checker"
  ],
  description:
    "Viewport, oyna va ekran o'lchamlarini, faol CSS breakpointni, piksel zichligini va tomonlar nisbatini real vaqtda ko'rsatadigan bepul vosita.",
  url: `${BASE_URL}/tools/screen-resolution`,
  applicationCategory: ["DeveloperApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Viewport o'lchami — oyna cho'zilganda jonli yangilanadi",
    "Faol Tailwind breakpoint va barcha breakpointlar ko'rsatkichi",
    "Ekran, oyna va mavjud maydon o'lchamlari (CSS va qurilma piksellarida)",
    "Piksel zichligi, rang chuqurligi va orientatsiya",
    "Tomonlar nisbati — standart nomi bilan",
    "Mashhur qurilmalar viewport jadvali va joriy moslik",
    "Joriy o'lcham uchun tayyor CSS media so'rovi",
    "Fullscreen rejimini yoqish va JSON sifatida saqlash"
  ],
  inLanguage: ["uz", "en"]
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

export function generateBreadcrumbSchema(locale: string) {
  const isEnglish = locale === "en"
  const baseUrl = isEnglish ? `${BASE_URL}/en` : BASE_URL

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEnglish ? "Home" : "Bosh sahifa",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isEnglish ? "Tools" : "Vositalar",
        item: `${baseUrl}/tools`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: isEnglish ? "Screen Resolution" : "Ekran O'lchami",
        item: `${baseUrl}/tools/screen-resolution`
      }
    ]
  }
}
