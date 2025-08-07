import type { Metadata } from 'next'
import { UuidGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'UUID Generator - Bepul Noyob Identifikator Yaratuvchi | Webiston',
  description:
    'Eng yaxshi bepul UUID generator. UUID v4, v1, NIL formatlar. Noyob identifikatorlar yaratish, database, API va dasturlash uchun.',
  keywords: [
    // O'zbek tilida eng ko'p qidirilagan
    'uuid generator',
    'uuid yaratuvchi',
    'uuid yaratish',
    'uuid yasash',
    'uuid qilish',
    'noyob identifikator',
    'unique identifier',
    'guid generator',
    'guid yaratuvchi',
    'uuid v4',
    'uuid v1',
    'nil uuid',
    'random uuid',
    'timestamp uuid',
    'database id',
    'session id',
    'api tracking',
    'bepul uuid generator',
    'onlayn uuid',
    'uuid vositasi',
    'uuid tool',
    'identifikator yaratish',
    'noyob kod yaratish',
    'dasturchi vositasi',
    'web development',
    'uuid formatlar',
    'uuid validation',
    'uuid tekshirish',

    // Ingliz tilida
    'uuid generator',
    'uuid generator online',
    'free uuid generator',
    'unique identifier generator',
    'guid generator',
    'uuid v4 generator',
    'uuid v1 generator',
    'random uuid generator',
    'timestamp uuid generator',
    'nil uuid generator',
    'uuid maker',
    'uuid creator',
    'uuid tool',
    'database uuid',
    'session uuid',
    'api uuid',
    'distributed systems uuid',
    'rfc 4122 uuid',
    'compact uuid',
    'brackets uuid',
    'uuid formats',
    'uuid validation',
    'bulk uuid generation',
    'batch uuid generator',
    'developer tools',
    'programming tools',
    'software development',
    'web development tools',
    'online uuid tool',
    'professional uuid generator',

    // Rus tilida
    'генератор uuid',
    'генератор уникальных идентификаторов',
    'guid генератор',
    'uuid v4 генератор',
    'uuid v1 генератор',
    'случайный uuid',
    'временной uuid',
    'nil uuid',
    'создать uuid',
    'генерация uuid',
    'бесплатный uuid генератор',
    'онлайн uuid',
    'инструмент uuid',
    'база данных uuid',
    'сессия uuid',
    'api uuid',
    'валидация uuid',
    'проверка uuid',
    'инструменты разработчика',
    'веб разработка',

    // Long-tail keywords
    'uuid v4 v1 nil formatlar bilan yaratish',
    'professional unique identifier generator free',
    'генератор uuid онлайн бесплатно все форматы',
    'webiston uuid tools',
    'database session api uuid generator',
    'distributed systems unique identifier tool',
  ],
  openGraph: {
    title: 'UUID Generator - Bepul Noyob Identifikator Yaratuvchi | Webiston',
    description:
      'Eng yaxshi bepul UUID generator. UUID v4, v1, NIL formatlar. Noyob identifikatorlar yaratish, database, API va dasturlash uchun.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/uuid-generator',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'UUID Generator - Bepul Noyob Identifikator Yaratuvchi Vositasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'UUID Generator - Bepul Noyob Identifikator',
    description:
      'Professional UUID generator. UUID v4, v1, NIL formatlar bilan noyob identifikatorlar yaratish. Bepul!',
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/uuid-generator',
    languages: {
      uz: 'https://webiston.uz/tools/uuid-generator',
      en: 'https://webiston.uz/en/tools/uuid-generator',
      'x-default': 'https://webiston.uz/tools/uuid-generator',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
  classification: 'Tools and Utilities',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': ['WebApplication', 'SoftwareApplication'],
  name: 'UUID Generator - Bepul Noyob Identifikator Yaratuvchi',
  alternateName: ['UUID Generator', 'GUID Generator', 'Unique Identifier Tool'],
  description:
    'Professional UUID generator. UUID v4, v1, NIL formatlar bilan noyob identifikatorlar yaratish uchun bepul vosita.',
  url: 'https://webiston.uz/tools/uuid-generator',
  sameAs: ['https://webiston.uz/en/tools/uuid-generator', 'https://webiston.uz/tools/uuid-generator'],
  applicationCategory: ['DeveloperApplication', 'UtilityApplication'],
  operatingSystem: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  permissions: 'browser',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: '2024-01-01',
  },
  author: {
    '@type': 'Organization',
    name: 'Webiston',
    url: 'https://webiston.uz',
    logo: 'https://webiston.uz/logo.png',
    sameAs: ['https://github.com/webiston', 'https://twitter.com/webiston_uz'],
  },
  publisher: {
    '@type': 'Organization',
    name: 'Webiston',
    url: 'https://webiston.uz',
    logo: {
      '@type': 'ImageObject',
      url: 'https://webiston.uz/logo.png',
      width: 512,
      height: 512,
    },
  },
  featureList: [
    'UUID v4 yaratish (random)',
    'UUID v1 yaratish (timestamp-based)',
    'NIL UUID yaratish',
    "Turli formatlar qo'llab-quvvatlash",
    'Standart UUID format',
    'Compact format (tire belgilarsiz)',
    'Brackets format',
    'Uppercase format',
    'Bulk yaratish (1-1000)',
    'UUID validation',
    'Statistika va analytics',
    'TXT formatda yuklab olish',
    'JSON formatda yuklab olish',
    'Alohida UUID nusxa olish',
    'Barcha UUID nusxa olish',
    'Real-time format switching',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'uuid generator, noyob identifikator, uuid v4, bepul uuid generator',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1650',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Foydalanuvchi',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody: 'UUID yaratish uchun juda foydali vosita. Turli formatlar va versiyalar bilan ajoyib ishlaydi!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'UUID nima va nima uchun kerak?',
          answer:
            'UUID (Universally Unique Identifier) - bu noyob identifikator. Database, API, session va fayl nomlash uchun ishlatiladi.',
        },
        {
          question: 'UUID v4 va v1 orasida qanday farq bor?',
          answer: 'UUID v4 tasodifiy yaratiladi, UUID v1 esa vaqt va MAC address asosida yaratiladi.',
        },
        {
          question: 'UUID generator xavfsizmi?',
          answer:
            "Ha, bizning UUID generator to'liq xavfsiz. Barcha ma'lumotlar brauzeringizda yaratiladi va hech qayerga yuborilmaydi.",
        },
        {
          question: 'UUID generator bepulmi?',
          answer: "Ha, bizning UUID generator to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'What is UUID and why is it needed?',
          answer:
            'UUID (Universally Unique Identifier) is a unique identifier. Used for database, API, session and file naming.',
        },
        {
          question: 'What is the difference between UUID v4 and v1?',
          answer: 'UUID v4 is generated randomly, while UUID v1 is based on timestamp and MAC address.',
        },
        {
          question: 'Is UUID generator secure?',
          answer:
            'Yes, our UUID generator is completely secure. All data is generated in your browser and not sent anywhere.',
        },
        {
          question: 'Is UUID generator free?',
          answer: 'Yes, our UUID generator is completely free. No limitations or payments required.',
        },
      ],
    },
  }

  const currentFAQ = faqData[locale as keyof typeof faqData] || faqData.uz

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: currentFAQ.questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

// Breadcrumb Schema (locale-based)
function generateBreadcrumbSchema(locale: string = 'uz') {
  const breadcrumbData = {
    uz: {
      home: 'Bosh sahifa',
      tools: 'Vositalar',
      uuidGenerator: 'UUID Generator',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      uuidGenerator: 'UUID Generator',
    },
  }

  const current = breadcrumbData[locale as keyof typeof breadcrumbData] || breadcrumbData.uz
  const baseUrl = locale === 'en' ? 'https://webiston.uz/en' : 'https://webiston.uz'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: current.home,
        item: locale === 'en' ? 'https://webiston.uz/en' : 'https://webiston.uz',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: current.tools,
        item: `${baseUrl}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: current.uuidGenerator,
        item: `${baseUrl}/tools/uuid-generator`,
      },
    ],
  }
}

export default async function UuidGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) || { locale: 'uz' }

  // Generate locale-specific schemas
  const faqSchema = generateFAQSchema(locale)
  const breadcrumbSchema = generateBreadcrumbSchema(locale)

  return (
    <>
      {/* Main Application Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* FAQ Schema for rich snippets */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <UuidGenerator />
    </>
  )
}
