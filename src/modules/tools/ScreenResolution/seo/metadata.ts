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
      "CSS aynan qaysi o'lchamni ko'radi: viewport, oyna va ekran o'lchamlari, faol Tailwind breakpoint, piksel zichligi va tomonlar nisbati. Oynani cho'zing — raqamlar shu zahoti o'zgaradi.",
    social:
      "Viewport, breakpoint, piksel zichligi va tomonlar nisbati — oynani cho'zganingizda jonli o'zgaradigan raqamlar.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Screen Resolution — Viewport & Breakpoint",
    description:
      "The exact size your CSS sees: viewport, window and screen dimensions, the active Tailwind breakpoint, device pixel ratio and aspect ratio. Drag the window and every number updates live.",
    social:
      "Viewport, breakpoint, pixel ratio and aspect ratio — numbers that update live as you resize.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Разрешение экрана и точки останова",
    description:
      "Размер, который на самом деле видит ваш CSS: область просмотра, окно и экран, активная точка останова Tailwind, Bootstrap или MUI, плотность пикселей и соотношение сторон.",
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
