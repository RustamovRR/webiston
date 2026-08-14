import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

/**
 * The result-page copy. Descriptions stay under ~155 characters — the
 * number-to-words tool shipped at 185 once and Google's ellipsis ate the
 * differentiator; not repeated.
 *
 * The differentiator is put first, and it is not "a template": it is that the
 * note can END three different ways. Every competing result hands over one
 * fixed wording that admits the act.
 */
const COPY = {
  uz: {
    title: "Tushuntirish Xati Namunasi — To'ldiring",
    description:
      "Tushuntirish xatini to'ldiring: aybni tan olish yoki rad etish — yakuniy jumlani o'zingiz tanlaysiz. Lotin va kirill, chop etish va Word.",
    social:
      "Tushuntirish xati — to'ldiring, yakuniy jumlani tanlang. Lotin va kirill, chop etish va Word.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Uzbek Explanatory Note — Tushuntirish Xati Template",
    description:
      "Fill in an Uzbek explanatory note for work: choose how it closes — admit, explain or deny. Latin and Cyrillic, ready to print or download as Word.",
    social:
      "An Uzbek explanatory note, filled in for you — and you choose how it ends. Both scripts, printable.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Объяснительная записка — образец, Узбекистан",
    description:
      "Заполните объяснительную записку: признать, объяснить или отрицать — концовку выбираете вы. Латиница и кириллица, печать и Word.",
    social:
      "Объяснительная записка — заполните, концовку выбираете вы. Латиница и кириллица, печать и Word.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const tushuntirishMetadata: Metadata = {
  keywords: PRIMARY_KEYWORDS,
  robots: { index: true, follow: true },
  category: "technology",
  classification: "Business Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false }
}

export function getTushuntirishMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...tushuntirishMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: "https://webiston.uz/tools/tushuntirish-xati"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
