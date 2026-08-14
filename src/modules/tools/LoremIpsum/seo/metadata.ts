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
    title: "Lorem Ipsum — o'zbekcha va klassik matn",
    description:
      "Abzas, gap, so'z yoki aniq bayt hajmida namunaviy matn. Lotinchadan tashqari o'zbekcha lug'at ham bor — dizayn o'zbek matni bilan sinaladi.",
    social:
      "Namunaviy matn generatori: o'zbekcha va klassik lotincha, HTML shakli bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Lorem Ipsum — Uzbek and Classic Text",
    description:
      "Filler text by paragraphs, sentences, words or exact bytes. Includes an Uzbek word list, so a layout can be tested with real Uzbek copy.",
    social:
      "Filler text in Uzbek and classic Latin, with HTML output. Runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Генератор Lorem Ipsum — текст для макета",
    description:
      "Текст-заполнитель по абзацам, предложениям, словам или точному числу байт. Кроме классической латыни есть узбекские словари — латиницей и кириллицей.",
    social:
      "Генерируйте текст-заполнитель для макетов: латынь, узбекская латиница и кириллица.",
    ogLocale: "ru_RU"
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
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz" ? "/tools/lorem-ipsum" : `/${locale}/tools/lorem-ipsum`

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
