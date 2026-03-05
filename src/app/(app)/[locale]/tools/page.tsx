import type { Metadata } from "next"
import { ToolsMainPage } from "@/modules/tools"

export const metadata: Metadata = {
  title: "Bepul Onlayn Vositalar - Professional Developer Tools | Webiston",
  description:
    "Eng yaxshi bepul onlayn vositalar to'plami. QR generator, JSON formatter, Base64 converter, URL encoder va boshqa professional developer tools.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    "bepul vositalar",
    "onlayn tools",
    "developer tools",
    "dasturchi vositalari",
    "web tools",
    "veb vositalar",
    "utility tools",
    "foydali vositalar",
    "programming tools",
    "dasturlash vositalari",
    "qr generator",
    "json formatter",
    "base64 converter",
    "url encoder",
    "password generator",
    "parol yaratish",
    "latin kirill",
    "jwt decoder",
    "color converter",
    "rang konverter",
    "webiston tools",
    "professional tools",

    // Ingliz tilida
    "free online tools",
    "developer tools",
    "web development tools",
    "programming utilities",
    "coding tools",
    "online utilities",
    "free web tools",
    "developer utilities",
    "programming resources",
    "web developer tools",
    "online developer tools",
    "free coding tools",
    "utility applications",
    "development resources",
    "web utilities",

    // Rus tilida
    "бесплатные онлайн инструменты",
    "инструменты разработчика",
    "веб инструменты",
    "утилиты программирования",
    "инструменты кодирования",
    "онлайн утилиты",
    "бесплатные веб инструменты",
    "ресурсы разработчика",
    "программные утилиты",

    // Long-tail keywords
    "bepul onlayn dasturchi vositalari",
    "professional web development tools free",
    "бесплатные профессиональные инструменты разработчика",
    "webiston developer tools collection",
    "uzbek developer tools"
  ],
  openGraph: {
    title: "Bepul Onlayn Vositalar - Professional Developer Tools | Webiston",
    description:
      "Eng yaxshi bepul onlayn vositalar to'plami. QR generator, JSON formatter, Base64 converter va boshqa professional tools.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston",
    url: "https://webiston.uz/tools",
    images: [
      {
        url: "https://webiston.uz/logo.png",
        width: 1200,
        height: 630,
        alt: "Webiston - Bepul Onlayn Vositalar To'plami",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    creator: "@webiston_uz",
    title: "Bepul Onlayn Vositalar - Professional Tools",
    description:
      "Professional developer tools to'plami. QR generator, JSON formatter va boshqa foydali vositalar. Bepul!",
    images: ["https://webiston.uz/logo.png"]
  },
  alternates: {
    canonical: "https://webiston.uz/tools",
    languages: {
      uz: "https://webiston.uz/tools",
      en: "https://webiston.uz/en/tools",
      "x-default": "https://webiston.uz/tools"
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

const structuredData = {
  "@context": "https://schema.org",
  "@type": ["WebSite", "SoftwareApplication"],
  name: "Webiston - Bepul Onlayn Vositalar",
  alternateName: [
    "Webiston Tools",
    "Developer Tools Collection",
    "Free Online Tools"
  ],
  description:
    "Professional developer tools to'plami. QR generator, JSON formatter, Base64 converter va boshqa bepul vositalar.",
  url: "https://webiston.uz/tools",
  sameAs: ["https://webiston.uz/en/tools", "https://webiston.uz/tools"],
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
      width: 512,
      height: 512
    }
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Developer Tools Collection",
    description: "Professional bepul onlayn vositalar to'plami",
    numberOfItems: 15,
    itemListElement: [
      {
        "@type": "SoftwareApplication",
        position: 1,
        name: "QR Generator",
        url: "https://webiston.uz/tools/qr-generator",
        applicationCategory: "UtilityApplication"
      },
      {
        "@type": "SoftwareApplication",
        position: 2,
        name: "Latin-Cyrillic Converter",
        url: "https://webiston.uz/tools/latin-cyrillic",
        applicationCategory: "UtilityApplication"
      },
      {
        "@type": "SoftwareApplication",
        position: 3,
        name: "JSON Formatter",
        url: "https://webiston.uz/tools/json-formatter",
        applicationCategory: "DeveloperApplication"
      },
      {
        "@type": "SoftwareApplication",
        position: 4,
        name: "Base64 Converter",
        url: "https://webiston.uz/tools/base64-converter",
        applicationCategory: "DeveloperApplication"
      },
      {
        "@type": "SoftwareApplication",
        position: 5,
        name: "URL Encoder",
        url: "https://webiston.uz/tools/url-encoder",
        applicationCategory: "DeveloperApplication"
      },
      {
        "@type": "SoftwareApplication",
        position: 6,
        name: "JWT Decoder",
        url: "https://webiston.uz/tools/jwt-decoder",
        applicationCategory: "SecurityApplication"
      }
    ]
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://webiston.uz/tools?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  softwareVersion: "2.0",
  datePublished: "2024-01-01",
  dateModified: "2025-01-01",
  inLanguage: ["uz", "en"],
  keywords: "bepul vositalar, developer tools, onlayn tools, webiston",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
    bestRating: "5",
    worstRating: "1"
  }
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = "uz") {
  const faqData = {
    uz: {
      questions: [
        {
          question: "Webiston vositalari bepulmi?",
          answer:
            "Ha, Webiston'dagi barcha vositalar to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi."
        },
        {
          question: "Qanday vositalar mavjud?",
          answer:
            "QR generator, JSON formatter, Base64 converter, URL encoder, JWT decoder, Password generator va boshqa ko'plab foydali vositalar mavjud."
        },
        {
          question: "Vositalar xavfsizmi?",
          answer:
            "Ha, barcha vositalar to'liq xavfsiz. Ma'lumotlar brauzeringizda qayta ishlanadi va hech qayerga yuborilmaydi."
        },
        {
          question: "Mobil qurilmalarda ishlaydimi?",
          answer:
            "Ha, barcha vositalar mobil qurilmalarda ham to'liq ishlaydi va responsive dizaynga ega."
        }
      ]
    },
    en: {
      questions: [
        {
          question: "Are Webiston tools free?",
          answer:
            "Yes, all tools on Webiston are completely free. No limitations or payments required."
        },
        {
          question: "What tools are available?",
          answer:
            "QR generator, JSON formatter, Base64 converter, URL encoder, JWT decoder, Password generator and many other useful tools are available."
        },
        {
          question: "Are the tools secure?",
          answer:
            "Yes, all tools are completely secure. Data is processed in your browser and not sent anywhere."
        },
        {
          question: "Do they work on mobile devices?",
          answer:
            "Yes, all tools work perfectly on mobile devices and have responsive design."
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
      tools: "Vositalar"
    },
    en: {
      home: "Home",
      tools: "Tools"
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
      }
    ]
  }
}

export default async function ToolsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) || { locale: "uz" }

  // Generate locale-specific schemas
  const faqSchema = generateFAQSchema(locale)
  const breadcrumbSchema = generateBreadcrumbSchema(locale)

  return (
    <>
      {/* Main Website Schema */}
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

      <ToolsMainPage />
    </>
  )
}
