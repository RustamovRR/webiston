import type { Metadata } from "next"

import { NEW_ALPHABET_PATH } from "@/constants/ui"

import { PRIMARY_KEYWORDS } from "./keywords"

/**
 * The result-page copy. Descriptions stay under ~155 characters (the
 * number-to-words tool shipped at 185 once and Google's ellipsis ate the
 * differentiator).
 *
 * The four letters are IN the title: a searcher scanning results for "the new
 * alphabet" recognises Ş Ç Ğ Ö faster than any sentence about them, and they
 * are the query for "ş harfi". "2027" sits next to "Yangi Alifbo" because
 * that pair is how the reform is searched; the description says what the
 * date means — when the law takes effect, not when it was signed. Widths
 * measured with the "| Webiston" suffix: uz 595px, ru 602px, against the
 * ~600px Google shows.
 */
const COPY = {
  uz: {
    // The Cyrillic half is the sibling's lesson: Latin-Cyrillic's title
    // carries one because ~2,500 monthly Cyrillic impressions rode on it, and
    // a page with no Cyrillic text cannot rank for «янги алифбо» at all.
    title: "Yangi Alifbo 2027 — O'girish: Ş, Ç, Ğ, Ö · Янги алифбо",
    description:
      "Matnni yangi o'zbek alifbosiga o'giring: sh → ş, ch → ç, g' → ğ, o' → ö. Lotin yoki kirilldan, bepul. Янги алифбога ўгириш. Kuchga kirishi: 22.04.2027.",
    social:
      "Matnni 2027-yilgi yangi o'zbek lotin alifbosiga o'giring — eski lotin yoki kirilldan, bepul va brauzerda.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "New Uzbek Alphabet Converter — Ş, Ç, Ğ, Ö (2027)",
    description:
      "Convert Uzbek text to the new Latin alphabet: sh → ş, ch → ç, g' → ğ, o' → ö. From Latin or Cyrillic, free, in your browser. In force from 22 April 2027.",
    social:
      "Convert Uzbek text to the 2027 Latin alphabet — from the old Latin or from Cyrillic, free, in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Новый узбекский алфавит 2027 — конвертер Ş Ç Ğ Ö",
    description:
      "Переведите узбекский текст на новую латиницу: sh → ş, ch → ç, g' → ğ, o' → ö. Из латиницы или кириллицы, бесплатно. Закон вступает в силу 22.04.2027.",
    social:
      "Конвертер узбекского текста в новый латинский алфавит 2027 года — из старой латиницы или кириллицы, бесплатно.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const newAlphabetMetadata: Metadata = {
  keywords: PRIMARY_KEYWORDS,
  // `max-image-preview: large` is what lets Discover and the large result
  // thumbnail use the card — this is a news topic. Same block as the
  // Latin-Cyrillic page.
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

export function getNewAlphabetMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...newAlphabetMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: `https://webiston.uz${NEW_ALPHABET_PATH}`
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
