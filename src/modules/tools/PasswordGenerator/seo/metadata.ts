/**
 * SEO metadata for the password generator.
 *
 * Same shape as the other refactored tools' `seo/` segments. What it replaces
 * was a single hardcoded Uzbek object in the route file, so `/en/tools/
 * password-generator` and `/ru/tools/password-generator` both served an Uzbek
 * `<title>` and `<meta description>` — two URLs that cannot rank for a query
 * written in the language of the page.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

/**
 * The title and description a person reads in a search result.
 *
 * The differentiator in all three languages is the same one, because for a
 * password tool it is the ONLY thing a cautious searcher is looking for: the
 * password is drawn here, in their browser, and never travels. That is true of
 * this code and checkable — `utils/generate-password.ts` draws from
 * `crypto.getRandomValues`, the module makes no network call of any kind, and
 * `stores/passwordStore.ts` is deliberately not persisted, so the value is not
 * written to `localStorage` either.
 *
 * No `alternates` and no "| Webiston" suffix here on purpose. The canonical and
 * the hreflang set depend on the request locale, so the route derives them with
 * `withLocale`; the suffix comes from the root layout's `%s | Webiston`
 * template and adding one here would double it.
 */
const COPY = {
  uz: {
    // 61 chars rendered with the " | Webiston" template on top. "Xavfsiz" is
    // the word the description carries anyway.
    // "Parol yaratish" FIRST — it is the phrase people actually type (GSC:
    // «parollar» 533 impr / 0.4% CTR, «parol» 399 / 0.3%, while «login parol
    // yaratish» clicked at 9.1%): lead with the words that match the query.
    title: "Parol Yaratish — Kuchli Parol Generatori",
    description:
      "Kuchli va tasodifiy parol yarating: uzunlik, harflar, raqamlar va belgilarni o'zingiz tanlaysiz. Parol brauzeringizda yaratiladi va hech qayerga yuborilmaydi.",
    social:
      "Kuchli va tasodifiy parol yarating — parol brauzeringizdan chiqmaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Password Generator — Strong Random Passwords",
    description:
      "Generate a strong random password with the length and character types you choose. It is created in your browser with Web Crypto and never sent anywhere.",
    social:
      "Generate a strong random password in your browser. It is never sent anywhere.",
    ogLocale: "en_US"
  },
  /**
   * Terminology follows `messages/tools/password-generator/ru.json`, which is
   * already fully translated and is what the page itself says: "Генератор
   * паролей", "стойкость", "энтропия", "надёжный" — not a fresh set of
   * synonyms invented for the meta tags.
   */
  ru: {
    title: "Генератор паролей — надёжный пароль онлайн",
    description:
      "Создайте надёжный пароль нужной длины и с нужными символами, а рядом увидите его стойкость и энтропию. Пароль создаётся в браузере и никуда не передаётся.",
    social:
      "Надёжный пароль онлайн — создаётся прямо в браузере и никуда не передаётся.",
    ogLocale: "ru_RU"
  }
} as const

/**
 * The locale-independent half: keywords, robots directives and the classifiers
 * the route used to carry inline.
 */
export const passwordGeneratorMetadata: Metadata = {
  title: COPY.uz.title,
  description: COPY.uz.description,
  keywords: PRIMARY_KEYWORDS,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "technology",
  classification: "Tools and Utilities",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
}

export function getPasswordGeneratorMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/password-generator"
      : `/${locale}/tools/password-generator`

  return {
    ...passwordGeneratorMetadata,
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
      creator: "@webiston_uz",
      title: `${copy.title} — Webiston`,
      description: copy.social
    }
  }
}
