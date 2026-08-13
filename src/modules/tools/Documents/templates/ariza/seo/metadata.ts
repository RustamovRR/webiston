import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

/**
 * The result-page copy. Descriptions stay under ~155 characters — the
 * number-to-words tool shipped at 185 once and Google's ellipsis ate the
 * differentiator; not repeated.
 *
 * The differentiator here is one thing and it is put first: the last working
 * day is COUNTED for you. Every competing result is an article about the
 * fourteen days or a .doc you still have to do the arithmetic in.
 */
const COPY = {
  uz: {
    title: "Ishdan Bo'shash Arizasi Namunasi — To'ldiring",
    description:
      "Ariza namunasini to'ldiring: oxirgi ish kuni MK 160-moddasi bo'yicha o'zi hisoblanadi, lotin va kirill yozuvida, chop etishga tayyor.",
    social:
      "Ishdan bo'shash arizasi — to'ldiring, oxirgi ish kuni o'zi hisoblanadi. Lotin va kirill, chop etish va Word.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Uzbek Resignation Letter (Ariza) — Template",
    description:
      "Fill in an Uzbek resignation ariza: the last working day is counted for you under Labour Code art. 160, in Latin and Cyrillic, ready to print.",
    social:
      "An Uzbek resignation ariza, filled in for you — the notice period counted, both scripts, printable.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Заявление на увольнение — образец с расчётом",
    description:
      "Заполните заявление об увольнении: последний рабочий день считается сам по ст. 160 ТК, латиница и кириллица, готово к печати.",
    social:
      "Заявление на увольнение — заполните, дата считается сама. Латиница и кириллица, печать и Word.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const arizaMetadata: Metadata = {
  keywords: PRIMARY_KEYWORDS,
  robots: { index: true, follow: true },
  category: "technology",
  classification: "Business Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false }
}

export function getArizaMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...arizaMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: "https://webiston.uz/tools/ishdan-boshash-arizasi"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
