import type { Metadata } from 'next'
import { HashGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Hash Generator - Bepul MD5, SHA256, SHA512 Hash Yaratish | Webiston',
  description:
    'Eng yaxshi bepul hash generator. MD5, SHA1, SHA256, SHA512 kriptografik hash yaratish. Parol, fayl va matn uchun xavfsiz hash.',
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'hash generator',
    'hash yaratish',
    'hash generatori',
    'hash yasash',
    'hash qilish',
    'md5 hash',
    'sha256 hash',
    'sha512 hash',
    'sha1 hash',
    'kriptografik hash',
    'xavfsiz hash',
    'parol hash',
    'fayl hash',
    'matn hash',
    'hash tekshirish',
    'hash taqqoslash',
    'bepul hash generator',
    'onlayn hash',
    'hash vositasi',
    'hash tool',
    'checksum calculator',
    'checksum hisoblagich',
    "ma'lumot butunligi",
    'xavfsizlik vositasi',
    'dasturchi vositasi',

    // Ingliz tilida
    'hash generator',
    'hash generator online',
    'free hash generator',
    'md5 generator',
    'sha256 generator',
    'sha512 generator',
    'sha1 generator',
    'cryptographic hash',
    'password hash generator',
    'file hash generator',
    'text hash generator',
    'secure hash algorithm',
    'message digest',
    'digital fingerprint',
    'checksum calculator',
    'hash function',
    'data integrity',
    'hash verification',
    'hash comparison',
    'bulk hash generation',
    'batch hash processing',
    'online hash tool',
    'hash converter',
    'hash encoder',
    'security tool',
    'developer tool',
    'blockchain hash',
    'bitcoin hash',
    'ethereum hash',
    'professional hash tool',

    // Rus tilida
    'генератор хеша',
    'генератор хэша онлайн',
    'md5 генератор',
    'sha256 генератор',
    'sha512 генератор',
    'криптографический хеш',
    'хеш пароля',
    'хеш файла',
    'хеш текста',
    'безопасный хеш',
    'проверка хеша',
    'сравнение хеша',
    'бесплатный генератор хеша',
    'онлайн хеш',
    'инструмент хеширования',
    'калькулятор контрольной суммы',
    'цифровой отпечаток',
    'целостность данных',
    'хеш функция',
    'алгоритм хеширования',

    // Long-tail keywords
    'md5 sha1 sha256 sha512 hash yaratish',
    'professional cryptographic hash generator free',
    'генератор хеша md5 sha256 онлайн бесплатно',
    'webiston hash tools',
    'secure password hash generator online',
    'file integrity hash verification tool',
  ],
  openGraph: {
    title: 'Hash Generator - Bepul MD5, SHA256, SHA512 Hash Yaratish | Webiston',
    description:
      'Eng yaxshi bepul hash generator. MD5, SHA1, SHA256, SHA512 kriptografik hash yaratish. Parol, fayl va matn uchun xavfsiz hash.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/hash-generator',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'Hash Generator - Bepul MD5, SHA256, SHA512 Hash Yaratish Vositasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'Hash Generator - Bepul MD5, SHA256, SHA512 Hash',
    description: 'Professional hash generator. MD5, SHA1, SHA256, SHA512 kriptografik hash yaratish. Bepul va xavfsiz!',
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/hash-generator',
    languages: {
      uz: 'https://webiston.uz/tools/hash-generator',
      en: 'https://webiston.uz/en/tools/hash-generator',
      'x-default': 'https://webiston.uz/tools/hash-generator',
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
  name: 'Hash Generator - Bepul MD5, SHA256, SHA512 Hash Yaratish',
  alternateName: ['Hash Generator', 'Cryptographic Hash Tool', 'Hash Yaratuvchi'],
  description: 'Professional hash generator. MD5, SHA1, SHA256, SHA512 kriptografik hash yaratish uchun bepul vosita.',
  url: 'https://webiston.uz/tools/hash-generator',
  sameAs: ['https://webiston.uz/en/tools/hash-generator', 'https://webiston.uz/tools/hash-generator'],
  applicationCategory: ['SecurityApplication', 'DeveloperApplication'],
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
    'MD5 hash yaratish',
    'SHA1 hash yaratish',
    'SHA256 hash yaratish',
    'SHA512 hash yaratish',
    'Matn hash yaratish',
    'Fayl hash yaratish',
    'Parol hash yaratish',
    'Xavfsiz algoritm',
    'Tez hash yaratish',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Hash taqqoslash',
    'Checksum hisoblash',
    'Kriptografik xavfsizlik',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'hash generator, md5 hash, sha256 hash, bepul hash generator',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    ratingCount: '2100',
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
      reviewBody: 'Hash yaratish uchun juda foydali va xavfsiz vosita. MD5, SHA256 algoritmlari ajoyib ishlaydi!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Hash generator nima va nima uchun kerak?',
          answer:
            "Hash generator - bu matn yoki fayllardan kriptografik hash yaratish vositasi. Ma'lumot butunligi, parol xavfsizligi va fayl tekshirish uchun ishlatiladi.",
        },
        {
          question: "Qaysi hash algoritmlari qo'llab-quvvatlanadi?",
          answer: "MD5, SHA1, SHA256, SHA512 kabi asosiy kriptografik hash algoritmlari qo'llab-quvvatlanadi.",
        },
        {
          question: 'Hash generator xavfsizmi?',
          answer:
            "Ha, bizning hash generator to'liq xavfsiz. Barcha ma'lumotlar brauzeringizda qayta ishlanadi va hech qayerga yuborilmaydi.",
        },
        {
          question: 'Hash generator bepulmi?',
          answer: "Ha, bizning hash generator to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'What is hash generator and why is it needed?',
          answer:
            'Hash generator is a tool for creating cryptographic hashes from text or files. Used for data integrity, password security and file verification.',
        },
        {
          question: 'Which hash algorithms are supported?',
          answer: 'Major cryptographic hash algorithms like MD5, SHA1, SHA256, SHA512 are supported.',
        },
        {
          question: 'Is hash generator secure?',
          answer:
            'Yes, our hash generator is completely secure. All data is processed in your browser and not sent anywhere.',
        },
        {
          question: 'Is hash generator free?',
          answer: 'Yes, our hash generator is completely free. No limitations or payments required.',
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
      hashGenerator: 'Hash Generator',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      hashGenerator: 'Hash Generator',
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
        name: current.hashGenerator,
        item: `${baseUrl}/tools/hash-generator`,
      },
    ],
  }
}

export default async function HashGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <HashGenerator />
    </>
  )
}
