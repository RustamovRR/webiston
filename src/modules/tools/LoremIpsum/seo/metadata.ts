/**
 * SEO metadata for the lorem ipsum generator.
 *
 * Same shape as the other refactored tools' `seo/` segments.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Lorem Ipsum Generator — O'zbekcha va Klassik Namunaviy Matn",
    description:
      "Maket uchun namunaviy matn yarating: abzas, gap, so'z yoki aniq bayt hajmida. Klassik lotincha matndan tashqari o'zbekcha ro'yxat ham bor — dizayn o'zbek matni bilan qanday ko'rinishini oldindan ko'rasiz. HTML shaklida ham olinadi.",
    social:
      "Namunaviy matn generatori: o'zbekcha va klassik lotincha, HTML shakli bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Lorem Ipsum Generator — Uzbek and Classic Filler Text",
    description:
      "Generate filler text by paragraphs, sentences, words or an exact number of bytes. Alongside the classic Latin list there is an Uzbek one, so you can see how a layout holds real Uzbek copy. HTML output included.",
    social:
      "Filler text in Uzbek and classic Latin, with HTML output. Runs in your browser.",
    ogLocale: "en_US"
  }
} as const

export const loremIpsumMetadata: Metadata = {
  title: COPY.uz.title,
  description: COPY.uz.description,
  keywords: PRIMARY_KEYWORDS,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "technology"
}

export function getLoremIpsumMetadata(locale: string): Metadata {
  const copy = locale === "en" ? COPY.en : COPY.uz
  const path = locale === "en" ? "/en/tools/lorem-ipsum" : "/tools/lorem-ipsum"

  return {
    ...loremIpsumMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: `${copy.title} — Webiston`,
      description: copy.social,
      type: "website",
      locale: copy.ogLocale,
      siteName: "Webiston",
      url: `${BASE_URL}${path}`
    },
    twitter: {
      card: "summary_large_image",
      site: "@webiston_uz",
      title: `${copy.title} — Webiston`,
      description: copy.social
    }
  }
}
