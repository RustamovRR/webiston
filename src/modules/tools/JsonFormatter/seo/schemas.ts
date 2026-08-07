/**
 * Structured data for the JSON formatter.
 *
 * Moved here verbatim from the route file, with three corrections:
 *
 * 1. `inLanguage` said `["uz", "en"]` on a site that serves `uz`, `en` and
 *    `ru` (`src/i18n/locales.ts`), and `sameAs` listed only the Uzbek and
 *    English URLs. Both now name all three.
 * 2. The breadcrumb was hand-built with `locale === "en" ? "/en" : ""`, so
 *    /ru/tools/json-formatter published a trail pointing at the UZBEK URLs
 *    while its own canonical said /ru. Google discards a breadcrumb whose
 *    terminal URL is not the page it is on. It goes through
 *    `toolBreadcrumbSchema` now — the same `localeUrl` the canonical comes
 *    from, so the two cannot disagree.
 * 3. EVERY CLAIM MUST BE TRUE. The blob advertised "Xato ko'rsatish va
 *    tuzatish" — the tool locates an error, it has never repaired one — and
 *    described itself as a tool for "tuzatish" in the same breath. Both now
 *    say what `utils/json.ts` does: it reports the line and column where
 *    `JSON.parse` stopped. Capabilities the code genuinely has and the list
 *    never mentioned (tree view, file upload, download, indent width, the
 *    key/depth readout) are added.
 *
 * The FAQ lives here too, as DATA rather than as a finished schema: the page
 * renders the array AND publishes it, so one source has to feed both. This
 * route published a `FAQPage` and showed no FAQ at all until that changed.
 */

import type { FaqItem } from "@/components/shared/Faq"
import { toolBreadcrumbSchema } from "@/lib/seo"

const BASE_URL = "https://webiston.uz"

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "JSON Formatter - Bepul JSON Formatlash va Tekshirish",
  alternateName: ["JSON Beautifier", "JSON Validator", "JSON Parser"],
  description:
    "JSON ma'lumotlarini formatlash, tekshirish va siqish uchun bepul vosita. Xato bo'lsa uning qaysi qator va belgida ekanini ko'rsatadi; barcha ish brauzerda bajariladi.",
  url: `${BASE_URL}/tools/json-formatter`,
  sameAs: [
    "https://webiston.uz/tools/json-formatter",
    "https://webiston.uz/en/tools/json-formatter",
    "https://webiston.uz/ru/tools/json-formatter"
  ],
  applicationCategory: ["UtilityApplication", "DeveloperApplication"],
  operatingSystem: ["Windows", "macOS", "Linux", "Android", "iOS"],
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  permissions: "browser",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: "2024-01-01"
  },
  author: {
    "@type": "Organization",
    name: "Webiston",
    url: "https://webiston.uz",
    logo: "https://webiston.uz/logo.png",
    sameAs: ["https://github.com/webiston", "https://twitter.com/webiston_uz"]
  },
  publisher: {
    "@type": "Organization",
    name: "Webiston",
    url: "https://webiston.uz",
    logo: {
      "@type": "ImageObject",
      url: "https://webiston.uz/logo.png",
      width: 1120,
      height: 1120
    }
  },
  // Only capabilities the code actually has.
  featureList: [
    "JSON formatlash va beautify",
    "JSON validatsiya va xato aniqlash",
    "JSON minify va compress",
    "Sintaksis highlighting",
    "Xato o'rnini qator va belgi bilan ko'rsatish",
    "Katta JSON fayllar bilan ishlash",
    "Nusxa olish imkoniyati",
    "Professional interfeys",
    "Bepul va cheksiz foydalanish",
    "Real-time formatting",
    "Yig'iladigan daraxt ko'rinishi",
    "Abzas kengligini tanlash (2, 4, 8 yoki tab)",
    ".json va .txt fayl yuklash (10 MB gacha)",
    "Natijani .json fayl sifatida yuklab olish",
    "Kalitlar soni va ichma-ichlik chuqurligi hisobi"
  ],
  softwareVersion: "2.0",
  datePublished: "2024-01-01",
  dateModified: "2025-01-01",
  inLanguage: ["uz", "en", "ru"],
  keywords:
    "json formatter, json formatlash, json validator, bepul json formatter"
}

