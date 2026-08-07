/**
 * SEO metadata for the JWT decoder.
 *
 * Same shape as `ColorConverter/seo` and `Base64Converter/seo`. What it
 * replaces lived inline in the route file and served the Uzbek title to `/en`.
 *
 * No `alternates` here on purpose: the canonical and the hreflang set depend on
 * the request locale, so the page derives them with `withLocale`.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "JWT Dekoder — token ichida nima bor",
    description:
      "JSON Web Token'ni ochib ko'ring: header, payload, standart da'volar va muddati. Token brauzeringizdan chiqmaydi; imzo tekshirilmaydi va buning sababi sahifada tushuntirilgan.",
    social:
      "JWT'ni oching: header, payload va muddati. Hammasi brauzeringizda.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "JWT Decoder — see what is inside a token",
    description:
      "Open a JSON Web Token: header, payload, registered claims and expiry. The token never leaves your browser, and the page explains why signatures are not verified here.",
    social:
      "Decode a JWT: header, payload and expiry. Everything runs in your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Декодер JWT — разбор JSON Web Token",
    description:
      "Посмотрите, что внутри токена: заголовок, полезная нагрузка, срок действия и алгоритм подписи. Токен не покидает браузер, и подпись здесь намеренно не проверяется.",
    social:
      "Разберите JWT в браузере: заголовок, нагрузка и срок действия — токен никуда не отправляется.",
    ogLocale: "ru_RU"
  }
} as const

export const jwtDecoderMetadata: Metadata = {
  title: COPY.uz.title,
  description: COPY.uz.description,
  keywords: PRIMARY_KEYWORDS,
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

export function getJwtDecoderMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz" ? "/tools/jwt-decoder" : `/${locale}/tools/jwt-decoder`

  return {
    ...jwtDecoderMetadata,
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
