import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

/**
 * The result-page copy. Descriptions stay under ~155 characters — the
 * number-to-words tool shipped at 185 once and Google's ellipsis ate the
 * differentiator; not repeated.
 *
 * The differentiators, in the order they matter to the searcher: filled in
 * for you (the incumbents are articles and .doc dumps), the sum written out
 * in words automatically, both scripts, printable.
 */
const COPY = {
  uz: {
    title: "Tilxat Yozish — Tayyor Namuna, Chop Etish",
    description:
      "Qarz tilxatini onlayn to'ldiring: summa avtomatik so'z bilan, lotin va kirill yozuvida, chop etishga tayyor. Bepul, hech narsa yuborilmaydi.",
    social:
      "Tilxat namunasi — to'ldiring, summa o'zi so'z bilan yoziladi, chop eting. Lotin va kirill.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Uzbek Loan Receipt (Tilxat) — Fill and Print",
    description:
      "Fill in an Uzbek loan receipt online: the sum is written out in words automatically, in Latin and Cyrillic script, ready to print. Free, nothing uploaded.",
    social:
      "An Uzbek tilxat, filled in for you — sum in words, both scripts, printable.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Расписка о займе по-узбекски — заполнить и распечатать",
    description:
      "Заполните долговую расписку онлайн: сумма прописью автоматически, латиница и кириллица, готово к печати. Бесплатно, ничего не загружается.",
    social:
      "Тилхат — расписка о займе: заполните, сумма прописью сама, печать в один клик.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const tilxatMetadata: Metadata = {
  keywords: PRIMARY_KEYWORDS,
  robots: { index: true, follow: true },
  category: "technology",
  classification: "Business Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false }
}

export function getTilxatMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...tilxatMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: "https://webiston.uz/tools/tilxat"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
