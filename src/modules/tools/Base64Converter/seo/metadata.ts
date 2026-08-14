/**
 * SEO metadata for the Base64 converter.
 *
 * Same shape as `ColorConverter/seo` and `LatinCyrillic/seo`, so the routes are
 * maintained the same way. What it replaces lived inline in the route file and
 * served the Uzbek title to `/en`.
 *
 * No `alternates` here on purpose: the canonical and the hreflang set depend on
 * the request locale, so the page derives them with `withLocale`. The title
 * carries no "| Webiston" suffix either — the root layout applies a
 * `%s | Webiston` template on top.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Base64 Konverter — kodlash va dekodlash",
    description:
      "Matn va fayllarni Base64 ga o'giring yoki qaytaring. base64url qo'llanadi, hajm bayt hisobida ko'rsatiladi. Hammasi brauzeringizda.",
    social:
      "Matn va fayllarni Base64 ga o'girish va qaytarish. base64url ham bor, hamma narsa brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Base64 Converter — encode and decode",
    description:
      "Convert text and files to Base64 and back. base64url supported, sizes in real bytes, everything in your browser. Free, no account.",
    social:
      "Encode and decode Base64, including base64url. Everything runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Конвертер Base64 — кодирование и декодирование",
    description:
      "Переведите текст или файл в Base64 и обратно. Поддерживается base64url, есть разбор ошибок. Всё считается в браузере.",
    social:
      "Кодируйте и декодируйте Base64 бесплатно, прямо в браузере — с поддержкой base64url и файлов.",
    ogLocale: "ru_RU"
  }
} as const

export const base64ConverterMetadata: Metadata = {
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

export function getBase64ConverterMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "en" ? "/en/tools/base64-converter" : "/tools/base64-converter"

  return {
    ...base64ConverterMetadata,
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
