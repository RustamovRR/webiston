/**
 * Structured data for the QR generator.
 *
 * Two rules, both of which the inline version in the route file broke.
 *
 * EVERY CLAIM MUST BE TRUE. The description and the first `featureList` entry
 * advertised QR codes "for URL, text, contact, WiFi and SMS" as though each had
 * its own builder. The tool has exactly two input modes — a free text box and a
 * WiFi form (`QrGenerator.tsx`, `stores/qrDraftStore.ts`) — and the contact/SMS
 * presets those strings describe were removed with the old five-tab strip. What
 * survives is payload DETECTION: paste a `BEGIN:VCARD` or `sms:` string and the
 * badge names it (`utils/qr-input.ts`). That is what the two strings say now.
 *
 * THE TRAIL MUST MATCH THE CANONICAL. `generateBreadcrumbSchema` branched
 * `locale === "en" ? "/en" : ""`, so `/ru/tools/qr-generator` published a
 * breadcrumb pointing at the Uzbek URLs while its own canonical said `/ru`.
 * `toolBreadcrumbSchema` derives both from `localeUrl`, so they cannot disagree.
 */

import { toolBreadcrumbSchema } from "@/lib/seo"

const BASE_URL = "https://webiston.uz"

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "QR Kod Generator - Bepul QR Kod Yaratish",
  alternateName: ["QR Code Generator", "QR Kod Yaratish", "QR Generator"],
  description:
    "Havola, matn va WiFi tarmog'i uchun bepul QR kod yaratish vositasi. Shakl, rang, logotip va ramka sozlanadi; kod brauzerda chiziladi.",
  url: `${BASE_URL}/tools/qr-generator`,
  sameAs: [
    `${BASE_URL}/en/tools/qr-generator`,
    `${BASE_URL}/ru/tools/qr-generator`,
    `${BASE_URL}/tools/qr-generator`
  ],
  applicationCategory: ["UtilityApplication", "ProductivityApplication"],
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
    sameAs: ["https://github.com/webiston", "https://x.com/webiston_uz"]
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
  // Only features the page actually has. This list used to advertise the
  // removed size/error-level controls and a JPG download that never existed.
  featureList: [
    "Havola, matn va WiFi tarmog'i uchun QR kod yaratish",
    "Qo'yilgan matn turini aniqlash: havola, e-pochta, telefon, SMS, vCard, joylashuv",
    "16 xil nuqta shakli va 8 tayyor uslub",
    "Logotip joylashtirish",
    "Gradient va rang tanlash, kontrast tekshiruvi bilan",
    "Ramka va yorliq qo'shish",
    "SVG, PNG, WebP formatlarida yuklab olish",
    "Bepul va cheksiz foydalanish"
  ],
  // screenshot: 'https://webiston.uz/images/tools/qr-generator-screenshot.png', // TODO: Add screenshot
  softwareVersion: "2.0",
  datePublished: "2024-01-01",
  dateModified: "2025-01-01",
  inLanguage: ["uz", "en", "ru"],
  keywords: "qr kod yaratish, qr generator, bepul qr kod, online qr generator"
}

/**
 * This route's questions, in all three locales.
 *
 * They are returned as DATA rather than as a finished schema: the page renders
 * them AND publishes them, so one array has to feed both. This route published
 * a `FAQPage` and showed no FAQ at all until that changed.
 *
 * The `ru` block is new. Without it `/ru/tools/qr-generator` fell through to
 * `faqData.uz` and showed a Russian-speaking visitor four Uzbek answers — the
 * same defect as the Uzbek `<title>`, one section further down the page.
 */
const FAQ_ITEMS = {
  uz: [
    {
      question: "QR kod qanday yaratiladi?",
      answer:
        "QR kod yaratish uchun bizning bepul vositamizdan foydalaning. URL, matn yoki kontakt ma'lumotlarini kiriting va QR kod avtomatik yaratiladi."
    },
    {
      question: "QR kod bepulmi?",
      answer:
        "Ha, bizning QR kod generator to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi."
    },
    {
      question: "QR kod qanday formatda yuklab olish mumkin?",
      answer:
        "QR kodlarni SVG, PNG va WebP formatlarida yuklab olish mumkin. SVG vektor format bo'lgani uchun istalgan o'lchamda sifatini yo'qotmaydi."
    },
    {
      question: "WiFi QR kod qanday yaratiladi?",
      answer:
        "Kirish turidan WiFi'ni tanlang, tarmoq nomi (SSID) va parolni kiriting — QR kod avtomatik yaratiladi. Skaner qilgan telefon tarmoqqa o'zi ulanadi."
    }
  ],
  en: [
    {
      question: "How to create a QR code?",
      answer:
        "Use our free QR code generator. Enter URL, text or contact information and QR code will be generated automatically."
    },
    {
      question: "Is QR code generator free?",
      answer:
        "Yes, our QR code generator is completely free. No limitations or payments required."
    },
    {
      question: "What formats can I download QR code?",
      answer:
        "You can download QR codes as SVG, PNG and WebP. SVG is a vector format, so it stays sharp at any print size."
    },
    {
      question: "How to create WiFi QR code?",
      answer:
        "Choose WiFi as the input type, enter the network name (SSID) and password — the QR code is generated automatically. A phone that scans it joins the network by itself."
    }
  ],
  ru: [
    {
      question: "Как создать QR-код?",
      answer:
        "Воспользуйтесь нашим бесплатным генератором: введите ссылку, текст или контактные данные — QR-код построится сам, нажимать ничего не нужно."
    },
    {
      question: "Генератор QR-кодов бесплатный?",
      answer:
        "Да, наш генератор QR-кодов полностью бесплатный. Ни ограничений, ни оплаты, ни регистрации."
    },
    {
      question: "В каких форматах можно скачать QR-код?",
      answer:
        "QR-код можно скачать в SVG, PNG и WebP. SVG — векторный формат, поэтому код остаётся чётким при любом размере печати."
    },
    {
      question: "Как создать QR-код для WiFi?",
      answer:
        "Выберите тип ввода «WiFi», укажите имя сети (SSID) и пароль — QR-код построится автоматически. Телефон, отсканировавший его, подключится к сети сам."
    }
  ]
} as const

export function getFaqItems(locale: string = "uz") {
  return FAQ_ITEMS[locale as keyof typeof FAQ_ITEMS] ?? FAQ_ITEMS.uz
}

/**
 * The tool's own name, per locale — the only part of the trail that is not
 * shared. Taken from each locale's `ToolHeader.title` so the crumb reads the
 * same as the heading the visitor is looking at.
 */
const BREADCRUMB_NAME = {
  uz: "QR Kod Generator",
  en: "QR Code Generator",
  ru: "Генератор QR-кодов"
} as const

export function generateBreadcrumbSchema(locale: string = "uz") {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz
  return toolBreadcrumbSchema(locale, "qr-generator", name)
}
