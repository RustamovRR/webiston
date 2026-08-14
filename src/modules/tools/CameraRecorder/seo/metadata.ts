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
      "Veb-kamerangiz ishlayaptimi? Jonli tasvir, haqiqiy o'lcham va kadr chastotasi, suratga olish va video yozish. Hammasi brauzeringizda qoladi.",
    social:
      "Veb-kamerangizni bepul sinang: jonli tasvir, haqiqiy o'lcham va fps, kadr olish va video yozish.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Camera Test — Check Your Webcam and Record",
    description:
      "Is your webcam working? Live picture, the real resolution and frame rate, stills and clips. Everything stays in your browser.",
    social:
      "Test your webcam free: live preview, the resolution and fps it really delivers, stills and recording.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Проверка камеры — тест веб-камеры и запись видео",
    description:
      "Работает ли веб-камера? Живая картинка, реальное разрешение и частота кадров, кадр или видео. Всё остаётся в браузере.",
    social:
      "Проверьте веб-камеру бесплатно: живая картинка, реальные разрешение и fps, кадры и запись видео.",
    ogLocale: "ru_RU"
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
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/camera-recorder"
      : `/${locale}/tools/camera-recorder`

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
