import type { Metadata } from "next"
import { IpInfo } from "@/modules/tools"

export const metadata: Metadata = {
  title: "IP Ma'lumotlari - Bepul IP Address Geolocation Tool | Webiston",
  description:
    "Eng yaxshi bepul IP analyzer. IP manzil, geolokatsiya, ISP va xavfsizlik ma'lumotlarini tahlil qiling. Professional IP lookup va network analysis vositasi.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    "ip address",
    "ip ma'lumotlari",
    "ip manzil",
    "ip geolocation",
    "ip lookup",
    "ip checker",
    "ip analyzer",
    "ip tekshirish",
    "ip tahlil",
    "mening ip manzilim",
    "my ip address",
    "ip location",
    "ip joylashuv",
    "geolocation",
    "geolokatsiya",
    "isp detection",
    "isp aniqlash",
    "ip security",
    "ip xavfsizlik",
    "network analysis",
    "tarmoq tahlili",
    "bepul ip checker",
    "onlayn ip lookup",
    "ip vositasi",
    "ip tool",

    // Ingliz tilida
    "ip address lookup",
    "ip address checker",
    "ip address analyzer",
    "ip geolocation tool",
    "what is my ip",
    "my ip address",
    "ip location finder",
    "ip address tracker",
    "ip information",
    "ip details",
    "geolocation lookup",
    "ip to location",
    "isp lookup",
    "internet provider lookup",
    "ip security check",
    "ip threat analysis",
    "network information",
    "ip address info",
    "free ip lookup",
    "online ip checker",
    "professional ip tool",
    "bulk ip lookup",
    "ip range analyzer",
    "ip reputation check",
    "vpn detection",
    "proxy detection",

    // Rus tilida
    "ip адрес",
    "информация об ip",
    "геолокация ip",
    "проверка ip адреса",
    "мой ip адрес",
    "местоположение ip",
    "анализ ip адреса",
    "поиск по ip",
    "определение провайдера",
    "безопасность ip",
    "сетевой анализ",
    "бесплатная проверка ip",
    "онлайн ip анализатор",
    "профессиональный ip инструмент",

    // Long-tail keywords
    "ip manzil va geolokatsiya ma'lumotlari tahlili",
    "professional ip address geolocation analyzer free",
    "анализатор ip адреса с геолокацией онлайн бесплатно",
    "webiston ip tools",
    "network security ip analysis tool",
    "isp provider detection ip lookup online"
  ],
  openGraph: {
    title: "IP Ma'lumotlari - Bepul IP Address Geolocation Tool | Webiston",
    description:
      "Eng yaxshi bepul IP analyzer. IP manzil, geolokatsiya, ISP va xavfsizlik ma'lumotlarini tahlil qiling. Professional IP lookup va network analysis vositasi.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston",
    url: "https://webiston.uz/tools/ip-info",
    images: [
      {
        url: "https://webiston.uz/logo.png",
        width: 1200,
        height: 630,
        alt: "IP Ma'lumotlari - Bepul IP Address Geolocation Tool",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    creator: "@webiston_uz",
    title: "IP Ma'lumotlari - Bepul IP Analyzer",
    description:
      "Professional IP analyzer. IP manzil, geolokatsiya va ISP ma'lumotlarini tahlil qiling. Bepul!",
    images: ["https://webiston.uz/logo.png"]
  },
  alternates: {
    canonical: "https://webiston.uz/tools/ip-info",
    languages: {
      uz: "https://webiston.uz/tools/ip-info",
      en: "https://webiston.uz/en/tools/ip-info",
      "x-default": "https://webiston.uz/tools/ip-info"
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
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "IP Ma'lumotlari - Bepul IP Address Geolocation Tool",
  alternateName: ["IP Analyzer", "IP Lookup Tool", "Geolocation Tool"],
  description:
    "Professional IP analyzer. IP manzil, geolokatsiya, ISP va xavfsizlik ma'lumotlarini tahlil qilish uchun bepul vosita.",
  url: "https://webiston.uz/tools/ip-info",
  sameAs: [
    "https://webiston.uz/en/tools/ip-info",
    "https://webiston.uz/tools/ip-info"
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
      width: 512,
      height: 512
    }
  },
  featureList: [
    "IP manzil aniqlash",
    "Geolokatsiya ma'lumotlari",
    "ISP provider aniqlash",
    "Mamlakat va shahar aniqlash",
    "Timezone ma'lumotlari",
    "IP xavfsizlik tahlili",
    "VPN/Proxy aniqlash",
    "Network ma'lumotlari",
    "IP reputation check",
    "Bulk IP lookup",
    "IPv4 va IPv6 qo'llab-quvvatlash",
    "Real-time analysis",
    "Professional interfeys",
    "Bepul va cheksiz foydalanish",
    "Aniq geolokatsiya",
    "ISP contact ma'lumotlari",
    "Threat intelligence",
    "Network security analysis"
  ],
  softwareVersion: "2.0",
  datePublished: "2024-01-01",
  dateModified: "2025-01-01",
  inLanguage: ["uz", "en"],
  keywords: "ip ma'lumotlari, ip geolocation, ip analyzer, bepul ip checker",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2200",
    bestRating: "5",
    worstRating: "1"
  },
  review: [
    {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: "Foydalanuvchi"
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5"
      },
      reviewBody:
        "IP manzil va geolokatsiya ma'lumotlarini olish uchun juda foydali vosita. Aniq va tez ishlaydi!"
    }
  ]
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = "uz") {
  const faqData = {
    uz: {
      questions: [
        {
          question: "IP ma'lumotlari tool nima va nima uchun kerak?",
          answer:
            "IP ma'lumotlari tool - bu IP manzil, geolokatsiya, ISP va xavfsizlik ma'lumotlarini tahlil qilish vositasi. Network xavfsizligi, geolokatsiya aniqlash va texnik tahlil uchun foydali."
        },
        {
          question: "Qanday ma'lumotlarni ko'rish mumkin?",
          answer:
            "IP manzil, mamlakat, shahar, ISP provider, timezone, VPN/Proxy aniqlash, network ma'lumotlari va xavfsizlik tahlilini ko'rish mumkin."
        },
        {
          question: "IP analyzer xavfsizmi?",
          answer:
            "Ha, bizning IP analyzer to'liq xavfsiz. Barcha ma'lumotlar ommaviy API'lar orqali olinadi va shaxsiy ma'lumotlar saqlanmaydi."
        },
        {
          question: "IP analyzer bepulmi?",
          answer:
            "Ha, bizning IP analyzer to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi."
        }
      ]
    },
    en: {
      questions: [
        {
          question: "What is IP info tool and why is it needed?",
          answer:
            "IP info tool analyzes IP address, geolocation, ISP and security information. Useful for network security, geolocation detection and technical analysis."
        },
        {
          question: "What information can I see?",
          answer:
            "You can see IP address, country, city, ISP provider, timezone, VPN/Proxy detection, network information and security analysis."
        },
        {
          question: "Is IP analyzer secure?",
          answer:
            "Yes, our IP analyzer is completely secure. All information is obtained through public APIs and personal data is not stored."
        },
        {
          question: "Is IP analyzer free?",
          answer:
            "Yes, our IP analyzer is completely free. No limitations or payments required."
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
      ipInfo: "IP Ma'lumotlari"
    },
    en: {
      home: "Home",
      tools: "Tools",
      ipInfo: "IP Information"
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
        name: current.ipInfo,
        item: `${baseUrl}/tools/ip-info`
      }
    ]
  }
}

export default async function IpInfoPage({
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

      <IpInfo />
    </>
  )
}
