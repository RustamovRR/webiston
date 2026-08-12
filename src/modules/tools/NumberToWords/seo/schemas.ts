import type { getTranslations } from "next-intl/server"

import { toolBreadcrumbSchema } from "@/lib/seo"

import { FAQ_KEYS } from "../constants"

/**
 * Structured data for the sum-in-words tool.
 *
 * Two rules, both learned the hard way elsewhere in this repo.
 *
 * **Every claim must be true.** `featureList` names only what the code does —
 * there is no currency other than so'm, no Russian output, and no decimal
 * reading outside tiyin, so none of those appear here.
 *
 * **FAQ content lives in one place**: the same
 * `messages/tools/number-to-words/*` keys the visible `Faq` renders, so the
 * schema can never describe a page that does not exist.
 */

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Summani so'z bilan yozish",
  alternateName: [
    "Raqamni so'z bilan yozish",
    "Number to Words in Uzbek",
    "Сумма прописью на узбекском"
  ],
  description:
    "Raqamni o'zbek tilida so'z bilan yozadigan bepul vosita: lotin va kirill yozuvida bir vaqtda, so'm va tiyin bilan. Barcha hisob brauzerda bajariladi.",
  url: `${BASE_URL}/tools/number-to-words`,
  applicationCategory: ["BusinessApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  // Only capabilities the code actually has.
  featureList: [
    "Raqamni o'zbekcha so'z bilan yozish",
    "Lotin va kirill yozuvida bir vaqtda natija",
    "So'm va tiyin bilan yoki oddiy son sifatida",
    "18 xonagacha — kvadrilliongacha aniq",
    "Probel, vergul va nuqta bilan yozilgan summani o'qiydi",
    "Bosh harf bilan yozish tanlovi",
    "Har bir natijani bir bosishda nusxalash"
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

export function generateBreadcrumbSchema(locale: string) {
  return toolBreadcrumbSchema(locale, "number-to-words", "Summani so'z bilan")
}
