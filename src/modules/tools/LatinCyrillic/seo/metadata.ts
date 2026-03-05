/**
 * SEO Metadata for Latin-Cyrillic Converter
 */

import type { Metadata } from "next"
import { ALL_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

export const latinCyrillicMetadata: Metadata = {
  title: "Lotin Kirill O'giruvchi | Лотин Кирилл Таржима Online - Webiston",
  description:
    "Lotin krill перевод online ✓ Kirill lotin converter ✓ PDF, DOCX, TXT fayl yuklash ✓ Онлайн переводчик крилл-лотин ✓ O'zbek matnlarini bepul o'girish. Лотин кирилл таржима dasturi.",
  keywords: ALL_KEYWORDS,
  openGraph: {
    title: "Lotin Kirill O'giruvchi | Лотин Кирилл Таржима Online - Webiston",
    description:
      "Lotin krill перевод online ✓ Kirill lotin converter ✓ PDF, DOCX, TXT fayl yuklash ✓ O'zbek matnlarini bepul o'girish. Лотин кирилл таржима dasturi. Tez va aniq!",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston",
    url: `${BASE_URL}/tools/latin-cyrillic`,
    images: [
      {
        url: `${BASE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Lotin Kirill O'giruvchi - Лотин Кирилл Таржима Online",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    creator: "@webiston_uz",
    title: "Lotin Kirill O'giruvchi | Лотин Кирилл Online",
    description:
      "Lotin krill перевод online ✓ PDF, DOCX, TXT fayl yuklash ✓ O'zbek matnlarini bepul o'girish. Лотин кирилл таржима!",
    images: [`${BASE_URL}/logo.png`]
  },
  alternates: {
    canonical: `${BASE_URL}/tools/latin-cyrillic`,
    languages: {
      uz: `${BASE_URL}/tools/latin-cyrillic`,
      en: `${BASE_URL}/en/tools/latin-cyrillic`,
      "x-default": `${BASE_URL}/tools/latin-cyrillic`
    }
  },
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
