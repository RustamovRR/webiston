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
      "Mikrofoningiz ishlayaptimi? Ovoz darajasini dBFS'da ko'ring, to'lqin va spektrni kuzating, o'zingizni eshiting va yozib olib tinglang. Brauzer qo'llaydigan shovqin bostirish va aks-sado filtrlarini o'chirib, farqni eshitib ko'ring — hammasi qurilmangizda qoladi.",
    social:
      "Mikrofoningizni bepul sinang: dBFS darajasi, to'lqin, spektr, yozib olish va brauzer filtrlarini o'chirish.",
    ogLocale: "uz_UZ"
  },
  en: {
    title: "Microphone Test — Level, Waveform and Recording",
    description:
      "Is your microphone working? See the level in dBFS, watch the waveform and spectrum, hear yourself live, and record a clip to play back. Turn the browser's noise suppression and echo cancellation off and hear the difference — everything stays on your device.",
    social:
      "Test your microphone free: dBFS level, waveform, spectrum, recording, and browser audio processing you can switch off.",
    ogLocale: "en_US"
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
  const copy = locale === "en" ? COPY.en : COPY.uz
  const path =
    locale === "en" ? "/en/tools/microphone-test" : "/tools/microphone-test"

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
