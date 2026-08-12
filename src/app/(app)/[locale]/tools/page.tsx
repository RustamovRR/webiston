/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no React equivalent; the payload is a hardcoded schema object */
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { TOOLS_LIST } from "@/constants"
import { withLocale } from "@/lib/seo"
import { ToolsMainPage } from "@/modules/tools"

import { generateBreadcrumbSchema, getToolsIndexMetadata } from "./seo"

/**
 * English names for the schema, which is locale-independent by design —
 * `schema.org` entries are read by crawlers, not by visitors, and the URL is
 * the English slug either way.
 */
const TOOL_SCHEMA_NAMES: Record<string, string> = {
  latinCyrillic: "Latin-Cyrillic Converter",
  qrGenerator: "QR Code Generator",
  codeSnapshot: "Code to Image",
  jsonFormatter: "JSON Formatter",
  passwordGenerator: "Password Generator",
  colorConverter: "Color Converter",
  base64Converter: "Base64 Converter",
  jwtDecoder: "JWT Decoder",
  urlEncoder: "URL Encoder",
  hashGenerator: "Hash Generator",
  uuidGenerator: "UUID Generator",
  ogMetaGenerator: "Open Graph Meta Generator",
  loremIpsum: "Lorem Ipsum Generator",
  deviceInfo: "Device Info",
  screenResolution: "Screen Resolution",
  ipInfo: "IP Info",
  cameraRecorder: "Camera Recorder",
  microphoneTest: "Microphone Test"
}

// `ToolsMainPage` is a CLIENT component and calls four namespaces —
// `Tools`, `ToolsPage.Main`, `ToolCategories`, `Filters`. Scoping the layout
// provider to the chrome broke this page until they were named here: it still
// returned HTTP 200 and still rendered, because next-intl falls back to the key
// path instead of throwing. Only the browser console showed it.
const INDEX_NAMESPACES = [
  "Tools",
  "ToolsPage",
  "ToolCategories",
  "Filters",
  "Common"
] as const

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
      width: 1120,
      height: 1120
    }
  },
  // Derived from the list the page actually renders. Hand-written, it had
  // drifted into three separate untruths: `numberOfItems: 15` against 17
  // tools, only 6 of them listed, and an order that contradicted the visible
  // one (QR first here, latin-cyrillic first on screen). Structured data that
  // disagrees with the page is the kind of thing Google discounts the whole
  // block for.
  mainEntity: {
    "@type": "ItemList",
    name: "Developer Tools Collection",
    description: "Professional bepul onlayn vositalar to'plami",
    numberOfItems: TOOLS_LIST.length,
    itemListElement: TOOLS_LIST.map((tool, index) => ({
      "@type": "SoftwareApplication",
      position: index + 1,
      name: TOOL_SCHEMA_NAMES[tool.tKey] ?? tool.tKey,
      url: `https://webiston.uz${tool.href}`,
      applicationCategory:
        tool.audience === "developer"
          ? "DeveloperApplication"
          : "UtilityApplication"
    }))
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://webiston.uz/tools?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  softwareVersion: "2.0",
  datePublished: "2024-01-01",
  dateModified: "2025-01-01",
  inLanguage: ["uz", "en", "ru"],
  keywords: "bepul vositalar, developer tools, onlayn tools, webiston"
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

export default async function ToolsPage({
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

      <LocaleMessages locale={locale} namespaces={INDEX_NAMESPACES}>
        <ToolsMainPage />
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
  return withLocale(getToolsIndexMetadata(locale), locale, "/tools")
}
