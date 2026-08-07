/**
 * SEO Metadata for the Latin-Cyrillic converter.
 */

import type { Metadata } from "next"
import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

/**
 * The title and description a person reads in a search result.
 *
 * They used to be keyword lists: `"Lotin Kirill O'giruvchi | Лотин Кирилл
 * Таржима Online"` with a description made of six phrases separated by ✓
 * characters, in three languages. That is written for a ranking algorithm from
 * 2011, and the person deciding whether to click sees a wall of repetition.
 *
 * Russian stays in the keyword list — Russian-speaking Uzbeks genuinely search
 * "кирилл лотин" — but it does not belong in the sentence a human reads.
 *
 * No `alternates` here on purpose: the canonical and the hreflang set depend on
 * the request locale, so the page derives them with `withLocale`. A hardcoded
 * Uzbek canonical made /en/tools/latin-cyrillic a declared duplicate. The title
 * carries no "| Webiston" suffix either — the root layout applies a
 * `%s | Webiston` template on top.
 */
const COPY = {
  uz: {
    title: "Lotin-Kirill O'giruvchi",
    description:
      "O'zbek matnini lotinchadan kirillchaga va aksincha o'giring. TXT, PDF va DOCX fayllarni qo'llab-quvvatlaydi. Bepul, ro'yxatdan o'tishsiz, matn brauzeringizdan chiqmaydi.",
    social:
      "O'zbek matnini lotin va kirill yozuvlari o'rtasida o'giring. Bepul va brauzerda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Latin-Cyrillic Converter",
    description:
      "Convert Uzbek text between the Latin and Cyrillic alphabets. Supports TXT, PDF and DOCX files. Free, no account, and your text never leaves the browser.",
    social:
      "Convert Uzbek text between the Latin and Cyrillic alphabets. Free, and it runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Латиница ↔ кириллица — конвертер узбекского текста",
    description:
      "Переводите узбекский текст между латиницей и кириллицей. Учитываются сложные места орфографии, ссылки и код остаются нетронутыми, поддерживаются файлы TXT, PDF и DOCX.",
    social:
      "Конвертер узбекского текста между латиницей и кириллицей — бесплатно, прямо в браузере.",
    ogLocale: "ru_RU"
  }
} as const

/**
 * The /en page used to ship the Uzbek title and description verbatim — the
 * page was in one language and the search result in another. `withLocale`
 * already fixes the canonical and the hreflang set; this fixes the words.
 */
export function getLatinCyrillicMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/latin-cyrillic"
      : `/${locale}/tools/latin-cyrillic`

  return {
    ...latinCyrillicMetadata,
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

export const latinCyrillicMetadata: Metadata = {
  title: COPY.uz.title,
  description: COPY.uz.description,
  keywords: PRIMARY_KEYWORDS,
  openGraph: {
    title: `${COPY.uz.title} — Webiston`,
    description: COPY.uz.social,
    type: "website",
    locale: COPY.uz.ogLocale,
    siteName: "Webiston",
    url: `${BASE_URL}/tools/latin-cyrillic`
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    title: `${COPY.uz.title} — Webiston`,
    description: COPY.uz.social
  },
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
