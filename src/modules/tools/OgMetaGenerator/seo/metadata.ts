/**
 * SEO metadata for the OG meta generator.
 *
 * Same shape as the other refactored tools' `seo/` segments.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Open Graph Generator — Meta Taglar va Ulashish Kartasi",
    description:
      "Sahifangiz Telegram, X, Facebook va LinkedIn'da qanday ko'rinishini shu yerda ko'ring, og: va twitter: taglarini to'g'ri qo'shtirnoq bilan oling. Rasm o'lchami brauzerda tekshiriladi; Next.js metadata shakli ham bor.",
    social:
      "Open Graph va Twitter meta taglari, jonli ulashish kartasi va rasm tekshiruvi bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Open Graph Generator — Meta Tags and Share Card Preview",
    description:
      "See how your page will look on Telegram, X, Facebook and LinkedIn, and get correctly escaped og: and twitter: tags. The image is measured in your browser, and the Next.js metadata form is one click away.",
    social:
      "Open Graph and Twitter meta tags, with a live share-card preview and a real image check. Runs in your browser.",
    ogLocale: "en_US"
  }
} as const

export const ogMetaGeneratorMetadata: Metadata = {
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

export function getOgMetaGeneratorMetadata(locale: string): Metadata {
  const copy = locale === "en" ? COPY.en : COPY.uz
  const path =
    locale === "en" ? "/en/tools/og-meta-generator" : "/tools/og-meta-generator"

  return {
    ...ogMetaGeneratorMetadata,
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
