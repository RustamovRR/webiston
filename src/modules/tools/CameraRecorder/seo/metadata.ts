/**
 * SEO metadata for the camera tool.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Kamera Testi — Veb-kamerani Sinash va Yozib Olish",
    description:
      "Veb-kamerangiz ishlayaptimi? Jonli tasvirni ko'ring, haqiqiy o'lchamni va kadr chastotasini bilib oling, kadr oling yoki video yozing. Kamera qanday sifat bera olishini so'rab tekshiradi — hamma narsa brauzeringizda qoladi.",
    social:
      "Veb-kamerangizni bepul sinang: jonli tasvir, haqiqiy o'lcham va fps, kadr olish va video yozish.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Camera Test — Check Your Webcam and Record",
    description:
      "Is your webcam working? See the live picture, find out the real resolution and frame rate it delivers, take a still or record a clip. It asks the camera for more than it has to discover its ceiling — and everything stays in your browser.",
    social:
      "Test your webcam free: live preview, the resolution and fps it really delivers, stills and recording.",
    ogLocale: "en_US"
  }
} as const

export const cameraRecorderMetadata: Metadata = {
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

export function getCameraRecorderMetadata(locale: string): Metadata {
  const copy = locale === "en" ? COPY.en : COPY.uz
  const path =
    locale === "en" ? "/en/tools/camera-recorder" : "/tools/camera-recorder"

  return {
    ...cameraRecorderMetadata,
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
