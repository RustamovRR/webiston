/**
 * SEO metadata for the device info tool.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Qurilma Ma'lumotlari — Brauzer, Ekran va Tarmoq",
    description:
      "Sayt ruxsat so'ramasdan siz haqingizda ko'radigan hamma narsa: brauzer, tizim, ekran, tarmoq. Shular birgalikda «barmoq izi» hosil qiladi.",
    social:
      "Brauzer, tizim, ekran, tarmoq va foydalanuvchi afzalliklari — sayt sizdan so'ramasdan biladigan hamma narsa.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Device Info — Browser, Screen and Network",
    description:
      "Everything a site can read without asking: browser, system, screen and network. The same values form your fingerprint — said plainly.",
    social:
      "Browser, system, display, network and user preferences — everything a site knows without asking.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Сведения об устройстве — браузер, система и экран",
    description:
      "Всё, что сайт узнаёт без разрешения: браузер, система, экран, сеть. Из этих значений складывается отпечаток. Данные не уходят со страницы.",
    social:
      "Что ваш браузер рассказывает о вас каждому сайту — и почему это складывается в отпечаток.",
    ogLocale: "ru_RU"
  }
} as const

export const deviceInfoMetadata: Metadata = {
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

export function getDeviceInfoMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz" ? "/tools/device-info" : `/${locale}/tools/device-info`

  return {
    ...deviceInfoMetadata,
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
