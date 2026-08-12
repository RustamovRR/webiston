import type { Metadata } from "next"

import { ALL_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

/**
 * The title and description a person reads in a search result.
 *
 * Positioning decides the words. "code screenshot" and "code to image" are
 * held by carbon.now.sh and ray.so, both older and both linked from everywhere;
 * competing on the bare head term is not winnable. What is winnable is the
 * intersection nobody occupies — free, no account, and a far deeper theme and
 * language range than either — plus Uzbek-language intent, which neither of
 * them serves at all.
 *
 * Every claim is checked against the module: 65 themes and 360 grammars come
 * from Shiki's own bundle (counted on disk), the picture is drawn on a canvas
 * from tokens so nothing is uploaded, and PNG export runs at 1x, 2x and 3x.
 * No claim about animation, multi-window or annotation — the tool has none.
 *
 * No `alternates` and no `| Webiston` suffix here on purpose: the canonical and
 * the hreflang set depend on the request locale and come from `withLocale`, and
 * the root layout applies a `%s | Webiston` template on top.
 */
const COPY = {
  uz: {
    title: "Koddan Rasm Yasash — Chiroyli Kod Skrinshoti",
    description:
      "Kodingizni chiroyli rasmga aylantiring: 65 ta mavzu, 360 dan ortiq dasturlash tili, 4 xil shrift. PNG'ni 1x, 2x yoki 3x'da yuklab oling. Bepul, ro'yxatdan o'tishsiz.",
    social:
      "Kodingizdan chiroyli rasm yasang — 65 mavzu, 360 til, bepul va ro'yxatdan o'tishsiz.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Code to Image — Beautiful Code Screenshots",
    description:
      "Turn a snippet into a shareable image: 65 themes, 360+ languages, four coding fonts, and PNG export at 1x, 2x or 3x. Free, no signup, nothing uploaded.",
    social:
      "Beautiful images of your code — 65 themes, 360+ languages, free and with no account.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Код в картинку — красивые скриншоты кода",
    description:
      "Превратите фрагмент кода в картинку: 65 тем, более 360 языков, четыре шрифта и экспорт PNG в 1x, 2x или 3x. Бесплатно, без регистрации, ничего не загружается.",
    social:
      "Красивые картинки из вашего кода — 65 тем, 360+ языков, бесплатно и без регистрации.",
    ogLocale: "ru_RU"
  }
} as const

type Locale = keyof typeof COPY

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.uz
}

/** Locale-independent half; the route swaps title and description on top. */
export const codeSnapshotMetadata: Metadata = {
  keywords: ALL_KEYWORDS,
  robots: { index: true, follow: true },
  category: "technology",
  classification: "Developer Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false }
}

export function getCodeSnapshotMetadata(locale: string): Metadata {
  const copy = copyFor(locale)

  return {
    ...codeSnapshotMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.social,
      type: "website",
      siteName: "Webiston",
      locale: copy.ogLocale,
      url: `${BASE_URL}/tools/code-snapshot`
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.social
    }
  }
}
