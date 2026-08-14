import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

/**
 * Descriptions stay under ~155 characters — the sitewide audit found 38 over
 * that and rewrote them; this one does not join the pile.
 *
 * The differentiator goes first and it is the pair no competitor has: it is
 * free with no signup, and the whole CV flips between Latin and Cyrillic.
 */
const COPY = {
  uz: {
    title: "Rezyume Yaratish — Bepul, Ro'yxatdan O'tishsiz",
    description:
      "Rezyumeni onlayn to'ldiring va chop eting. Lotin va kirill yozuvida, hammasi brauzeringizda qoladi — ro'yxatdan o'tish shart emas.",
    social:
      "Rezyumeni bepul to'ldiring va chop eting — lotin va kirill, hammasi brauzeringizda.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Uzbek Resume Builder — Free, No Signup",
    description:
      "Build a CV for the Uzbek job market and print it. Latin and Cyrillic, local conventions supported, and everything stays in your browser.",
    social:
      "Build an Uzbek CV for free — Latin and Cyrillic, and it never leaves your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Создать резюме онлайн — бесплатно, без регистрации",
    description:
      "Заполните резюме и распечатайте. Латиница и кириллица, узбекские требования учтены, всё остаётся в вашем браузере.",
    social:
      "Резюме онлайн бесплатно — латиница и кириллица, всё остаётся в браузере.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const resumeMetadata: Metadata = {
  keywords: PRIMARY_KEYWORDS,
  robots: { index: true, follow: true },
  category: "technology",
  classification: "Business Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false }
}

export function getResumeMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...resumeMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: "https://webiston.uz/tools/rezyume"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
