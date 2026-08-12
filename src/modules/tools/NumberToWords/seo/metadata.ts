import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

/**
 * The title and description a person reads in a search result.
 *
 * Positioning first. There is no head term to fight over here — the Uzbek
 * queries this targets return a blog post about the algorithm and an Excel
 * macro on a forum, so the job is to be the obvious answer rather than to
 * out-rank anybody. That makes the description's work concrete: say the sum is
 * written in BOTH scripts, because that is the thing nothing else offers.
 *
 * Every claim is checked against the code: both scripts come from
 * `@webiston/transliteration`, so'm and tiyin are named by `utils/words.ts`,
 * and nothing is uploaded because the whole tool is a pure function.
 *
 * Under 160 characters in all three, which is where Google cuts. The Uzbek one
 * on the code-snapshot tool shipped at 185 and lost its differentiator to the
 * ellipsis; that is not repeated here.
 *
 * No `alternates` and no `| Webiston` suffix: the canonical and the hreflang
 * set come from `withLocale`, and the root layout applies the template.
 */
const COPY = {
  uz: {
    title: "Summani So'z Bilan Yozish — Lotin va Kirill",
    description:
      "Raqamni o'zbekcha so'z bilan yozing: lotin va kirill yozuvida, so'm va tiyin bilan. Hisob-faktura va shartnomalar uchun. Bepul, ro'yxatdan o'tishsiz.",
    social:
      "Summani o'zbekcha so'z bilan — lotin va kirill, bir vaqtda. Hujjatlaringiz uchun tayyor.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Number to Words in Uzbek — Latin and Cyrillic",
    description:
      "Write any amount in Uzbek words, in both Latin and Cyrillic, with so'm and tiyin. Made for invoices and contracts. Free, no signup, nothing uploaded.",
    social:
      "Any sum spelled out in Uzbek — Latin and Cyrillic side by side, ready for a document.",
    ogLocale: "en_US"
  },
  ru: {
    // "на узбекском" trimmed to "по-узбекски": with the `| Webiston` suffix
    // the longer form measured 61 characters against Google's ~60 cut, and the
    // word that would have been dropped is "кириллица" — the differentiator.
    title: "Сумма прописью по-узбекски — латиница и кириллица",
    description:
      "Запишите сумму узбекскими словами: латиница и кириллица одновременно, с сумами и тийинами. Для счетов и договоров. Бесплатно, без регистрации.",
    social:
      "Сумма прописью по-узбекски — латиница и кириллица сразу, готово для документа.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const numberToWordsMetadata: Metadata = {
  keywords: PRIMARY_KEYWORDS,
  robots: { index: true, follow: true },
  category: "technology",
  classification: "Business Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false }
}

export function getNumberToWordsMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...numberToWordsMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: "https://webiston.uz/tools/number-to-words"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
