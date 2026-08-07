/**
 * SEO metadata for the URL encoder.
 *
 * Same shape as the other refactored tools' `seo/` segments. What it replaces
 * lived inline in the route file and served the Uzbek title to `/en`.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "URL Kodlash va Dekodlash",
    description:
      "Havoladagi %20, %3A kabi belgilarni odam o'qiydigan holatga keltiring — yoki aksincha. So'rov parametrlari alohida ajratib ko'rsatiladi, ikki marta kodlangan havolalar aniqlanadi. Hammasi brauzeringizda.",
    social:
      "URL kodlash va ochish — qiymat va to'liq URL rejimlari bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "URL Encode and Decode",
    description:
      "Turn the %20 and %3A in a link back into something readable — or the other way round. Query parameters are broken out one by one, and double-encoded links are spotted for you. Everything runs in your browser.",
    social:
      "Encode and decode URLs, with separate value and whole-URL modes. Runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Кодирование URL — percent-encoding и разбор ссылок",
    description:
      "Переводите %20 и %3A в читаемый вид и обратно, с выбором между кодированием значения и целого URL. Параметры запроса разбираются по одному. Всё в браузере.",
    social:
      "Кодируйте и декодируйте URL и разбирайте параметры запроса — бесплатно, в браузере.",
    ogLocale: "ru_RU"
  }
} as const

export const urlEncoderMetadata: Metadata = {
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

export function getUrlEncoderMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz" ? "/tools/url-encoder" : `/${locale}/tools/url-encoder`

  return {
    ...urlEncoderMetadata,
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
