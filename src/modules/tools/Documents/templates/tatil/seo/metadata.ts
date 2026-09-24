import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

/**
 * The result-page copy. Descriptions stay under ~155 characters — the
 * number-to-words tool shipped at 185 once and Google's ellipsis ate the
 * differentiator; not repeated.
 *
 * "Word va PDF" is in the TITLE because Search Console showed that is what
 * this family's searchers type — «tushuntirish xati namuna word» (30
 * impressions, position 4.9, zero clicks) and «…pdf» — and the .docx export
 * and the print-to-PDF both exist. The differentiator leads the description:
 * the end date is counted, holidays included.
 */
const COPY = {
  uz: {
    title: "Ta'til Arizasi Namunasi — Word va PDF",
    description:
      "Mehnat ta'tili arizasini to'ldiring: tugash sanasi bayram kunlarini hisobga olib MK 221-modda bo'yicha o'zi hisoblanadi. Lotin va kirill, Word va chop etish.",
    social:
      "Ta'til arizasi — to'ldiring, tugash sanasi bayramlarni hisobga olib o'zi hisoblanadi. Lotin va kirill, Word va chop etish.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Uzbek Leave Application (Ta'til Arizasi) — Word, PDF",
    description:
      "Fill in an Uzbek leave application: the end date is counted for you, public holidays excluded per Labour Code art. 221. Latin and Cyrillic, Word or print.",
    social:
      "An Uzbek leave application, filled in for you — the end date counted, holidays excluded. Both scripts, Word or print.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Заявление на отпуск — образец, Word и PDF",
    description:
      "Заполните заявление на отпуск: дата окончания считается сама, праздники не входят в отпуск (ст. 221 ТК). Латиница и кириллица, Word и печать.",
    social:
      "Заявление на отпуск — заполните, дата окончания с учётом праздников считается сама. Латиница и кириллица.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const tatilMetadata: Metadata = {
  keywords: PRIMARY_KEYWORDS,
  robots: { index: true, follow: true },
  category: "technology",
  classification: "Business Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false }
}

export function getTatilMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...tatilMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: "https://webiston.uz/tools/tatil-arizasi"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
