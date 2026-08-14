/**
 * SEO metadata for the hash generator.
 *
 * Same shape as the other refactored tools' `seo/` segments. What it replaces
 * lived inline in the route file and served the Uzbek title to `/en`.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Hash generator — SHA-256, SHA-512 va MD5",
    description:
      "Matn yoki faylning SHA-256, SHA-512, SHA-1, MD5 xeshini oling, faylni e'lon qilingan checksum bilan solishtiring, HMAC hisoblang. Brauzerda.",
    social:
      "SHA-256, SHA-512, MD5 hash va HMAC — checksum solishtirish bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Hash Generator — SHA-256, SHA-512, MD5",
    description:
      "SHA-256, SHA-512, SHA-1 and MD5 for any text or file. Compare a download against its checksum, compute HMAC. Everything in your browser.",
    social:
      "SHA-256, SHA-512, MD5 and HMAC, with checksum comparison. Runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Генератор хешей — SHA-256, SHA-512, MD5 и HMAC",
    description:
      "Хеш текста или файла: SHA-256, SHA-512, SHA-1, MD5. Сверьте загрузку с контрольной суммой, есть HMAC. Всё в браузере.",
    social:
      "Считайте SHA-256, SHA-512, MD5 и HMAC и сверяйте контрольные суммы — бесплатно, в браузере.",
    ogLocale: "ru_RU"
  }
} as const

export const hashGeneratorMetadata: Metadata = {
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

export function getHashGeneratorMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/hash-generator"
      : `/${locale}/tools/hash-generator`

  return {
    ...hashGeneratorMetadata,
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
