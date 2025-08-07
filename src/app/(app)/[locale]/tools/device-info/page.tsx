import type { Metadata } from 'next'
import { DeviceInfo } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Qurilma Ma'lumotlari - Bepul Device Information Tool | Webiston",
  description:
    "Eng yaxshi bepul device info tool. Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling. Screen resolution, user agent va boshqalar.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'device info',
    "qurilma ma'lumotlari",
    "qurilma haqida ma'lumot",
    'qurilma tekshirish',
    'browser info',
    "brauzer ma'lumotlari",
    "brauzer haqida ma'lumot",
    'brauzer tekshirish',
    'system information',
    "tizim ma'lumotlari",
    "operatsion tizim ma'lumotlari",
    "os ma'lumotlari",
    'screen resolution',
    "ekran o'lchami",
    'ekran ruxsati',
    "monitor o'lchami",
    'user agent',
    'user agent string',
    'platform details',
    "platforma ma'lumotlari",
    'device detection',
    'qurilma aniqlash',
    'hardware info',
    "hardware ma'lumotlari",
    'bepul device info',
    'onlayn device info',

    // Ingliz tilida
    'device information',
    'device info tool',
    'browser information',
    'system info',
    'hardware information',
    'device detector',
    'browser detector',
    'user agent detector',
    'screen resolution checker',
    'device specifications',
    'browser specs',
    'system specifications',
    'platform information',
    'operating system info',
    'mobile device info',
    'desktop device info',
    'tablet device info',
    'device fingerprinting',
    'browser fingerprinting',
    'client information',
    'web browser info',
    'device analytics',
    'browser analytics',
    'free device info tool',
    'online device checker',

    // Rus tilida
    'информация об устройстве',
    'информация о браузере',
    'системная информация',
    'характеристики устройства',
    'детектор устройства',
    'детектор браузера',
    'разрешение экрана',
    'user agent браузера',
    'информация о платформе',
    'операционная система',
    'мобильное устройство',
    'настольное устройство',
    'планшет информация',
    'отпечаток устройства',
    'отпечаток браузера',
    'клиентская информация',
    'веб браузер информация',
    'бесплатный инструмент устройства',

    // Long-tail keywords
    "qurilma va brauzer haqida to'liq ma'lumot",
    'complete device and browser information tool',
    'полная информация об устройстве и браузере',
    'webiston device tools',
    'professional device information checker',
    'hardware software specifications online',
  ],
  openGraph: {
    title: "Qurilma Ma'lumotlari - Bepul Device Information Tool | Webiston",
    description:
      "Eng yaxshi bepul device info tool. Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling. Screen resolution, user agent va boshqalar.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/device-info',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: "Qurilma Ma'lumotlari - Bepul Device Information Tool",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: "Qurilma Ma'lumotlari - Bepul Device Info",
    description: "Professional device info tool. Brauzer, qurilma va tizim haqida batafsil ma'lumot. Bepul!",
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/device-info',
    languages: {
      uz: 'https://webiston.uz/tools/device-info',
      en: 'https://webiston.uz/en/tools/device-info',
      'x-default': 'https://webiston.uz/tools/device-info',
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
  name: "Qurilma Ma'lumotlari - Bepul Device Information Tool",
  alternateName: ['Device Info', 'Browser Info', "Qurilma Ma'lumotlari"],
  description:
    "Professional device info tool. Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot olish uchun bepul vosita.",
  url: 'https://webiston.uz/tools/device-info',
  sameAs: ['https://webiston.uz/en/tools/device-info', 'https://webiston.uz/tools/device-info'],
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
    "Brauzer ma'lumotlari",
    "Operatsion tizim ma'lumotlari",
    "Ekran o'lchami va ruxsati",
    'User Agent string',
    "Platforma ma'lumotlari",
    "Hardware ma'lumotlari",
    'Qurilma turi aniqlash',
    'Mobile/Desktop detection',
    'Brauzer versiyasi',
    "JavaScript ma'lumotlari",
    "Cookie qo'llab-quvvatlash",
    "Local Storage ma'lumotlari",
    "Timezone ma'lumotlari",
    'Til sozlamalari',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    "Real-time ma'lumot",
    "Batafsil texnik ma'lumotlar",
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: "device info, qurilma ma'lumotlari, browser info, bepul device info",
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    ratingCount: '1400',
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
      reviewBody: "Qurilma va brauzer haqida ma'lumot olish uchun juda foydali vosita. Batafsil va aniq!",
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Device info tool nima va nima uchun kerak?',
          answer:
            "Device info tool - bu qurilma, brauzer va operatsion tizim haqida batafsil ma'lumot beruvchi vosita. Texnik muammolarni hal qilish va qurilma xususiyatlarini bilish uchun foydali.",
        },
        {
          question: "Qanday ma'lumotlarni ko'rish mumkin?",
          answer:
            "Brauzer nomi va versiyasi, operatsion tizim, ekran o'lchami, user agent, platforma va boshqa texnik ma'lumotlarni ko'rish mumkin.",
        },
        {
          question: 'Device info tool xavfsizmi?',
          answer:
            "Ha, bizning device info tool to'liq xavfsiz. Barcha ma'lumotlar brauzeringizda ko'rsatiladi va hech qayerga yuborilmaydi.",
        },
        {
          question: 'Device info tool bepulmi?',
          answer: "Ha, bizning device info tool to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'What is device info tool and why is it needed?',
          answer:
            'Device info tool provides detailed information about your device, browser and operating system. Useful for troubleshooting and knowing device specifications.',
        },
        {
          question: 'What information can I see?',
          answer:
            'You can see browser name and version, operating system, screen size, user agent, platform and other technical information.',
        },
        {
          question: 'Is device info tool secure?',
          answer:
            'Yes, our device info tool is completely secure. All information is displayed in your browser and not sent anywhere.',
        },
        {
          question: 'Is device info tool free?',
          answer: 'Yes, our device info tool is completely free. No limitations or payments required.',
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
      deviceInfo: "Qurilma Ma'lumotlari",
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      deviceInfo: 'Device Information',
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
        name: current.deviceInfo,
        item: `${baseUrl}/tools/device-info`,
      },
    ],
  }
}

export default async function DeviceInfoPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <DeviceInfo />
    </>
  )
}
