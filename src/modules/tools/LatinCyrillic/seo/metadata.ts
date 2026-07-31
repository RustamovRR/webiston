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
export const latinCyrillicMetadata: Metadata = {
  title: "Lotin-Kirill O'giruvchi",
  description:
    "O'zbek matnini lotinchadan kirillchaga va aksincha o'giring. TXT, PDF va DOCX fayllarni qo'llab-quvvatlaydi. Bepul, ro'yxatdan o'tishsiz, matn brauzeringizdan chiqmaydi.",
  keywords: PRIMARY_KEYWORDS,
  openGraph: {
    title: "Lotin-Kirill O'giruvchi — Webiston",
    description:
      "O'zbek matnini lotin va kirill yozuvlari o'rtasida o'giring. Bepul va brauzerda ishlaydi.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston",
    url: `${BASE_URL}/tools/latin-cyrillic`
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    title: "Lotin-Kirill O'giruvchi — Webiston",
    description:
      "O'zbek matnini lotin va kirill yozuvlari o'rtasida o'giring. Bepul va brauzerda ishlaydi."
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
