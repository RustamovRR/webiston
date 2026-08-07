/**
 * Structured data for the password generator.
 *
 * Lifted out of the route file unchanged except where a claim was wrong about
 * a LOCALE, which is what this pass is for:
 *
 * - `inLanguage` said `["uz", "en"]` while the page is served at `/ru` too.
 * - `sameAs` listed the Uzbek and English URLs and omitted the Russian one.
 * - `generateBreadcrumbSchema` branched `locale === "en" ? "/en" : ""`, so the
 *   `/ru` page published a trail pointing at the **Uzbek** URLs while its own
 *   canonical said `/ru/...`. Google discards a breadcrumb whose terminal URL
 *   is not the page it is on. It now derives from `toolBreadcrumbSchema`, which
 *   builds its URLs with the same `localeUrl` the canonical comes from — the
 *   two cannot disagree.
 * - The FAQ existed in `uz` and `en` only, so `/ru` rendered and published
 *   Uzbek questions.
 *
 * ⚠️ NOT changed, and it should be: `featureList` below advertises
 * "Bulk parol yaratish" (the tool generates one password at a time — see
 * `stores/passwordStore.ts`) and "Professional interfeys", which is not a
 * feature. Removing them is a deletion, and deletions in this repo need the
 * owner's explicit approval.
 */

import { toolBreadcrumbSchema } from "@/lib/seo"

import { MAX_LENGTH, MIN_LENGTH } from "../constants"

const BASE_URL = "https://webiston.uz"

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Password Generator - Bepul Xavfsiz Parol Yaratish",
  alternateName: [
    "Password Generator",
    "Parol Yaratuvchi",
    "Secure Password Tool",
    "Генератор паролей"
  ],
  description:
    "Professional password generator. Xavfsiz va kuchli parollar yaratish uchun bepul vosita. Parol brauzeringizda yaratiladi va hech qayerga yuborilmaydi.",
  url: `${BASE_URL}/tools/password-generator`,
  sameAs: [
    `${BASE_URL}/tools/password-generator`,
    `${BASE_URL}/en/tools/password-generator`,
    `${BASE_URL}/ru/tools/password-generator`
  ],
  applicationCategory: ["SecurityApplication", "UtilityApplication"],
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
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: ["https://github.com/webiston", "https://twitter.com/webiston_uz"]
  },
  publisher: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.png`,
      width: 1120,
      height: 1120
    }
  },
  featureList: [
    "Tasodifiy parol yaratish",
    "Eslab qolinadigan parol yaratish",
    "Turli uzunlik sozlamalari",
    "Belgi turlari tanlash",
    "Parol kuchi tahlili",
    "Katta va kichik harflar",
    "Raqamlar qo'shish",
    "Maxsus belgilar",
    "Bulk parol yaratish",
    "Professional interfeys",
    "Bepul va cheksiz foydalanish",
    "Nusxa olish imkoniyati",
    "Xavfsizlik tavsiyalari",
    "Real-time strength checker"
  ],
  softwareVersion: "2.0",
  datePublished: "2024-01-01",
  dateModified: "2025-01-01",
  inLanguage: ["uz", "en", "ru"],
  keywords:
    "password generator, parol yaratuvchi, xavfsiz parol, bepul password generator"
}

/**
 * This route's questions, in all three served locales.
 *
 * Returned as DATA rather than as a finished schema: the page renders them AND
 * publishes them, so one array has to feed both. This route published a
 * `FAQPage` and showed no FAQ at all until that changed.
 *
 * The length answer interpolates `MIN_LENGTH`/`MAX_LENGTH` instead of naming
 * numbers. It used to say "4 to 128" in both locales while the slider has
 * always stopped at `MAX_LENGTH` (64, `constants/index.ts`) — a published
 * answer that was simply false. Now the slider and the answer are one source.
 */
const FAQ_ITEMS = {
  uz: [
    {
      question: "Xavfsiz parol qanday yaratiladi?",
      answer:
        "Xavfsiz parol uchun kamida 12 belgi, katta-kichik harflar, raqamlar va maxsus belgilarni ishlatish kerak. Bizning vositamiz avtomatik ravishda bunday parollar yaratadi."
    },
    {
      question: "Password generator xavfsizmi?",
      answer:
        "Ha, bizning password generator to'liq xavfsiz. Barcha parollar brauzeringizda yaratiladi va hech qayerga yuborilmaydi."
    },
    {
      question: "Qancha uzun parol yaratish mumkin?",
      answer: `${MIN_LENGTH} dan ${MAX_LENGTH} belgigacha turli uzunlikdagi parollar yaratish mumkin.`
    },
    {
      question: "Password generator bepulmi?",
      answer:
        "Ha, bizning password generator to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi."
    }
  ],
  en: [
    {
      question: "How to create a secure password?",
      answer:
        "For a secure password, use at least 12 characters, uppercase and lowercase letters, numbers and special characters. Our tool automatically creates such passwords."
    },
    {
      question: "Is password generator secure?",
      answer:
        "Yes, our password generator is completely secure. All passwords are generated in your browser and not sent anywhere."
    },
    {
      question: "How long passwords can be generated?",
      answer: `You can generate passwords from ${MIN_LENGTH} to ${MAX_LENGTH} characters in various lengths.`
    },
    {
      question: "Is password generator free?",
      answer:
        "Yes, our password generator is completely free. No limitations or payments required."
    }
  ],
  ru: [
    {
      question: "Как создать надёжный пароль?",
      answer:
        "Для надёжного пароля нужно не меньше 12 символов: заглавные и строчные буквы, цифры и специальные символы. Инструмент создаёт такие пароли автоматически."
    },
    {
      question: "Безопасен ли генератор паролей?",
      answer:
        "Да. Пароль создаётся прямо в вашем браузере криптографическим генератором случайных чисел, никуда не отправляется и нигде не сохраняется."
    },
    {
      question: "Какой длины пароль можно создать?",
      answer: `Пароли можно создавать длиной от ${MIN_LENGTH} до ${MAX_LENGTH} символов.`
    },
    {
      question: "Генератор паролей бесплатный?",
      answer:
        "Да, полностью бесплатный: без ограничений, без регистрации и без оплаты."
    }
  ]
} as const

export function getFaqItems(locale: string = "uz") {
  return FAQ_ITEMS[locale as keyof typeof FAQ_ITEMS] ?? FAQ_ITEMS.uz
}

/**
 * The tool's own name, per locale — the only part of the trail that is not
 * shared. Russian follows `ru.json`'s `ToolHeader.title`, so the breadcrumb and
 * the visible heading say the same thing.
 */
const BREADCRUMB_NAME = {
  uz: "Password Generator",
  en: "Password Generator",
  ru: "Генератор паролей"
} as const

export function generateBreadcrumbSchema(locale: string) {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz

  return toolBreadcrumbSchema(locale, "password-generator", name)
}
