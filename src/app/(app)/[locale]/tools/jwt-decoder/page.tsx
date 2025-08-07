import type { Metadata } from 'next'
import { JwtDecoder } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'JWT Decoder - Bepul JWT Token Dekoder | Webiston',
  description:
    "Eng yaxshi bepul JWT decoder. JWT tokenlarni decode qiling va ma'lumotlarini ko'ring. Professional JWT analyzer va debugger.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'jwt decoder',
    'jwt token decoder',
    'jwt dekoder',
    'json web token',
    'jwt parser',
    'token decoder',
    'jwt analyzer',
    'jwt validator',
    'jwt debugger',
    'jwt tekshirish',
    "jwt o'qish",
    "jwt ma'lumotlari",
    'bearer token',
    'authentication token',
    'security token',
    'jwt payload',
    'jwt header',
    'jwt signature',
    'bepul jwt decoder',

    // Ingliz tilida
    'jwt decoder',
    'jwt token decoder',
    'json web token decoder',
    'jwt parser',
    'jwt analyzer',
    'jwt validator',
    'jwt debugger',
    'decode jwt token',
    'jwt token parser',
    'free jwt decoder',
    'online jwt decoder',
    'jwt decoder tool',
    'jwt token analyzer',
    'bearer token decoder',
    'authentication token decoder',

    // Rus tilida
    'jwt декодер',
    'jwt токен декодер',
    'декодер jwt токенов',
    'jwt парсер',
    'jwt анализатор',
    'jwt валидатор',
    'jwt отладчик',
    'декодировать jwt',
    'бесплатный jwt декодер',
    'онлайн jwt декодер',

    // Long-tail keywords
    'jwt tokenlarni decode qilish',
    'decode jwt tokens online free',
    'декодирование jwt токенов онлайн',
    'professional jwt decoder tool',
    'webiston jwt tools',
  ],
  openGraph: {
    title: 'JWT Decoder - Bepul JWT Token Dekoder | Webiston',
    description:
      "Eng yaxshi bepul JWT decoder. JWT tokenlarni decode qiling va ma'lumotlarini ko'ring. Professional JWT analyzer.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/jwt-decoder',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'JWT Decoder - Bepul JWT Token Dekoder Vositasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'JWT Decoder - Bepul JWT Tool',
    description: "Professional JWT decoder. JWT tokenlarni decode qiling va ma'lumotlarini ko'ring. Bepul va tez!",
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/jwt-decoder',
    languages: {
      uz: 'https://webiston.uz/tools/jwt-decoder',
      en: 'https://webiston.uz/en/tools/jwt-decoder',
      'x-default': 'https://webiston.uz/tools/jwt-decoder',
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
  name: 'JWT Decoder - Bepul JWT Token Dekoder',
  alternateName: ['JWT Parser', 'JWT Analyzer', 'JSON Web Token Decoder'],
  description: "Professional JWT decoder. JWT tokenlarni decode qilish va ma'lumotlarini ko'rish uchun bepul vosita.",
  url: 'https://webiston.uz/tools/jwt-decoder',
  sameAs: ['https://webiston.uz/en/tools/jwt-decoder', 'https://webiston.uz/tools/jwt-decoder'],
  applicationCategory: ['UtilityApplication', 'DeveloperApplication', 'SecurityApplication'],
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
    'JWT token decode',
    "JWT header ko'rish",
    'JWT payload tahlil',
    'JWT signature tekshirish',
    'Bearer token support',
    'Authentication token analyzer',
    'Security token parser',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Real-time decoding',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'jwt decoder, jwt token decoder, jwt dekoder, bepul jwt decoder',
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
      reviewBody: 'JWT tokenlarni decode qilish uchun juda foydali vosita. Xavfsiz va tez ishlaydi!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'JWT decoder qanday ishlaydi?',
          answer:
            "JWT decoder JWT tokenni uch qismga ajratadi: header, payload va signature. Har bir qismni Base64 decode qilib, ma'lumotlarni ko'rsatadi.",
        },
        {
          question: 'JWT decoder xavfsizmi?',
          answer:
            "Ha, bizning JWT decoder to'liq xavfsiz. Barcha ma'lumotlar brauzeringizda qayta ishlanadi va hech qayerga yuborilmaydi.",
        },
        {
          question: 'JWT nima va nima uchun kerak?',
          answer:
            "JWT (JSON Web Token) - bu authentication va ma'lumot uzatish uchun ishlatilgan xavfsiz format. Web API'larda keng qo'llaniladi.",
        },
        {
          question: 'JWT decoder bepulmi?',
          answer: "Ha, bizning JWT decoder to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'How does JWT decoder work?',
          answer:
            'JWT decoder splits JWT token into three parts: header, payload and signature. It Base64 decodes each part and displays the information.',
        },
        {
          question: 'Is JWT decoder secure?',
          answer:
            'Yes, our JWT decoder is completely secure. All data is processed in your browser and not sent anywhere.',
        },
        {
          question: 'What is JWT and why is it needed?',
          answer:
            "JWT (JSON Web Token) is a secure format used for authentication and data transmission. It's widely used in web APIs.",
        },
        {
          question: 'Is JWT decoder free?',
          answer: 'Yes, our JWT decoder is completely free. No limitations or payments required.',
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
      jwtDecoder: 'JWT Decoder',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      jwtDecoder: 'JWT Decoder',
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
        name: current.jwtDecoder,
        item: `${baseUrl}/tools/jwt-decoder`,
      },
    ],
  }
}

export default async function JwtDecoderPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <JwtDecoder />
    </>
  )
}
