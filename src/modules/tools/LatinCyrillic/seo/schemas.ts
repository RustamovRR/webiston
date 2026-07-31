/**
 * Structured data for the Latin-Cyrillic converter.
 *
 * Two rules this file now follows, both of which it used to break:
 *
 * 1. EVERY CLAIM MUST BE TRUE. It advertised "99.9% aniqlik" (an unsourceable
 *    marketing number, published to Google while the engine was turning
 *    "ishchi" into "ищи"), a 200 MB upload limit no browser can honour, and a
 *    PDF export the code has never had. All three are gone.
 *
 * 2. FAQ CONTENT LIVES IN ONE PLACE. The six Q&As were hardcoded here and
 *    rendered NOWHERE — FAQPage markup with no visible counterpart is a Google
 *    guidelines violation, on the site's highest-traffic URL. They now come
 *    from the same `messages/tools/latin-cyrillic/*.json` keys that
 *    `ConverterFaq` renders, so the two cannot drift apart.
 */

import type { getTranslations } from "next-intl/server"

import { FAQ_KEYS, MAX_FILE_SIZE_MB } from "../constants"

const BASE_URL = "https://webiston.uz"

type Translator = Awaited<ReturnType<typeof getTranslations>>

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Lotin Kirill O'giruvchi",
  alternateName: [
    "Latin-Cyrillic Converter",
    "Lotin-Kirill O'giruvchi",
    "Kirill Lotin Converter",
    "Лотин Кирилл Таржимон",
    "Онлайн переводчик кирилл-лотин"
  ],
  description:
    "O'zbek matnini lotinchadan kirillchaga va aksincha o'giruvchi bepul vosita. TXT, PDF va DOCX fayllarni qo'llab-quvvatlaydi; o'girish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/latin-cyrillic`,
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UZS"
  },
  author: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL
  },
  publisher: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL
  },
  // Only capabilities the code actually has. The previous list promised
  // "Fayl yuklab olish (PDF, DOCX, TXT)" — there is no PDF export path.
  featureList: [
    "Lotin → Kirill o'girish",
    "Kirill → Lotin o'girish",
    "Yo'nalishni avtomatik aniqlash",
    "TXT, PDF va DOCX fayldan matn o'qish",
    "Natijani TXT yoki DOCX ko'rinishida saqlash",
    "Havola, e-pochta, kod va texnik atamalarni saqlab qolish",
    "Matn brauzerdan chiqmaydi"
  ],
  inLanguage: ["uz", "en"]
}

/**
 * Reads the SAME keys `ConverterFaq` renders.
 *
 * Takes a translator rather than a locale string: the answers are then a
 * single source of truth, and a question that exists in the schema but not on
 * the page becomes impossible rather than merely discouraged.
 */
export function generateFAQSchema(t: Translator) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.answer`)
      }
    }))
  }
}

export function generateBreadcrumbSchema(locale: string = "uz") {
  const labels =
    locale === "en"
      ? { home: "Home", tools: "Tools", tool: "Latin-Cyrillic Converter" }
      : {
          home: "Bosh sahifa",
          tools: "Vositalar",
          tool: "Lotin-Kirill O'giruvchi"
        }

  const baseUrl = locale === "en" ? `${BASE_URL}/en` : BASE_URL

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: labels.home, item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: labels.tools,
        item: `${baseUrl}/tools`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: labels.tool,
        item: `${baseUrl}/tools/latin-cyrillic`
      }
    ]
  }
}

export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "O'zbek matnini lotindan kirillga o'girish",
  description:
    "Matnni qo'yish yoki fayl yuklash orqali o'zbek matnini lotin va kirill yozuvlari o'rtasida o'girish.",
  step: [
    {
      "@type": "HowToStep",
      name: "Matnni qo'ying",
      text: "Matnni chap oynaga qo'ying yoki TXT, PDF, DOCX faylni sahifaga tashlang."
    },
    {
      "@type": "HowToStep",
      name: "Yo'nalishni tekshiring",
      // No "press convert" step: conversion is live, and telling the user to
      // press a button that does not exist was the previous version's answer.
      text: "Yo'nalish avtomatik aniqlanadi. Kerak bo'lsa «Avto» o'rniga kerakli yo'nalishni tanlang."
    },
    {
      "@type": "HowToStep",
      name: "Natijani oling",
      text: `Natija darhol o'ng oynada paydo bo'ladi. Uni nusxalang yoki TXT/DOCX ko'rinishida yuklab oling (fayl hajmi ${MAX_FILE_SIZE_MB} MB gacha).`
    }
  ]
}
