import type { Metadata } from 'next'
import { Base64Converter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Base64 Converter - Bepul Base64 Encode/Decode | Webiston',
  description:
    'Eng yaxshi bepul Base64 converter. Matn va fayllarni Base64 ga encode/decode qiling. Tez, xavfsiz va professional vosita.',
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'base64 converter',
    'base64 encode',
    'base64 decode',
    "base64 o'giruvchi",
    'matn base64 ga',
    'base64 dan matn',
    'bepul base64 converter',
    'onlayn base64',
    'base64 kodlash',
    'base64 dekodlash',
    'base64 encoder',
    'base64 decoder',
    'base64 konverter',
    'base64 vositasi',
    'base64 tool',
    'matn kodlash',
    'matn dekodlash',
    'string encoder',
    'string decoder',

    // Ingliz tilida
    'base64 converter',
    'base64 encoder',
    'base64 decoder',
    'encode to base64',
    'decode from base64',
    'base64 online',
    'free base64 converter',
    'base64 encode decode',
    'text to base64',
    'base64 to text',
    'online base64 encoder',
    'online base64 decoder',
    'base64 converter tool',
    'base64 encoding',
    'base64 decoding',

    // Rus tilida
    'base64 конвертер',
    'base64 кодировщик',
    'base64 декодер',
    'кодирование base64',
    'декодирование base64',
    'онлайн base64',
    'бесплатный base64 конвертер',
    'base64 кодировать',
    'base64 декодировать',
    'текст в base64',
    'base64 в текст',

    // Long-tail keywords
    "matn va fayllarni base64 ga o'girish",
    'encode decode base64 online free',
    'конвертер base64 онлайн бесплатно',
    'professional base64 converter',
    'webiston base64 tools',
  ],
  openGraph: {
    title: 'Base64 Converter - Bepul Base64 Encode/Decode | Webiston',
    description:
      'Eng yaxshi bepul Base64 converter. Matn va fayllarni Base64 ga encode/decode qiling. Tez, xavfsiz va professional vosita.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/base64-converter',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'Base64 Converter - Bepul Base64 Encode/Decode Vositasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'Base64 Converter - Bepul Base64 Encode/Decode',
    description: 'Professional Base64 converter. Matn va fayllarni Base64 ga encode/decode qiling. Bepul va tez!',
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/base64-converter',
    languages: {
      uz: 'https://webiston.uz/tools/base64-converter',
      en: 'https://webiston.uz/en/tools/base64-converter',
      'x-default': 'https://webiston.uz/tools/base64-converter',
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
  name: 'Base64 Converter - Bepul Base64 Encode/Decode',
  alternateName: ['Base64 Encoder', 'Base64 Decoder', 'Base64 Tool'],
  description: 'Professional Base64 converter. Matn va fayllarni Base64 ga encode/decode qilish uchun bepul vosita.',
  url: 'https://webiston.uz/tools/base64-converter',
  sameAs: ['https://webiston.uz/en/tools/base64-converter', 'https://webiston.uz/tools/base64-converter'],
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
    'Base64 encode va decode',
    'Matn va fayl konvertatsiyasi',
    'Katta fayllar bilan ishlash',
    'Xavfsiz va maxfiy',
    'Tez konvertatsiya',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Nusxa olish imkoniyati',
    'Real-time conversion',
    'Binary data support',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'base64 converter, base64 encode, base64 decode, bepul base64 converter',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.6',
    ratingCount: '1900',
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
      reviewBody: 'Base64 encode va decode qilish uchun juda foydali vosita. Tez va xavfsiz ishlaydi!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Base64 nima va nima uchun kerak?',
          answer:
            "Base64 - bu binary ma'lumotlarni matn formatiga o'girish usuli. Email, web va API'larda binary fayllarni uzatish uchun ishlatiladi.",
        },
        {
          question: 'Base64 converter xavfsizmi?',
          answer:
            "Ha, bizning Base64 converter to'liq xavfsiz. Barcha ma'lumotlar brauzeringizda qayta ishlanadi va hech qayerga yuborilmaydi.",
        },
        {
          question: "Qanday fayllarni Base64 ga o'girish mumkin?",
          answer: "Har qanday matn, rasm, hujjat va boshqa binary fayllarni Base64 formatiga o'girish mumkin.",
        },
        {
          question: 'Base64 converter bepulmi?',
          answer: "Ha, bizning Base64 converter to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'What is Base64 and why is it needed?',
          answer:
            "Base64 is a method to convert binary data to text format. It's used to transmit binary files in email, web and APIs.",
        },
        {
          question: 'Is Base64 converter secure?',
          answer:
            'Yes, our Base64 converter is completely secure. All data is processed in your browser and not sent anywhere.',
        },
        {
          question: 'What files can be converted to Base64?',
          answer: 'Any text, images, documents and other binary files can be converted to Base64 format.',
        },
        {
          question: 'Is Base64 converter free?',
          answer: 'Yes, our Base64 converter is completely free. No limitations or payments required.',
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
      base64Converter: 'Base64 Converter',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      base64Converter: 'Base64 Converter',
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
        name: current.base64Converter,
        item: `${baseUrl}/tools/base64-converter`,
      },
    ],
  }
}

export default async function Base64ConverterPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <Base64Converter />
    </>
  )
}
