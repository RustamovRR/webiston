/**
 * SEO metadata for the microphone test.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "Mikrofon Testi — Daraja, To'lqin va Yozib Olish",
    description:
      "Mikrofoningiz ishlayaptimi? dBFS daraja, to'lqin va spektr, yozib olib tinglash. Shovqin filtrlarini o'chirib solishtiring — hammasi qurilmangizda.",
    social:
      "Mikrofoningizni bepul sinang: dBFS darajasi, to'lqin, spektr, yozib olish va brauzer filtrlarini o'chirish.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Microphone Test — Level, Waveform and Recording",
    description:
      "Is your microphone working? Level in dBFS, waveform and spectrum, record and play back. Toggle noise suppression off — all on your device.",
    social:
      "Test your microphone free: dBFS level, waveform, spectrum, recording, and browser audio processing you can switch off.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Проверка микрофона — уровень, волна и запись",
    description:
      "Работает ли микрофон? Уровень в dBFS, волна и спектр, запись и прослушивание. Отключите фильтры и услышьте разницу — всё на устройстве.",
    social:
      "Проверьте микрофон бесплатно: уровень в dBFS, волна, спектр, запись и отключаемые фильтры.",
    ogLocale: "ru_RU"
  }
} as const

export const microphoneTestMetadata: Metadata = {
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

export function getMicrophoneTestMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/microphone-test"
      : `/${locale}/tools/microphone-test`

  return {
    ...microphoneTestMetadata,
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
