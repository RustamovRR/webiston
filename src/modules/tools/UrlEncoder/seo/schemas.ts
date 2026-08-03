/**
 * Structured data for the URL encoder.
 *
 * Two rules, both of which the inline blob this replaces broke: every claim
 * must be true, and FAQ content lives in one place — the same
 * `messages/tools/url-encoder/*` keys that `UrlFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "URL Kodlovchi",
  alternateName: ["URL Encoder", "URL Decoder", "Percent Encoding Tool"],
  description:
    "URL va so'rov parametrlarini kodlaydigan va ochadigan bepul vosita. Qiymat va to'liq URL rejimlari alohida; barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/url-encoder`,
  applicationCategory: ["UtilityApplication", "DeveloperApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Qiymat rejimi (encodeURIComponent)",
    "To'liq URL rejimi (encodeURI)",
    "Forma ma'lumotlarida + belgisini bo'sh joy sifatida o'qish",
    "So'rov satrini parametrlarga ajratib ko'rsatish",
    "URL tarkibini tahlil qilish (protokol, host, yo'l, fragment)",
    "Fayldan yuklash va natijani .txt sifatida saqlash"
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
        name: isEnglish ? "URL Encoder" : "URL Kodlovchi",
        item: `${baseUrl}/tools/url-encoder`
      }
    ]
  }
}
