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
      "IP manzilingiz qayerga ishora qiladi va uni kim boshqaradi: davlat, shahar, provayder, ASN va vaqt mintaqasi. Istalgan IPv4 yoki IPv6 manzilni ham tekshiring — so'rov brauzeringizdan emas, o'z serverimizdan yuboriladi.",
    social:
      "IP manzilingiz, joylashuvi, provayderi va ASN raqami — bepul, ro'yxatdan o'tmasdan.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "IP Address — Location, ISP and ASN",
    description:
      "Where your IP address points and who runs it: country, city, ISP, ASN and time zone. Look up any IPv4 or IPv6 address too — the request goes through our own server, not from your browser to a third party.",
    social:
      "Your IP address, its location, the network operating it and its ASN — free, no signup.",
    ogLocale: "en_US"
  },
  ru: {
    title: "IP-адрес — расположение, провайдер и ASN",
    description:
      "Куда указывает ваш IP-адрес и кто им управляет: страна, город, провайдер, ASN и часовой пояс. Можно проверить любой адрес IPv4 или IPv6 — запрос идёт через наш сервер, а не из вашего браузера.",
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
