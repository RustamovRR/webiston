import type { Metadata } from 'next'
import { ColorConverter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Color Converter - Bepul Rang Konverter va Palette Generator | Webiston',
  description:
    'Eng yaxshi bepul color converter. HEX, RGB, HSL, CMYK ranglarni konvertatsiya qiling va professional color palette yarating.',
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'color converter',
    'rang konverter',
    'rang konvertatsiyasi',
    'hex to rgb',
    'rgb to hsl',
    'hsl to hex',
    'cmyk converter',
    'color palette',
    'rang palitra',
    'color picker',
    'rang tanlash',
    'bepul color converter',
    'onlayn rang konverter',
    'color generator',
    'rang generator',
    'palette generator',
    'palitra generator',
    'design tools',
    'dizayn vositalari',
    'web colors',
    'veb ranglari',

    // Ingliz tilida
    'color converter',
    'color converter online',
    'hex to rgb converter',
    'rgb to hsl converter',
    'color palette generator',
    'color picker tool',
    'free color converter',
    'online color converter',
    'color code converter',
    'hex color converter',
    'rgb color converter',
    'hsl color converter',
    'cmyk color converter',
    'color scheme generator',
    'color palette maker',
    'design color tools',
    'web color converter',
    'color format converter',

    // Rus tilida
    'конвертер цветов',
    'конвертер цвета онлайн',
    'hex в rgb',
    'rgb в hsl',
    'генератор палитры',
    'палитра цветов',
    'выбор цвета',
    'бесплатный конвертер цветов',
    'онлайн конвертер цветов',
    'инструменты дизайна',
    'веб цвета',

    // Long-tail keywords
    'hex rgb hsl cmyk rang konvertatsiyasi',
    'professional color palette generator free',
    'конвертер цветов hex rgb hsl онлайн',
    'webiston color tools',
    'design color converter professional',
  ],
  openGraph: {
    title: 'Color Converter - Bepul Rang Konverter va Palette Generator | Webiston',
    description:
      'Eng yaxshi bepul color converter. HEX, RGB, HSL, CMYK ranglarni konvertatsiya qiling va professional color palette yarating.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/color-converter',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'Color Converter - Bepul Rang Konverter va Palette Generator',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'Color Converter - Bepul Rang Konverter',
    description:
      'Professional color converter. HEX, RGB, HSL ranglarni konvertatsiya qiling va palette yarating. Bepul!',
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/color-converter',
    languages: {
      uz: 'https://webiston.uz/tools/color-converter',
      en: 'https://webiston.uz/en/tools/color-converter',
      'x-default': 'https://webiston.uz/tools/color-converter',
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
  name: 'Color Converter - Bepul Rang Konverter va Palette Generator',
  alternateName: ['Color Picker', 'Palette Generator', 'Rang Konverter'],
  description:
    'Professional color converter. HEX, RGB, HSL, CMYK ranglarni konvertatsiya qilish va palette yaratish uchun bepul vosita.',
  url: 'https://webiston.uz/tools/color-converter',
  sameAs: ['https://webiston.uz/en/tools/color-converter', 'https://webiston.uz/tools/color-converter'],
  applicationCategory: ['UtilityApplication', 'DesignApplication'],
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
    'HEX to RGB konvertatsiya',
    'RGB to HSL konvertatsiya',
    'HSL to CMYK konvertatsiya',
    'Color palette generation',
    'Monochromatic palette',
    'Analogous palette',
    'Complementary palette',
    'Triadic palette',
    'Random color generator',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Real-time conversion',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'color converter, rang konverter, hex to rgb, bepul color converter',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.6',
    ratingCount: '1800',
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
      reviewBody:
        'Ranglarni konvertatsiya qilish va palette yaratish uchun juda foydali vosita. Dizaynerlar uchun ajoyib!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Color converter qanday ishlaydi?',
          answer:
            'Color converter ranglarni turli formatlar (HEX, RGB, HSL, CMYK) orasida konvertatsiya qiladi va professional color palette yaratadi.',
        },
        {
          question: "Qanday rang formatlarini qo'llab-quvvatlaydi?",
          answer: "HEX, RGB, HSL, CMYK va boshqa asosiy rang formatlarini qo'llab-quvvatlaydi.",
        },
        {
          question: 'Color palette qanday yaratiladi?',
          answer:
            'Asosiy rangni tanlab, monochromatic, analogous, complementary va triadic palette turlarini yaratish mumkin.',
        },
        {
          question: 'Color converter bepulmi?',
          answer: "Ha, bizning color converter to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'How does color converter work?',
          answer:
            'Color converter converts colors between different formats (HEX, RGB, HSL, CMYK) and creates professional color palettes.',
        },
        {
          question: 'What color formats are supported?',
          answer: 'Supports HEX, RGB, HSL, CMYK and other major color formats.',
        },
        {
          question: 'How to create color palettes?',
          answer: 'Select a base color and create monochromatic, analogous, complementary and triadic palette types.',
        },
        {
          question: 'Is color converter free?',
          answer: 'Yes, our color converter is completely free. No limitations or payments required.',
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
      colorConverter: 'Color Converter',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      colorConverter: 'Color Converter',
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
        name: current.colorConverter,
        item: `${baseUrl}/tools/color-converter`,
      },
    ],
  }
}

export default async function ColorConverterPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <ColorConverter />
    </>
  )
}
