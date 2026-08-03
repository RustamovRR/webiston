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
    title: "URL Kodlovchi — encode va decode",
    description:
      "URL va so'rov parametrlarini to'g'ri kodlang yoki oching. Qiymat va to'liq URL rejimlari alohida, so'rov satri parametrlarga ajratib ko'rsatiladi. Hammasi brauzeringizda.",
    social:
      "URL kodlash va ochish — qiymat va to'liq URL rejimlari bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "URL Encoder — encode and decode",
    description:
      "Encode and decode URLs and query parameters correctly. Value and whole-URL modes are separate, and the query string is broken out parameter by parameter. Everything runs in your browser.",
    social:
      "Encode and decode URLs, with separate value and whole-URL modes. Runs in your browser.",
    ogLocale: "en_US"
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
  const copy = locale === "en" ? COPY.en : COPY.uz
  const path = locale === "en" ? "/en/tools/url-encoder" : "/tools/url-encoder"

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
