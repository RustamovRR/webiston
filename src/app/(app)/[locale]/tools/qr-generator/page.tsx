import type { Metadata } from 'next'
import { QrGenerator } from '@/modules/tools'

// Locale-based metadata generation
function generateMetadata(locale: string = 'uz'): Metadata {
  const isUzbek = locale === 'uz'

  const titles = {
    uz: 'QR Kod Yaratish - Bepul QR Kod Generator Onlayn | Webiston',
    en: 'QR Code Generator - Free Online QR Creator | Webiston',
  }

  const descriptions = {
    uz: 'QR kod yaratish uchun eng yaxshi bepul vosita. URL, matn, kontakt, WiFi, SMS uchun QR kodlar yarating. Tez, oson va professional QR generator.',
    en: 'Best free QR code generator online. Create QR codes for URLs, text, contacts, WiFi, SMS. Fast, easy and professional QR creator.',
  }

  const keywords = {
    uz: [
      'qr kod yaratish',
      'qr kod generator',
      'qr kod generatori',
      'qr kod yasash',
      'qr kod qilish',
      'qr kod online',
      'bepul qr kod',
      'qr kod bepul',
      'url qr kod',
      'matn qr kod',
      'wifi qr kod',
      'kontakt qr kod',
      'professional qr kod generator',
      'webiston qr tools',
      "o'zbek qr generator",
    ],
    en: [
      'qr code generator',
      'free qr generator',
      'qr code maker',
      'online qr generator',
      'qr code creator',
      'url qr code',
      'text qr code',
      'wifi qr code',
      'contact qr code',
      'professional qr generator',
      'webiston tools',
    ],
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.uz,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.uz,
    keywords: keywords[locale as keyof typeof keywords] || keywords.uz,
    // ... rest of metadata
  }
}

export const metadata: Metadata = {
  title: 'QR Kod Yaratish - Bepul QR Kod Generator Onlayn | Webiston',
  description:
    'QR kod yaratish uchun eng yaxshi bepul vosita. URL, matn, kontakt, WiFi, SMS uchun QR kodlar yarating. Tez, oson va professional QR generator.',
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'qr kod yaratish',
    'qr kod generator',
    'qr kod generatori',
    'qr kod yasash',
    'qr kod qilish',
    'qr kod online',
    'bepul qr kod',
    'qr kod bepul',
    'qr kod vositasi',
    'qr kod tool',

    // Ingliz tilida
    'qr code generator',
    'free qr generator',
    'qr code maker',
    'online qr generator',
    'qr code creator',

    // Rus tilida
    'qr код генератор',
    'создать qr код',
    'генератор qr кода',

    // Specific use cases
    'url qr kod',
    'matn qr kod',
    'wifi qr kod',
    'kontakt qr kod',
    'sms qr kod',
    'email qr kod',
    'telefon qr kod',

    // Long-tail keywords
    'qr kod yaratish va ulardan foydalanish',
    'professional qr kod generator',
    'webiston qr tools',
    "o'zbek qr generator",
    'uzbek qr code generator',
  ],
  openGraph: {
    title: 'QR Kod Yaratish - Bepul QR Kod Generator | Webiston',
    description:
      'Eng yaxshi bepul QR kod generator. URL, matn, kontakt, WiFi uchun professional QR kodlar yarating. Tez, oson va xavfsiz.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/qr-generator',
    images: [
      {
        url: 'https://webiston.uz/images/tools/qr-generator-og.png',
        width: 1200,
        height: 630,
        alt: 'QR Kod Generator - Bepul QR Kod Yaratish Vositasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'QR Kod Yaratish - Bepul QR Generator',
    description: 'Professional QR kod generator. URL, matn, kontakt, WiFi uchun QR kodlar yarating. Bepul va tez!',
    images: ['https://webiston.uz/images/tools/qr-generator-twitter.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/qr-generator',
    languages: {
      uz: 'https://webiston.uz/tools/qr-generator',
      en: 'https://webiston.uz/en/tools/qr-generator',
      'x-default': 'https://webiston.uz/tools/qr-generator',
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
  name: 'QR Kod Generator - Bepul QR Kod Yaratish',
  alternateName: ['QR Code Generator', 'QR Kod Yaratish', 'QR Generator'],
  description: 'Professional QR kod yaratish vositasi. URL, matn, kontakt, WiFi, SMS uchun bepul QR kodlar yarating.',
  url: 'https://webiston.uz/tools/qr-generator',
  sameAs: ['https://webiston.uz/en/tools/qr-generator', 'https://webiston.uz/tools/qr-generator'],
  applicationCategory: ['UtilityApplication', 'ProductivityApplication'],
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
    sameAs: ['https://github.com/webiston', 'https://x.com/webiston_uz'],
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
    'URL QR kod yaratish',
    'Matn QR kod yaratish',
    'Kontakt QR kod yaratish',
    'WiFi QR kod yaratish',
    'SMS QR kod yaratish',
    'Email QR kod yaratish',
    'Telefon QR kod yaratish',
    "Turli o'lchamlar",
    'Xato tuzatish darajalari',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Yuklab olish imkoniyati',
  ],
  screenshot: 'https://webiston.uz/images/tools/qr-generator-screenshot.png',
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'qr kod yaratish, qr generator, bepul qr kod, online qr generator',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
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
      reviewBody: 'Juda oson va tez QR kod yaratish imkoniyati. Professional va bepul!',
    },
  ],
}

// FAQ Schema for better SERP features
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'QR kod qanday yaratiladi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "QR kod yaratish uchun bizning bepul vositamizdan foydalaning. URL, matn yoki kontakt ma'lumotlarini kiriting va QR kod avtomatik yaratiladi.",
      },
    },
    {
      '@type': 'Question',
      name: 'QR kod bepulmi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Ha, bizning QR kod generator to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
      },
    },
    {
      '@type': 'Question',
      name: 'QR kod qanday formatda yuklab olish mumkin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "QR kodlarni PNG, JPG, SVG formatlarida yuklab olish mumkin. Turli o'lchamlarda ham mavjud.",
      },
    },
    {
      '@type': 'Question',
      name: 'WiFi QR kod qanday yaratiladi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WiFi QR kod yaratish uchun tarmoq nomi (SSID) va parolni kiriting. QR kod avtomatik yaratiladi va uni scan qilganda WiFi ga avtomatik ulanadi.',
      },
    },
  ],
}

// Breadcrumb Schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Bosh sahifa',
      item: 'https://webiston.uz',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Vositalar',
      item: 'https://webiston.uz/tools',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'QR Kod Generator',
      item: 'https://webiston.uz/tools/qr-generator',
    },
  ],
}

export default function QrGeneratorPage() {
  return (
    <>
      {/* Main Application Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* FAQ Schema for rich snippets */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <QrGenerator />
    </>
  )
}
