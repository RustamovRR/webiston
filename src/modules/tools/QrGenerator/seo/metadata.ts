/**
 * SEO metadata for the QR generator.
 *
 * Same shape as the other ported tools' `seo/` segments. What it replaces was a
 * single hardcoded Uzbek object in the route file, so `/en/tools/qr-generator`
 * and `/ru/tools/qr-generator` both published the title "QR Kod Yaratish -
 * Bepul QR Kod Generator Onlayn" — an English and a Russian URL that could not
 * rank for an English or Russian query.
 */

import type { Metadata } from "next"

import { ALL_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

/**
 * The title and description a person reads in a search result.
 *
 * Positioning, because it decides the words: the head term "qr code generator"
 * is held by Adobe, Canva and Bitly and is not winnable here. What is winnable
 * is Uzbek-language intent and the no-account angle. So the Uzbek copy carries
 * "qr kod yaratish" and "qr kod yasang" because that is what people type, the
 * Russian carries "генератор QR-кодов" and "создать QR-код" with the
 * бесплатно/без регистрации promise, and the English leads with free and no
 * signup rather than competing on the head term.
 *
 * Every claim is checked against the module: two input modes (free text and a
 * WiFi form), styling by shape/colour/logo/frame, and SVG, PNG and WebP export.
 * The code is drawn in the browser — `utils/qr-input.ts` documents the removal
 * of the `api.qrserver.com` call — so "nothing uploaded" is literally true.
 *
 * No `alternates` and no `| Webiston` suffix here on purpose: the canonical and
 * the hreflang set depend on the request locale and come from `withLocale`, and
 * the root layout applies a `%s | Webiston` template on top.
 */
const COPY = {
  uz: {
    title: "QR Kod Yaratish — Bepul QR Kod Generator",
    description:
      "Havola, matn yoki WiFi tarmog'i uchun QR kod yasang: shakl, rang, logotip va ramkani tanlab, SVG, PNG yoki WebP'da yuklab oling. Bepul, ro'yxatdan o'tishsiz.",
    social:
      "Havola, matn va WiFi uchun QR kod yarating — bepul, ro'yxatdan o'tishsiz, brauzeringizda.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Free QR Code Generator — No Signup Needed",
    description:
      "Make a QR code for a link, text or WiFi network, style it with shapes, colours and a logo, then download SVG, PNG or WebP. Free, no signup, nothing uploaded.",
    social:
      "QR codes for a link, text or WiFi network — free, no signup, and drawn in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Генератор QR-кодов — создать QR-код бесплатно",
    description:
      "Создайте QR-код для ссылки, текста или сети WiFi: настройте форму, цвета, логотип и рамку и скачайте SVG, PNG или WebP. Бесплатно и без регистрации.",
    social:
      "Генератор QR-кодов для ссылки, текста или WiFi — бесплатно, без регистрации, прямо в браузере.",
    ogLocale: "ru_RU"
  }
} as const

/**
 * The locale-independent half.
 *
 * `keywords` is the route's own list, moved rather than edited — see
 * `keywords.ts`. `classification`, `referrer` and `formatDetection` are carried
 * over unchanged from the object this replaces.
 */
export const qrGeneratorMetadata: Metadata = {
  title: COPY.uz.title,
  description: COPY.uz.description,
  keywords: ALL_KEYWORDS,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "technology",
  classification: "Tools and Utilities",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
}

export function getQrGeneratorMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz" ? "/tools/qr-generator" : `/${locale}/tools/qr-generator`

  return {
    ...qrGeneratorMetadata,
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
      creator: "@webiston_uz",
      title: `${copy.title} — Webiston`,
      description: copy.social
    }
  }
}
