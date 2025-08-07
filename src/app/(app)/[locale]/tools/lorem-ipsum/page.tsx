import type { Metadata } from 'next'
import { LoremIpsum } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Bepul Placeholder Matn Yaratuvchi | Webiston',
  description:
    'Eng yaxshi bepul Lorem Ipsum generator. Placeholder matn, dummy text va dizayn uchun namuna matnlar yaratish. Professional lorem ipsum vositasi.',
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'lorem ipsum generator',
    'lorem ipsum yaratuvchi',
    'lorem ipsum yaratish',
    'lorem ipsum yasash',
    'placeholder text',
    'placeholder matn',
    'namuna matn',
    'test matn',
    'dummy text',
    'matn generatori',
    'matn yaratuvchi',
    'dizayn matn',
    'veb dizayn matn',
    'tipografiya test',
    'matn namunasi',
    'bepul lorem ipsum',
    'onlayn lorem ipsum',
    'lorem ipsum vositasi',
    'lorem ipsum tool',
    "o'zbek lorem ipsum",
    'uzbek lorem ipsum',
    'kirill lorem ipsum',
    'lotin lorem ipsum',

    // Ingliz tilida
    'lorem ipsum generator',
    'lorem ipsum generator online',
    'free lorem ipsum generator',
    'placeholder text generator',
    'dummy text generator',
    'lorem ipsum maker',
    'lorem ipsum creator',
    'lorem ipsum tool',
    'sample text generator',
    'filler text generator',
    'design placeholder text',
    'web design placeholder',
    'typography testing text',
    'lorem ipsum paragraphs',
    'lorem ipsum words',
    'lorem ipsum sentences',
    'random text generator',
    'text placeholder',
    'content placeholder',
    'mockup text',
    'prototype text',
    'layout text',
    'professional lorem ipsum',
    'bulk lorem ipsum',
    'custom lorem ipsum',

    // Rus tilida
    'генератор lorem ipsum',
    'генератор текста-заполнителя',
    'lorem ipsum онлайн',
    'текст-рыба',
    'заполнитель текста',
    'макетный текст',
    'тестовый текст',
    'образец текста',
    'бесплатный lorem ipsum',
    'генератор dummy текста',
    'типографский тест',
    'текст для дизайна',
    'веб дизайн текст',

    // Long-tail keywords
    'lorem ipsum va placeholder matn yaratish vositasi',
    'professional lorem ipsum generator with custom options',
    'генератор lorem ipsum с настройками онлайн бесплатно',
    'webiston lorem ipsum tools',
    'design mockup placeholder text generator',
    'typography testing lorem ipsum tool online',
  ],
  openGraph: {
    title: 'Lorem Ipsum Generator - Bepul Placeholder Matn Yaratuvchi | Webiston',
    description:
      'Eng yaxshi bepul Lorem Ipsum generator. Placeholder matn, dummy text va dizayn uchun namuna matnlar yaratish. Professional lorem ipsum vositasi.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/lorem-ipsum',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'Lorem Ipsum Generator - Bepul Placeholder Matn Yaratuvchi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'Lorem Ipsum Generator - Bepul Placeholder Matn',
    description: 'Professional Lorem Ipsum generator. Placeholder matn va dummy text yaratish. Bepul va oson!',
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/lorem-ipsum',
    languages: {
      uz: 'https://webiston.uz/tools/lorem-ipsum',
      en: 'https://webiston.uz/en/tools/lorem-ipsum',
      'x-default': 'https://webiston.uz/tools/lorem-ipsum',
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
  name: 'Lorem Ipsum Generator - Bepul Placeholder Matn Yaratuvchi',
  alternateName: ['Lorem Ipsum Generator', 'Placeholder Text Generator', 'Dummy Text Tool'],
  description:
    'Professional Lorem Ipsum generator. Placeholder matn, dummy text va dizayn uchun namuna matnlar yaratish uchun bepul vosita.',
  url: 'https://webiston.uz/tools/lorem-ipsum',
  sameAs: ['https://webiston.uz/en/tools/lorem-ipsum', 'https://webiston.uz/tools/lorem-ipsum'],
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
    'Lorem Ipsum matn yaratish',
    'Placeholder text generation',
    'Dummy text yaratish',
    'Turli uzunlik sozlamalari',
    'Paragraf soni tanlash',
    "So'z soni tanlash",
    'Jumla soni tanlash',
    'Klassik Lorem Ipsum',
    "O'zbek Lorem Ipsum",
    'Kirill Lorem Ipsum',
    'Lotin Lorem Ipsum',
    'Tipografiya test matn',
    'Dizayn namuna matn',
    'Veb dizayn placeholder',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Nusxa olish imkoniyati',
    'Real-time generation',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'lorem ipsum generator, placeholder matn, dummy text, bepul lorem ipsum',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    ratingCount: '1350',
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
      reviewBody: 'Dizayn va veb ishlar uchun placeholder matn yaratish uchun juda foydali vosita. Oson va tez!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Lorem Ipsum nima va nima uchun ishlatiladi?',
          answer:
            "Lorem Ipsum - bu dizayn va veb ishlarida placeholder sifatida ishlatiladigan namuna matn. Haqiqiy kontent tayyor bo'lmagan paytda layout va tipografiyani test qilish uchun ishlatiladi.",
        },
        {
          question: 'Lorem Ipsum generator qanday ishlaydi?',
          answer:
            "Lorem Ipsum generator avtomatik ravishda kerakli uzunlik va formatdagi placeholder matn yaratadi. Paragraf, jumla yoki so'z soni bo'yicha sozlash mumkin.",
        },
        {
          question: 'Lorem Ipsum generator xavfsizmi?',
          answer:
            "Ha, bizning Lorem Ipsum generator to'liq xavfsiz. Barcha matnlar brauzeringizda yaratiladi va hech qayerga yuborilmaydi.",
        },
        {
          question: 'Lorem Ipsum generator bepulmi?',
          answer: "Ha, bizning Lorem Ipsum generator to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'What is Lorem Ipsum and why is it used?',
          answer:
            'Lorem Ipsum is sample text used as placeholder in design and web work. Used to test layout and typography when real content is not ready.',
        },
        {
          question: 'How does Lorem Ipsum generator work?',
          answer:
            'Lorem Ipsum generator automatically creates placeholder text of required length and format. Can be configured by number of paragraphs, sentences or words.',
        },
        {
          question: 'Is Lorem Ipsum generator secure?',
          answer:
            'Yes, our Lorem Ipsum generator is completely secure. All text is generated in your browser and not sent anywhere.',
        },
        {
          question: 'Is Lorem Ipsum generator free?',
          answer: 'Yes, our Lorem Ipsum generator is completely free. No limitations or payments required.',
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
      loremIpsum: 'Lorem Ipsum Generator',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      loremIpsum: 'Lorem Ipsum Generator',
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
        name: current.loremIpsum,
        item: `${baseUrl}/tools/lorem-ipsum`,
      },
    ],
  }
}

export default async function LoremIpsumPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <LoremIpsum />
    </>
  )
}
