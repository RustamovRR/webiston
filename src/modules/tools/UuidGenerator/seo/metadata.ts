/**
 * SEO metadata for the UUID generator.
 *
 * Same shape as the other refactored tools' `seo/` segments. What it replaces
 * lived inline in the route file, served the Uzbek title to `/en`, and
 * described a tool with "Professional interfeys" and `softwareVersion: "2.0"`.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "UUID Generator — v4, v7, v1 va UUID Tekshiruvchi",
    description:
      "UUID v4, v7 va v1 — bittadan yoki 1000 tagacha. Qo'lingizdagi UUID versiyasi va vaqtini aniqlang. Hammasi brauzeringizda.",
    social:
      "UUID v4, v7 va v1 — 1000 tagacha, hamda UUID tahlilchisi. Brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "UUID Generator — v4, v7, v1 and UUID Inspector",
    description:
      "Generate UUID v4, v7 (time-ordered) and v1, up to 1000 at once. Paste a UUID to read its version and creation time. In your browser.",
    social:
      "UUID v4, v7 and v1 in bulk, plus an inspector that reads any UUID. Runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Генератор UUID — v4, v7 и v1",
    description:
      "UUID v4, v7 и v1 — по одному или до 1000 сразу. Разбор готового UUID: версия, вариант, время создания. Всё в браузере.",
    social:
      "Генерируйте UUID v4, v7 и v1 и разбирайте чужие UUID — бесплатно, прямо в браузере.",
    ogLocale: "ru_RU"
  }
} as const

export const uuidGeneratorMetadata: Metadata = {
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

export function getUuidGeneratorMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/uuid-generator"
      : `/${locale}/tools/uuid-generator`

  return {
    ...uuidGeneratorMetadata,
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
