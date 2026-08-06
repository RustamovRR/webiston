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
      "Brauzeringiz, operatsion tizimingiz, ekraningiz va tarmog'ingiz haqida sayt ko'ra oladigan hamma narsa — ruxsat so'ramasdan. Aynan shu ma'lumotlar birgalikda «barmoq izi» hosil qiladi; sahifa buni ochiq aytadi.",
    social:
      "Brauzer, tizim, ekran, tarmoq va foydalanuvchi afzalliklari — sayt sizdan so'ramasdan biladigan hamma narsa.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Device Info — Browser, Screen and Network",
    description:
      "Everything a website can read about your browser, system, screen and network without asking permission. Those same values combine into a fingerprint, and this page says so plainly.",
    social:
      "Browser, system, display, network and user preferences — everything a site knows without asking.",
    ogLocale: "en_US"
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
  const copy = locale === "en" ? COPY.en : COPY.uz
  const path = locale === "en" ? "/en/tools/device-info" : "/tools/device-info"

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
