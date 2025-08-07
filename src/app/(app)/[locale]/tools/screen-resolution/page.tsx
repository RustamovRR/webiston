import type { Metadata } from 'next'
import { ScreenResolution } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Ekran O'lchami - Bepul Screen Resolution Detector | Webiston",
  description:
    "Eng yaxshi bepul screen resolution detector. Ekran o'lchami, rezolutsiya va displey ma'lumotlarini real vaqtda ko'rish. Monitor testi va viewport o'lchami.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    "ekran o'lchami",
    'ekran rezolutsiyasi',
    "ekran o'lchami tekshirish",
    "ekran o'lchami aniqlash",
    "monitor o'lchami",
    'monitor rezolutsiyasi',
    'monitor testi',
    "displey ma'lumotlari",
    "displey o'lchami",
    "viewport o'lchami",
    'viewport size',
    "qurilma o'lchami",
    "qurilma ma'lumotlari",
    'fullscreen test',
    "to'liq ekran testi",
    'piksel nisbati',
    'pixel ratio',
    'retina displey',
    'retina display',
    'bepul ekran testi',
    'onlayn ekran testi',
    'ekran vositasi',
    'ekran tool',

    // Ingliz tilida
    'screen resolution',
    'screen resolution detector',
    'screen resolution checker',
    'screen size detector',
    'display resolution',
    'monitor resolution',
    'monitor size',
    'screen dimensions',
    'display dimensions',
    'viewport size',
    'viewport dimensions',
    'screen test',
    'monitor test',
    'display test',
    'resolution test',
    'screen info',
    'display info',
    'device resolution',
    'browser viewport',
    'responsive design',
    'pixel ratio',
    'device pixel ratio',
    'retina display',
    'high dpi display',
    'screen density',
    'free screen test',
    'online screen test',
    'screen resolution tool',
    'web developer tools',

    // Rus tilida
    'разрешение экрана',
    'детектор разрешения экрана',
    'размер экрана',
    'разрешение монитора',
    'размер монитора',
    'тест экрана',
    'тест монитора',
    'информация о дисплее',
    'размеры экрана',
    'размер viewport',
    'соотношение пикселей',
    'retina дисплей',
    'плотность экрана',
    'бесплатный тест экрана',
    'онлайн тест экрана',
    'инструмент разрешения экрана',

    // Long-tail keywords
    "ekran o'lchami va rezolutsiya real vaqtda",
    'professional screen resolution detector free',
    'детектор разрешения экрана онлайн бесплатно',
    'webiston screen tools',
    'responsive design screen test tool',
    'monitor viewport resolution checker online',
  ],
  openGraph: {
    title: "Ekran O'lchami - Bepul Screen Resolution Detector | Webiston",
    description:
      "Eng yaxshi bepul screen resolution detector. Ekran o'lchami, rezolutsiya va displey ma'lumotlarini real vaqtda ko'rish. Monitor testi va viewport o'lchami.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/screen-resolution',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: "Ekran O'lchami - Bepul Screen Resolution Detector",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: "Ekran O'lchami - Bepul Screen Resolution",
    description:
      "Professional screen resolution detector. Ekran o'lchami va displey ma'lumotlarini real vaqtda ko'ring!",
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/screen-resolution',
    languages: {
      uz: 'https://webiston.uz/tools/screen-resolution',
      en: 'https://webiston.uz/en/tools/screen-resolution',
      'x-default': 'https://webiston.uz/tools/screen-resolution',
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
  name: "Ekran O'lchami - Bepul Screen Resolution Detector",
  alternateName: ['Screen Resolution Detector', 'Monitor Test', "Ekran O'lchami Tekshirish"],
  description:
    "Professional screen resolution detector. Ekran o'lchami, rezolutsiya va displey ma'lumotlarini real vaqtda ko'rish uchun bepul vosita.",
  url: 'https://webiston.uz/tools/screen-resolution',
  sameAs: ['https://webiston.uz/en/tools/screen-resolution', 'https://webiston.uz/tools/screen-resolution'],
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
    "Ekran o'lchami aniqlash",
    'Monitor rezolutsiyasi',
    "Viewport o'lchami",
    'Pixel ratio aniqlash',
    'Retina display aniqlash',
    "Displey ma'lumotlari",
    "Qurilma o'lchami",
    'Fullscreen test',
    "To'liq ekran testi",
    'Real-time monitoring',
    'Real vaqtda kuzatish',
    'Responsive design test',
    'Browser viewport info',
    'Screen density info',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    "Aniq ma'lumotlar",
    'Cross-platform support',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: "ekran o'lchami, screen resolution, monitor testi, bepul screen detector",
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.6',
    ratingCount: '1200',
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
      reviewBody: "Ekran o'lchami va rezolutsiya haqida ma'lumot olish uchun juda foydali vosita. Aniq va tez!",
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Screen resolution detector nima va nima uchun kerak?',
          answer:
            "Screen resolution detector - bu ekran o'lchami, rezolutsiya va displey ma'lumotlarini aniqlash vositasi. Veb dizayn, responsive design va texnik muammolarni hal qilish uchun foydali.",
        },
        {
          question: "Qanday ma'lumotlarni ko'rish mumkin?",
          answer:
            "Ekran o'lchami, monitor rezolutsiyasi, viewport o'lchami, pixel ratio, retina display va boshqa displey ma'lumotlarini ko'rish mumkin.",
        },
        {
          question: 'Screen resolution detector xavfsizmi?',
          answer:
            "Ha, bizning screen resolution detector to'liq xavfsiz. Barcha ma'lumotlar brauzeringizda ko'rsatiladi va hech qayerga yuborilmaydi.",
        },
        {
          question: 'Screen resolution detector bepulmi?',
          answer:
            "Ha, bizning screen resolution detector to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'What is screen resolution detector and why is it needed?',
          answer:
            'Screen resolution detector is a tool to identify screen size, resolution and display information. Useful for web design, responsive design and troubleshooting technical issues.',
        },
        {
          question: 'What information can I see?',
          answer:
            'You can see screen size, monitor resolution, viewport size, pixel ratio, retina display and other display information.',
        },
        {
          question: 'Is screen resolution detector secure?',
          answer:
            'Yes, our screen resolution detector is completely secure. All information is displayed in your browser and not sent anywhere.',
        },
        {
          question: 'Is screen resolution detector free?',
          answer: 'Yes, our screen resolution detector is completely free. No limitations or payments required.',
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
      screenResolution: "Ekran O'lchami",
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      screenResolution: 'Screen Resolution',
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
        name: current.screenResolution,
        item: `${baseUrl}/tools/screen-resolution`,
      },
    ],
  }
}

export default async function ScreenResolutionPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <ScreenResolution />
    </>
  )
}