/**
 * This route's questions, in all three served locales.
 *
 * Returned as data, not as a finished schema — the page renders them AND
 * publishes them from the same array. /ru used to fall through to the Uzbek
 * branch here, so a Russian visitor got Uzbek questions in the visible
 * section and in the structured data.
 */
const FAQ: Record<string, readonly FaqItem[]> = {
  uz: [
    {
      question: "JSON formatter qanday ishlaydi?",
      answer:
        "JSON'ingizni chap paneldagi maydonga joylashtiring — formatlangan natija o'ng panelda darhol paydo bo'ladi. Alohida tugma bosish shart emas, barcha ish brauzeringizda bajariladi."
    },
    {
      question: "JSON formatter bepulmi?",
      answer:
        "Ha, bizning JSON formatter to'liq bepul. Ro'yxatdan o'tish yoki to'lov talab qilinmaydi."
    },
    {
      question: "Qanday JSON xatolarini aniqlash mumkin?",
      answer:
        "JSON formatter sintaksis xatolarini — yetishmayotgan vergul yoki ikki nuqta, yopilmagan qavs va tirnoq, tirnoqqa olinmagan xususiyat nomini — aniqlaydi va xato qaysi qator va belgida ekanini ko'rsatadi."
    },
    {
      question: "Katta JSON fayllar bilan ishlash mumkinmi?",
      answer:
        "Ha, 10 MB gacha bo'lgan .json va .txt fayllarni yuklash mumkin. 300 KB dan katta natijada sintaksis ranglari o'chadi, matn esa to'liq ko'rinadi."
    }
  ],
  en: [
    {
      question: "How does JSON formatter work?",
      answer:
        "Paste your JSON into the left panel and the formatted result appears on the right straight away. There is no button to press, and the parsing happens in your browser."
    },
    {
      question: "Is JSON formatter free?",
      answer:
        "Yes, our JSON formatter is completely free. No signup and no payment is required."
    },
    {
      question: "What JSON errors can be detected?",
      answer:
        "It detects syntax errors — a missing comma or colon, an unclosed bracket or quote, an unquoted property name — and shows the line and column where parsing stopped."
    },
    {
      question: "Can it handle large JSON files?",
      answer:
        "Yes. You can upload .json or .txt files up to 10 MB. Above 300 KB the output drops syntax colouring, but the full text is still shown."
    }
  ],
  ru: [
    {
      question: "Как работает форматтер JSON?",
      answer:
        "Вставьте JSON в левую панель — отформатированный результат появится справа сразу же. Нажимать кнопку не нужно, а разбор выполняется в вашем браузере."
    },
    {
      question: "Форматтер JSON бесплатный?",
      answer: "Да, полностью бесплатный. Регистрация и оплата не требуются."
    },
    {
      question: "Какие ошибки JSON он находит?",
      answer:
        "Синтаксические: пропущенную запятую или двоеточие, незакрытую скобку или кавычку, имя свойства без кавычек. Он показывает строку и столбец, на которых разбор остановился."
    },
    {
      question: "Можно ли работать с большими файлами JSON?",
      answer:
        "Да. Можно загрузить файлы .json и .txt размером до 10 МБ. Свыше 300 КБ подсветка синтаксиса отключается, но текст показывается полностью."
    }
  ]
}

export function getFaqItems(locale: string = "uz"): readonly FaqItem[] {
  return FAQ[locale] ?? FAQ.uz
}

/**
 * The tool's own name, per locale — the only part of the trail that is not
 * shared. The Uzbek and English pages both call it "JSON Formatter"; the
 * Russian messages bundle calls it "Форматтер JSON", so the trail does too.
 */
const BREADCRUMB_NAME = {
  uz: "JSON Formatter",
  en: "JSON Formatter",
  ru: "Форматтер JSON"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz
  return toolBreadcrumbSchema(locale, "json-formatter", name)
}
