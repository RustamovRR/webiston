/**
 * SEO metadata for the colour converter.
 *
 * The blob this replaces lived inline in the route file and described a
 * different tool: CMYK conversion (never implemented), a triadic palette
 * (never implemented), `softwareVersion: "2.0"`, and an Uzbek title served to
 * the English page. Same shape as `LatinCyrillic/seo` so the two routes are
 * maintained the same way.
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
    title: "Rang O'giruvchi va Palette Generator",
    description:
      "HEX, RGB, HSL, Lab va OKLCH formatlar orasida rang o'giring, WCAG kontrastini tekshiring va 50–950 rang shkalasi bilan palette yarating. Bepul, ro'yxatdan o'tishsiz, brauzerda ishlaydi.",
    social:
      "HEX, RGB, HSL va OKLCH o'girish, WCAG kontrast tekshiruvi va palette generatsiyasi. Bepul va brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Color Converter and Palette Generator",
    description:
      "Convert colors between HEX, RGB, HSL, Lab and OKLCH, check WCAG contrast, and generate palettes with a 50–950 shade scale. Free, no account, runs in your browser.",
    social:
      "Convert HEX, RGB, HSL and OKLCH, check WCAG contrast and generate palettes. Free, and it runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Конвертер цветов — HEX, RGB, HSL и OKLCH",
    description:
      "Переводите цвета между HEX, RGB, HSL, Lab, LCH и OKLCH, проверяйте контраст по WCAG и собирайте палитры и шкалы для Tailwind v4. Всё считается в браузере.",
    social:
      "Конвертер цветов и генератор палитр: HEX, RGB, HSL, OKLCH, проверка контраста WCAG — бесплатно.",
    ogLocale: "ru_RU"
  }
} as const

export const colorConverterMetadata: Metadata = {
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

export function getColorConverterMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/color-converter"
      : `/${locale}/tools/color-converter`

  return {
    ...colorConverterMetadata,
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
