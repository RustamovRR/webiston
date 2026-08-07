/**
 * Structured data for the IP info tool.
 *
 * Every claim must be true. `featureList` used to promise "proxy va VPN
 * aniqlash" on a page whose proxy flag was a hardcoded `false`, which is a
 * schema lying to a search engine as well as to a reader.
 */

import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "IP Info",
  alternateName: ["IP Manzil", "IP Lookup", "IP Geolocation"],
  description:
    "IP manzilning joylashuvi, provayderi, ASN raqami va vaqt mintaqasini ko'rsatadigan bepul vosita. IPv4 va IPv6 qo'llab-quvvatlanadi.",
  url: `${BASE_URL}/tools/ip-info`,
  applicationCategory: ["DeveloperApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has. Proxy/VPN/Tor detection is NOT
  // one of them and is not listed.
  featureList: [
    "O'z IP manzilingizni ko'rsatish",
    "Istalgan IPv4 yoki IPv6 manzilni tekshirish",
    "Davlat, viloyat, shahar va pochta indeksi",
    "Koordinatalar va xaritada taxminiy joylashuv",
    "Provayder, tashkilot va ASN raqami",
    "Vaqt mintaqasi va shu yerdagi joriy vaqt",
    "Natijani JSON sifatida nusxalash va saqlash"
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
  uz: "IP Manzil",
  en: "IP Info",
  ru: "IP-адрес"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz
  return toolBreadcrumbSchema(locale, "ip-info", name)
}
