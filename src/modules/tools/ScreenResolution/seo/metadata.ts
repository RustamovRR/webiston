/**
 * SEO metadata for the screen resolution tool.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Ekran o'lchami — viewport va breakpoint",
    description:
      "CSS ko'radigan aniq o'lcham: viewport, oyna, ekran, faol Tailwind breakpoint, piksel zichligi. Oynani cho'zing — raqamlar jonli o'zgaradi.",
    social:
      "Viewport, breakpoint, piksel zichligi va tomonlar nisbati — oynani cho'zganingizda jonli o'zgaradigan raqamlar.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Screen Resolution — Viewport & Breakpoint",
    description:
      "The exact size your CSS sees: viewport, window, screen, active Tailwind breakpoint and pixel ratio. Drag the window — numbers update live.",
    social:
      "Viewport, breakpoint, pixel ratio and aspect ratio — numbers that update live as you resize.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Разрешение экрана и точки останова",
    description:
      "Размер, который видит ваш CSS: окно, экран, активный брейкпоинт Tailwind, Bootstrap или MUI, плотность пикселей. Всё обновляется вживую.",
    social:
      "Узнайте размер области просмотра, активную точку останова CSS и плотность пикселей.",
    ogLocale: "ru_RU"
  }
} as const

export const screenResolutionMetadata: Metadata = {
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

export function getScreenResolutionMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/screen-resolution"
      : `/${locale}/tools/screen-resolution`

  return {
    ...screenResolutionMetadata,
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
