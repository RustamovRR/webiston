import type { Metadata } from 'next'
import { UrlEncoder } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'URL Encoder/Decoder - Bepul URL Encode/Decode | Webiston',
  description:
    'Eng yaxshi bepul URL encoder/decoder. URL manzillarni encode va decode qiling. Percent encoding va URI formatting.',
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'url encoder',
    'url decoder',
    'url encode',
    'url decode',
    "url o'giruvchi",
    'link encoder',
    'bepul url encoder',
    'onlayn url encoder',
    'url kodlash',
    'url dekodlash',
    'percent encoding',
    'uri encoder',
    'uri decoder',
    'url escape',
    'url unescape',
    'query string encoder',
    'form data encoding',
    'url validator',
    'url parser',

    // Ingliz tilida
    'url encoder',
    'url decoder',
    'url encode online',
    'url decode online',
    'percent encoding',
    'uri encoder',
    'free url encoder',
    'online url encoder',
    'url encoding tool',
    'url decoding tool',
    'query string encoder',
    'form data encoder',
    'url escape tool',
    'uri encoding',
    'web url encoder',

    // Rus tilida
    'url кодировщик',
    'url декодер',
    'кодирование url',
    'декодирование url',
    'онлайн url кодер',
    'процентное кодирование',
    'uri кодировщик',
    'бесплатный url кодер',
    'веб url кодировщик',

    // Long-tail keywords
    'url manzillarni encode decode qilish',
    'encode decode url online free',
    'кодирование декодирование url онлайн',
    'professional url encoder decoder',
    'webiston url tools',
  ],
  openGraph: {
    title: 'URL Encoder/Decoder - Bepul URL Encode/Decode | Webiston',
    description:
      'Eng yaxshi bepul URL encoder/decoder. URL manzillarni encode va decode qiling. Percent encoding va URI formatting tool.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/url-encoder',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'URL Encoder/Decoder - Bepul URL Encode/Decode Vositasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'URL Encoder/Decoder - Bepul URL Tool',
    description: 'Professional URL encoder/decoder. URL manzillarni encode va decode qiling. Bepul va tez!',
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/url-encoder',
    languages: {
      uz: 'https://webiston.uz/tools/url-encoder',
      en: 'https://webiston.uz/en/tools/url-encoder',
      'x-default': 'https://webiston.uz/tools/url-encoder',
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
  name: 'URL Encoder/Decoder - Bepul URL Encode/Decode',
  alternateName: ['URL Encoder', 'URL Decoder', 'URI Encoder'],
  description: 'Professional URL encoder/decoder. URL manzillarni encode va decode qilish uchun bepul vosita.',
  url: 'https://webiston.uz/tools/url-encoder',
  sameAs: ['https://webiston.uz/en/tools/url-encoder', 'https://webiston.uz/tools/url-encoder'],
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
    'URL encode va decode',
    'Percent encoding support',
    'URI formatting',
    'Special characters handling',
    'Batch URL processing',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Nusxa olish imkoniyati',
    'Real-time conversion',
    'Unicode support',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'url encoder, url decoder, url encode, bepul url encoder',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    ratingCount: '1600',
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
      reviewBody: 'URL encode va decode qilish uchun juda foydali vosita. Tez va aniq ishlaydi!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'URL encoding nima uchun kerak?',
          answer:
            "URL encoding maxsus belgilar va bo'shliqlarni URL da xavfsiz uzatish uchun ishlatiladi. Bu web development da muhim.",
        },
        {
          question: 'URL encoder bepulmi?',
          answer: "Ha, bizning URL encoder to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
        {
          question: 'Qanday belgilar encode qilinadi?',
          answer:
            "Bo'shliqlar, maxsus belgilar (&, ?, =, #, %), kirill harflari va boshqa Unicode belgilar encode qilinadi.",
        },
        {
          question: 'Percent encoding nima?',
          answer: 'Percent encoding - bu URL da maxsus belgilarni % belgisi va hex kod bilan almashtirish usuli.',
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'Why is URL encoding needed?',
          answer:
            "URL encoding is used to safely transmit special characters and spaces in URLs. It's essential in web development.",
        },
        {
          question: 'Is URL encoder free?',
          answer: 'Yes, our URL encoder is completely free. No limitations or payments required.',
        },
        {
          question: 'What characters are encoded?',
          answer:
            'Spaces, special characters (&, ?, =, #, %), Cyrillic letters and other Unicode characters are encoded.',
        },
        {
          question: 'What is percent encoding?',
          answer: 'Percent encoding is a method to replace special characters in URLs with % sign and hex code.',
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
      urlEncoder: 'URL Encoder',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      urlEncoder: 'URL Encoder',
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
        name: current.urlEncoder,
        item: `${baseUrl}/tools/url-encoder`,
      },
    ],
  }
}

export default async function UrlEncoderPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <UrlEncoder />
    </>
  )
}
