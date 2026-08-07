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
      "Matn yoki faylning SHA-256, SHA-512, SHA-384, SHA-1 va MD5 barmoq izini oling. Yuklab olgan faylingizni e'lon qilingan checksum bilan solishtiring, HMAC imzosini hisoblang. Hammasi brauzeringizda.",
    social:
      "SHA-256, SHA-512, MD5 hash va HMAC — checksum solishtirish bilan. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Hash Generator — SHA-256, SHA-512, MD5",
    description:
      "Get the SHA-256, SHA-512, SHA-384, SHA-1 and MD5 fingerprint of any text or file. Compare a download against its published checksum and compute HMAC signatures. Everything runs in your browser.",
    social:
      "SHA-256, SHA-512, MD5 and HMAC, with checksum comparison. Runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Генератор хешей — SHA-256, SHA-512, MD5 и HMAC",
    description:
      "Вычислите хеш текста или файла и сверьте загрузку с опубликованной контрольной суммой. Есть HMAC для проверки подписей вебхуков. Всё считается в браузере через Web Crypto.",
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
