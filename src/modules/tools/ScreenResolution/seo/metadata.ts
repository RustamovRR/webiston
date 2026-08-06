/**
 * SEO metadata for the screen resolution tool.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Ekran O'lchami — Viewport, Breakpoint va Piksel Zichligi",
    description:
      "CSS aynan qaysi o'lchamni ko'radi: viewport, oyna va ekran o'lchamlari, faol Tailwind breakpoint, piksel zichligi va tomonlar nisbati. Oynani cho'zing — raqamlar shu zahoti o'zgaradi.",
    social:
      "Viewport, breakpoint, piksel zichligi va tomonlar nisbati — oynani cho'zganingizda jonli o'zgaradigan raqamlar.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Screen Resolution — Viewport, Breakpoints and Pixel Ratio",
    description:
      "The exact size your CSS sees: viewport, window and screen dimensions, the active Tailwind breakpoint, device pixel ratio and aspect ratio. Drag the window and every number updates live.",
    social:
      "Viewport, breakpoint, pixel ratio and aspect ratio — numbers that update live as you resize.",
    ogLocale: "en_US"
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
  const copy = locale === "en" ? COPY.en : COPY.uz
  const path =
    locale === "en" ? "/en/tools/screen-resolution" : "/tools/screen-resolution"

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
