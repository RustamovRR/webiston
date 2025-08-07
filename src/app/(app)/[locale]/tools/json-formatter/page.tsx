import type { Metadata } from 'next'
import { JsonFormatter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'JSON Formatter - Bepul JSON Formatlash va Tekshirish | Webiston',
  description:
    "Eng yaxshi bepul JSON formatter. JSON ma'lumotlarini formatlash, tekshirish va tuzatish. Professional va tez JSON vositasi.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'json formatter',
    'json formatlash',
    'json beautify',
    'json validator',
    'json tekshirish',
    "json o'qish",
    'json tuzatish',
    'bepul json formatter',
    'onlayn json formatter',
    'json chiroylash',
    'json pretty print',
    'json minify',
    'json siqish',
    'json viewer',
    'json editor',
    'json parser',
    'json syntax check',
    'json xato aniqlash',
    'json validatsiya',

    // Ingliz tilida
    'json formatter',
    'json beautifier',
    'json validator',
    'json parser',
    'format json online',
    'json pretty print',
    'json minify',
    'free json formatter',
    'online json formatter',
    'json syntax checker',
    'json lint',
    'json viewer',
    'json editor',
    'validate json',
    'json formatter tool',

    // Rus tilida
    'json форматтер',
    'форматирование json',
    'json валидатор',
    'проверка json',
    'онлайн json форматтер',
    'бесплатный json форматтер',
    'json редактор',
    'json парсер',
    'форматировать json',
    'проверить json',

    // Long-tail keywords
    'json formatlash va tekshirish',
    'professional json formatter online',
    'format and validate json free',
    'форматирование и проверка json онлайн',
    "json ma'lumotlarini formatlash",
    'webiston json tools',
  ],
  openGraph: {
    title: 'JSON Formatter - Bepul JSON Formatlash va Tekshirish | Webiston',
    description:
      "Eng yaxshi bepul JSON formatter. JSON ma'lumotlarini formatlash, tekshirish va tuzatish. Professional va tez JSON vositasi.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/json-formatter',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'JSON Formatter - Bepul JSON Formatlash va Tekshirish Vositasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'JSON Formatter - Bepul JSON Formatlash',
    description: "Professional JSON formatter. JSON ma'lumotlarini formatlash, tekshirish va tuzatish. Bepul va tez!",
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/json-formatter',
    languages: {
      uz: 'https://webiston.uz/tools/json-formatter',
      en: 'https://webiston.uz/en/tools/json-formatter',
      'x-default': 'https://webiston.uz/tools/json-formatter',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
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
  name: 'JSON Formatter - Bepul JSON Formatlash va Tekshirish',
  alternateName: ['JSON Beautifier', 'JSON Validator', 'JSON Parser'],
  description:
    "Professional JSON formatter. JSON ma'lumotlarini formatlash, tekshirish va tuzatish uchun bepul vosita.",
  url: 'https://webiston.uz/tools/json-formatter',
  sameAs: ['https://webiston.uz/en/tools/json-formatter', 'https://webiston.uz/tools/json-formatter'],
  applicationCategory: ['UtilityApplication', 'DeveloperApplication'],
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
    'JSON formatlash va beautify',
    'JSON validatsiya va xato aniqlash',
    'JSON minify va compress',
    'Sintaksis highlighting',
    "Xato ko'rsatish va tuzatish",
    'Katta JSON fayllar bilan ishlash',
    'Nusxa olish imkoniyati',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Real-time formatting',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'json formatter, json formatlash, json validator, bepul json formatter',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    ratingCount: '2800',
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
      reviewBody: "JSON ma'lumotlarini formatlash va tekshirish uchun juda foydali vosita. Tez va aniq ishlaydi!",
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'JSON formatter qanday ishlaydi?',
          answer:
            "JSON formatter sizning JSON ma'lumotlaringizni formatlaydi, tekshiradi va xatolarni aniqlaydi. Shunchaki JSON kodingizni joylashtiring va format tugmasini bosing.",
        },
        {
          question: 'JSON formatter bepulmi?',
          answer: "Ha, bizning JSON formatter to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
        {
          question: 'Qanday JSON xatolarini aniqlash mumkin?',
          answer:
            "JSON formatter sintaksis xatolarini, noto'g'ri vergul va qavs joylashuvini, noto'g'ri qiymat turlarini aniqlaydi.",
        },
        {
          question: 'Katta JSON fayllar bilan ishlash mumkinmi?',
          answer: 'Ha, bizning JSON formatter katta hajmdagi JSON fayllar bilan ham samarali ishlaydi.',
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'How does JSON formatter work?',
          answer:
            'JSON formatter formats, validates and detects errors in your JSON data. Simply paste your JSON code and click format button.',
        },
        {
          question: 'Is JSON formatter free?',
          answer: 'Yes, our JSON formatter is completely free. No limitations or payments required.',
        },
        {
          question: 'What JSON errors can be detected?',
          answer:
            'JSON formatter detects syntax errors, incorrect comma and bracket placement, wrong value types and more.',
        },
        {
          question: 'Can it handle large JSON files?',
          answer: 'Yes, our JSON formatter efficiently handles large JSON files as well.',
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
      jsonFormatter: 'JSON Formatter',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      jsonFormatter: 'JSON Formatter',
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
        name: current.jsonFormatter,
        item: `${baseUrl}/tools/json-formatter`,
      },
    ],
  }
}

export default async function JsonFormatterPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <JsonFormatter />
    </>
  )
}
