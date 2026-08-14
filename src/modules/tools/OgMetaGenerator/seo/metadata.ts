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
    title: "Open Graph — meta taglar generatori",
    description:
      "Sahifangiz Telegram, X, Facebook va LinkedIn'da qanday ko'rinishini ko'ring, tayyor og: va twitter: taglarni oling. Rasm brauzerda tekshiriladi.",
    social:
      "Open Graph va Twitter meta taglari, jonli ulashish kartasi va rasm tekshiruvi bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Open Graph Meta Tag Generator",
    description:
      "See how your page looks on Telegram, X, Facebook and LinkedIn, and copy correctly escaped og: and twitter: tags. Next.js form included.",
    social:
      "Open Graph and Twitter meta tags, with a live share-card preview and a real image check. Runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Генератор Open Graph — мета-теги для соцсетей",
    description:
      "Как ссылка выглядит в Telegram, X, Facebook и LinkedIn — и готовые теги og: и twitter:. Изображение проверяется в браузере.",
    social:
      "Создайте мета-теги Open Graph и посмотрите карточку ссылки для Telegram, X и LinkedIn.",
    ogLocale: "ru_RU"
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
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/og-meta-generator"
      : `/${locale}/tools/og-meta-generator`

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
