/**
 * Structured data for the JWT decoder.
 *
 * Two rules, both of which the inline blob this replaces broke:
 *
 * 1. EVERY CLAIM MUST BE TRUE — and here that matters more than usual. The old
 *    `featureList` advertised "JWT validatsiya" and "Xavfsizlik tekshiruvi" on
 *    a page that does not verify signatures and cannot: verifying needs a
 *    secret this tool deliberately never asks for. Promising validation on a
 *    security tool is worse than promising a colour space.
 * 2. FAQ CONTENT LIVES IN ONE PLACE — the same `messages/tools/jwt-decoder/*`
 *    keys that `JwtFaq` renders.
 */

import type { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "JWT Dekoder",
  alternateName: ["JWT Decoder", "JSON Web Token Decoder", "JWT Parser"],
  description:
    "JSON Web Token'ning header va payload qismlarini ochib ko'rsatadigan bepul vosita. Muddatni tekshiradi, standart da'volarni tushuntiradi; barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/jwt-decoder`,
  applicationCategory: ["UtilityApplication", "DeveloperApplication"],
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
  // Only capabilities the code actually has. Signature verification is NOT
  // among them, on purpose — see the file header and the FAQ.
  featureList: [
    "Header va payload'ni JSON sifatida ochish",
    "UTF-8 da'volarni to'g'ri o'qish (base64url)",
    "exp, nbf va iat bo'yicha muddat tekshiruvi",
    "RFC 7519 standart da'volari izohi",
    "alg: none imzosiz tokenni aniqlash",
    "Header yoki payload'ni JSON fayl sifatida yuklab olish",
    "Fayldan token yuklash"
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
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.answer`)
      }
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
        name: isEnglish ? "JWT Decoder" : "JWT Dekoder",
        item: `${baseUrl}/tools/jwt-decoder`
      }
    ]
  }
}
