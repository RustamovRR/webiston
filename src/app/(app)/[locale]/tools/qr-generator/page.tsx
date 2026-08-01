/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no React equivalent; the payload is a hardcoded schema object */
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
import { QrGenerator } from "@/modules/tools"

// Locale-based metadata generation

// Only this tool's namespace reaches the client, plus the shared
// `Common` used by ToolHeader/ToolPanel. See LocaleMessages.
const TOOL_NAMESPACE = "QrGeneratorPage"

const baseMetadata: Metadata = {
  title: "QR Kod Yaratish - Bepul QR Kod Generator Onlayn",
  description:
    "QR kod yaratish uchun eng yaxshi bepul vosita. URL, matn, kontakt, WiFi, SMS uchun QR kodlar yarating. Tez, oson va professional QR generator.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    "qr kod yaratish",
    "qr kod generator",
    "qr kod generatori",
    "qr kod yasash",
    "qr kod qilish",
    "qr kod online",
    "bepul qr kod",
    "qr kod bepul",
    "qr kod vositasi",
    "qr kod tool",
    "qr kod yaratuvchi",
    "qr kod maker",
    "qr kod creator",
    "onlayn qr kod",
    "qr kod scanner",
    "qr kod reader",
    "qr kod dekoder",
    "qr kod encoder",
    "tez qr kod",
    "oson qr kod",
    "professional qr kod",
    "o'zbek qr kod",
    "uzbek qr kod",

    // Ingliz tilida
    "qr code generator",
    "qr code generator online",
    "free qr code generator",
    "qr code maker",
    "qr code creator",
    "online qr generator",
    "qr generator free",
    "create qr code",
    "generate qr code",
    "qr code builder",
    "qr code tool",
    "custom qr code",
    "bulk qr code generator",
    "batch qr code",
    "professional qr code",
    "business qr code",
    "marketing qr code",
    "dynamic qr code",
    "static qr code",
    "high quality qr code",
    "vector qr code",
    "svg qr code",
    "png qr code",
    "jpg qr code",

    // Rus tilida
    "qr код генератор",
    "генератор qr кода",
    "создать qr код",
    "qr код онлайн",
    "бесплатный qr код",
    "qr код бесплатно",
    "генератор qr кодов",
    "создание qr кода",
    "qr код maker",
    "qr код creator",
    "qr код инструмент",
    "qr код сервис",
    "быстрый qr код",
    "простой qr код",
    "профессиональный qr код",
    "qr код для бизнеса",
    "qr код для сайта",
    "qr код для wifi",
    "qr код для контактов",
    "qr код для sms",
    "qr код высокого качества",

    // Specific use cases
    "url qr kod",
    "website qr kod",
    "link qr kod",
    "matn qr kod",
    "text qr kod",
    "wifi qr kod",
    "wifi password qr kod",
    "kontakt qr kod",
    "contact qr kod",
    "vcard qr kod",
    "sms qr kod",
    "email qr kod",
    "telefon qr kod",
    "phone qr kod",
    "location qr kod",
    "map qr kod",
    "event qr kod",
    "calendar qr kod",

    // Long-tail keywords
    "qr kod yaratish va ulardan foydalanish",
    "professional qr kod generator free online",
    "создать qr код бесплатно онлайн высокого качества",
    "webiston qr tools",
    "o'zbek qr generator professional",
    "uzbek qr code generator online free",
    "bulk qr code generator for business",
    "custom qr code with logo generator"
  ],
  openGraph: {
    title: "QR Kod Yaratish - Bepul QR Kod Generator | Webiston",
    description:
      "Eng yaxshi bepul QR kod generator. URL, matn, kontakt, WiFi uchun professional QR kodlar yarating. Tez, oson va xavfsiz.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston",
    url: "https://webiston.uz/tools/qr-generator",
    images: [
      {
        url: "https://webiston.uz/logo.png", // Using existing logo for now
        width: 1200,
        height: 630,
        alt: "QR Kod Generator - Bepul QR Kod Yaratish Vositasi",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    creator: "@webiston_uz",
    title: "QR Kod Yaratish - Bepul QR Generator",
    description:
      "Professional QR kod generator. URL, matn, kontakt, WiFi uchun QR kodlar yarating. Bepul va tez!",
    images: ["https://webiston.uz/logo.png"] // Using existing logo for now
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
  name: "QR Kod Generator - Bepul QR Kod Yaratish",
  alternateName: ["QR Code Generator", "QR Kod Yaratish", "QR Generator"],
  description:
    "Professional QR kod yaratish vositasi. URL, matn, kontakt, WiFi, SMS uchun bepul QR kodlar yarating.",
  url: "https://webiston.uz/tools/qr-generator",
  sameAs: [
    "https://webiston.uz/en/tools/qr-generator",
    "https://webiston.uz/tools/qr-generator"
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
    "URL, matn, kontakt, WiFi va SMS uchun QR kod yaratish",
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
  inLanguage: ["uz", "en"],
  keywords: "qr kod yaratish, qr generator, bepul qr kod, online qr generator"
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = "uz") {
  const faqData = {
    uz: {
      questions: [
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
      ]
    },
    en: {
      questions: [
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
      ]
    }
  }

  const currentFAQ = faqData[locale as keyof typeof faqData] || faqData.uz

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: currentFAQ.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  }
}

// Breadcrumb Schema (locale-based)
function generateBreadcrumbSchema(locale: string = "uz") {
  const breadcrumbData = {
    uz: {
      home: "Bosh sahifa",
      tools: "Vositalar",
      qrGenerator: "QR Kod Generator"
    },
    en: {
      home: "Home",
      tools: "Tools",
      qrGenerator: "QR Code Generator"
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
        name: current.qrGenerator,
        item: `${baseUrl}/tools/qr-generator`
      }
    ]
  }
}

export default async function QrGeneratorPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) || { locale: "uz" }
  setRequestLocale(locale)

  // Generate locale-specific schemas
  const faqSchema = generateFAQSchema(locale)
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
        <QrGenerator />
      </LocaleMessages>
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
  return withLocale(baseMetadata, locale, "/tools/qr-generator")
}
