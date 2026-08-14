/**
 * SEO metadata for the IP info tool.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "IP Manzil — Joylashuv, Provayder va ASN",
    description:
      "IP manzilingiz qayerga ishora qiladi: davlat, shahar, provayder, ASN, vaqt mintaqasi. Istalgan IPv4/IPv6 ni tekshiring — so'rov o'z serverimizdan.",
    social:
      "IP manzilingiz, joylashuvi, provayderi va ASN raqami — bepul, ro'yxatdan o'tmasdan.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "IP Address — Location, ISP and ASN",
    description:
      "Where your IP points: country, city, ISP, ASN and time zone. Look up any IPv4 or IPv6 — the request goes through our server, not your browser.",
    social:
      "Your IP address, its location, the network operating it and its ASN — free, no signup.",
    ogLocale: "en_US"
  },
  ru: {
    title: "IP-адрес — расположение, провайдер и ASN",
    description:
      "Куда указывает ваш IP: страна, город, провайдер, ASN, часовой пояс. Проверьте любой IPv4/IPv6 — запрос идёт через наш сервер.",
    social:
      "Ваш IP-адрес, его расположение, провайдер и номер ASN — бесплатно, без регистрации.",
    ogLocale: "ru_RU"
  }
} as const

export const ipInfoMetadata: Metadata = {
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

export function getIpInfoMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path = locale === "uz" ? "/tools/ip-info" : `/${locale}/tools/ip-info`

  return {
    ...ipInfoMetadata,
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
