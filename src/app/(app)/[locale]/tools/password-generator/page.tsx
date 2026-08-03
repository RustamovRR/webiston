/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no React equivalent; the payload is a hardcoded schema object */
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { Faq } from "@/components/shared/Faq"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { faqPageSchema, withLocale } from "@/lib/seo"
import { PasswordGenerator } from "@/modules/tools"

// Only this tool's namespace reaches the client, plus the shared
// `Common` used by ToolHeader/ToolPanel. See LocaleMessages.
const TOOL_NAMESPACE = "PasswordGeneratorPage"

const baseMetadata: Metadata = {
  title: "Password Generator - Bepul Xavfsiz Parol Yaratish",
  description:
    "Eng yaxshi bepul password generator. Xavfsiz va kuchli parollar yaratish. Turli uzunlik va belgilar bilan professional parol vositasi.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    "password generator",
    "parol generator",
    "parol yaratuvchi",
    "parol yaratish",
    "parol yasash",
    "parol qilish",
    "xavfsiz parol",
    "kuchli parol",
    "tasodifiy parol",
    "random parol",
    "parol vositasi",
    "parol tool",
    "bepul password generator",
    "onlayn parol generator",
    "parol generatori",
    "secure password",
    "strong password",
    "password maker",
    "password creator",
    "cybersecurity",
    "xavfsizlik vositasi",
    "internet xavfsizligi",
    "account security",
    "hisob xavfsizligi",

    // Ingliz tilida
    "password generator",
    "password generator online",
    "free password generator",
    "secure password generator",
    "strong password generator",
    "random password generator",
    "password maker",
    "password creator",
    "password tool",
    "generate password",
    "create password",
    "safe password generator",
    "complex password generator",
    "custom password generator",
    "bulk password generator",
    "memorable password generator",
    "pronounceable password",
    "password strength checker",
    "cybersecurity tool",
    "security password",
    "account protection",
    "online security",
    "password policy",
    "enterprise password",
    "professional password tool",

    // Rus tilida
    "генератор паролей",
    "генератор паролей онлайн",
    "создать пароль",
    "безопасный пароль",
    "сильный пароль",
    "случайный пароль",
    "надежный пароль",
    "сложный пароль",
    "бесплатный генератор паролей",
    "онлайн генератор паролей",
    "инструмент паролей",
    "кибербезопасность",
    "защита аккаунта",
    "интернет безопасность",
    "создание паролей",

    // Long-tail keywords
    "xavfsiz va kuchli parol yaratish vositasi",
    "professional secure password generator free",
    "генератор надежных паролей онлайн бесплатно",
    "webiston password tools",
    "custom length password generator online",
    "memorable secure password creator tool"
  ],
  openGraph: {
    title: "Password Generator - Bepul Xavfsiz Parol Yaratish | Webiston",
    description:
      "Eng yaxshi bepul password generator. Xavfsiz va kuchli parollar yaratish. Turli uzunlik va belgilar bilan professional parol vositasi.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston",
    url: "https://webiston.uz/tools/password-generator",
    images: [
      {
        url: "https://webiston.uz/logo.png",
        width: 1200,
        height: 630,
        alt: "Password Generator - Bepul Xavfsiz Parol Yaratish Vositasi",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    creator: "@webiston_uz",
    title: "Password Generator - Bepul Xavfsiz Parol",
    description:
      "Professional password generator. Xavfsiz va kuchli parollar yaratish. Bepul va oson!",
    images: ["https://webiston.uz/logo.png"]
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

const structuredData = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Password Generator - Bepul Xavfsiz Parol Yaratish",
  alternateName: [
    "Password Generator",
    "Parol Yaratuvchi",
    "Secure Password Tool"
  ],
  description:
    "Professional password generator. Xavfsiz va kuchli parollar yaratish uchun bepul vosita.",
  url: "https://webiston.uz/tools/password-generator",
  sameAs: [
    "https://webiston.uz/en/tools/password-generator",
    "https://webiston.uz/tools/password-generator"
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
  inLanguage: ["uz", "en"],
  keywords:
    "password generator, parol yaratuvchi, xavfsiz parol, bepul password generator"
}

/**
 * This route's questions, in both locales.
 *
 * They are returned as DATA rather than as a finished schema: the page
 * renders them AND publishes them, so one array has to feed both. This route
 * published a `FAQPage` and showed no FAQ at all until that changed.
 */
function getFaqItems(locale: string = "uz") {
  const faqData = {
    uz: {
      questions: [
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
          answer:
            "4 dan 128 belgigacha turli uzunlikdagi parollar yaratish mumkin."
        },
        {
          question: "Password generator bepulmi?",
          answer:
            "Ha, bizning password generator to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi."
        }
      ]
    },
    en: {
      questions: [
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
          answer:
            "You can generate passwords from 4 to 128 characters in various lengths."
        },
        {
          question: "Is password generator free?",
          answer:
            "Yes, our password generator is completely free. No limitations or payments required."
        }
      ]
    }
  }

  return (faqData[locale as keyof typeof faqData] || faqData.uz).questions
}

// Breadcrumb Schema (locale-based)
function generateBreadcrumbSchema(locale: string = "uz") {
  const breadcrumbData = {
    uz: {
      home: "Bosh sahifa",
      tools: "Vositalar",
      passwordGenerator: "Password Generator"
    },
    en: {
      home: "Home",
      tools: "Tools",
      passwordGenerator: "Password Generator"
    }
  }

  const current =
    breadcrumbData[locale as keyof typeof breadcrumbData] || breadcrumbData.uz
  const baseUrl =
    locale === "en" ? "https://webiston.uz/en" : "https://webiston.uz"

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: current.home,
        item: locale === "en" ? "https://webiston.uz/en" : "https://webiston.uz"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: current.tools,
        item: `${baseUrl}/tools`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: current.passwordGenerator,
        item: `${baseUrl}/tools/password-generator`
      }
    ]
  }
}

export default async function PasswordGeneratorPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) || { locale: "uz" }
  setRequestLocale(locale)

  // Generate locale-specific schemas
  const faqItems = getFaqItems(locale)
  const faqSchema = faqPageSchema(faqItems)
  const breadcrumbSchema = generateBreadcrumbSchema(locale)

  return (
    <>
      {/* Main Application Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ Schema for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <LocaleMessages namespaces={[TOOL_NAMESPACE, "Common"]}>
        <PasswordGenerator />
      </LocaleMessages>

      {/* Server-rendered sibling of the client island: the answers reach the
          HTML, which is what the schema above has always claimed. */}
      <Faq locale={locale} items={faqItems} />
    </>
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  return withLocale(baseMetadata, locale, "/tools/password-generator")
}
