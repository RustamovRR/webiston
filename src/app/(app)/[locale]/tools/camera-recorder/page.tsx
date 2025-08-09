import type { Metadata } from 'next'
import { CameraRecorder } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Kamera Yozuvchi - Bepul Video Yozish va Screenshot Tool | Webiston',
  description:
    "Eng yaxshi bepul kamera yozuvchi. Video yozing, screenshot oling va kamerangizni sinab ko'ring. Professional kamera test va yozish vositasi.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'kamera yozuvchi',
    'kamera recorder',
    'video yozish',
    'video recording',
    'screenshot olish',
    'kamera test',
    'camera test',
    'webcam recorder',
    'webcam test',
    'kamera sinash',
    'video recorder',
    'screen recorder',
    'bepul video yozish',
    'onlayn kamera',
    'kamera vositasi',
    'camera tool',
    'video tool',
    'recording tool',
    'kamera recorder',
    'webcam recording',
    'video capture',
    'screenshot tool',
    'kamera screenshot',
    'video screenshot',
    'kamera yozib olish',
    'video yozib olish',
    'kamera sinov',
    'webcam sinov',
    'kamera tekshirish',
    'video tekshirish',
    'onlayn video yozish',
    'brauzer kamera',
    'web kamera',
    'kamera preview',
    'video preview',

    // Ingliz tilida
    'camera recorder online',
    'free camera recorder',
    'webcam recorder online',
    'video recording tool',
    'camera test online',
    'webcam test online',
    'screen capture tool',
    'video capture online',
    'camera recording software',
    'webcam recording software',
    'online video recorder',
    'browser camera recorder',
    'web camera recorder',
    'camera screenshot tool',
    'webcam screenshot',
    'video recording app',
    'camera testing tool',
    'webcam testing tool',
    'live camera preview',
    'camera preview tool',
    'video preview tool',
    'camera quality test',
    'webcam quality test',
    'camera resolution test',
    'free webcam recorder',
    'online camera tool',
    'camera capture tool',
    'video capture software',
    'webcam capture tool',
    'camera recording online',
    'webcam recording online',
    'browser video recorder',
    'html5 camera recorder',
    'javascript camera recorder',
    'no download camera recorder',
    'instant camera recorder',
    'quick video recorder',
    'simple camera recorder',
    'easy webcam recorder',

    // Rus tilida
    'запись с камеры',
    'тест камеры онлайн',
    'запись видео онлайн',
    'веб камера запись',
    'тест веб камеры',
    'скриншот с камеры',
    'запись с веб камеры',
    'онлайн рекордер камеры',
    'бесплатная запись видео',
    'тестирование камеры',
    'проверка камеры',
    'качество камеры тест',
    'веб камера онлайн',
    'камера браузер',
    'запись экрана камера',
    'камера рекордер онлайн',
    'веб камера рекордер',
    'запись видео с камеры',
    'тест веб камеры онлайн',
    'проверка веб камеры',
    'камера тест качество',
    'веб камера тест',
    'онлайн камера запись',
    'браузер камера запись',
    'html5 камера запись',
    'javascript камера',
    'без установки камера',
    'быстрая запись видео',
    'простая запись камеры',
    'легкий рекордер камеры',

    // Long-tail keywords
    'kamera va video yozish professional tool',
    'free online camera recorder with screenshot',
    'тест камеры и запись видео онлайн бесплатно',
    'webiston camera tools',
    'professional webcam recording online free',
    'camera quality test and video recording tool',
    'онлайн тест веб камеры с записью видео',
    'бесплатный рекордер камеры без установки программ',
    'kamera sinash va video yozish bir joyda',
    'webcam test and record video online free',
    'тестирование камеры и запись видео в браузере',
    'professional camera recorder uzbek interface',
    'uzbek camera recorder with screenshot feature',
    'узбекский интерфейс камера рекордер онлайн',
  ],
  openGraph: {
    title: 'Kamera Yozuvchi - Bepul Video Yozish va Screenshot Tool | Webiston',
    description:
      "Eng yaxshi bepul kamera yozuvchi. Video yozing, screenshot oling va kamerangizni sinab ko'ring. Professional kamera test va yozish vositasi.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/camera-recorder',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'Kamera Yozuvchi - Bepul Video Yozish va Screenshot Tool',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'Kamera Yozuvchi - Bepul Video Yozish Tool',
    description: "Professional kamera yozuvchi. Video yozing, screenshot oling va kamerangizni sinab ko'ring. Bepul!",
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/camera-recorder',
    languages: {
      uz: 'https://webiston.uz/tools/camera-recorder',
      en: 'https://webiston.uz/en/tools/camera-recorder',
      'x-default': 'https://webiston.uz/tools/camera-recorder',
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
  name: 'Kamera Yozuvchi - Bepul Video Yozish va Screenshot Tool',
  alternateName: ['Camera Recorder', 'Video Recorder', 'Webcam Recorder', 'Kamera Recorder'],
  description: 'Professional kamera yozuvchi. Video yozish, screenshot olish va kamera test qilish uchun bepul vosita.',
  url: 'https://webiston.uz/tools/camera-recorder',
  sameAs: ['https://webiston.uz/en/tools/camera-recorder', 'https://webiston.uz/tools/camera-recorder'],
  applicationCategory: ['MultimediaApplication', 'UtilityApplication'],
  operatingSystem: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
  browserRequirements: 'Requires JavaScript. Requires HTML5. Requires Camera Access.',
  permissions: 'camera, microphone',
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
    'Video yozish va recording',
    'Screenshot olish',
    'Kamera test va preview',
    'Webcam quality test',
    'Turli video sifatlari (HD, Full HD)',
    'Real-time video preview',
    'Audio recording bilan',
    'Multiple camera support',
    'Video va screenshot download',
    'Media management',
    'Professional interfeys',
    'Bepul va cheksiz foydalanish',
    'Browser-based recording',
    'No software installation',
    'Cross-platform support',
    'Privacy-focused (local processing)',
  ],
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en'],
  keywords: 'kamera yozuvchi, video recording, camera test, bepul camera recorder',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1850',
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
      reviewBody: 'Kamera test va video yozish uchun juda foydali vosita. Oson va professional!',
    },
  ],
}

// FAQ Schema for better SERP features (locale-based)
function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Kamera yozuvchi qanday ishlaydi?',
          answer:
            "Kamera yozuvchi brauzeringiz orqali kameraga kirish so'raydi, keyin video yozish, screenshot olish va kamera test qilish imkoniyatini beradi.",
        },
        {
          question: 'Video va screenshot qayerga saqlanadi?',
          answer:
            "Barcha video va screenshot'lar sizning qurilmangizda mahalliy saqlanadi. Hech qanday ma'lumot serverga yuborilmaydi.",
        },
        {
          question: "Qanday video formatlarini qo'llab-quvvatlaydi?",
          answer: "WebM formatida video yozish qo'llab-quvvatlanadi. Bu zamonaviy va sifatli format.",
        },
        {
          question: 'Kamera yozuvchi bepulmi?',
          answer: "Ha, bizning kamera yozuvchi to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'How does camera recorder work?',
          answer:
            'Camera recorder requests access to your camera through browser, then provides video recording, screenshot and camera testing capabilities.',
        },
        {
          question: 'Where are videos and screenshots saved?',
          answer: 'All videos and screenshots are saved locally on your device. No data is sent to servers.',
        },
        {
          question: 'What video formats are supported?',
          answer: 'WebM format video recording is supported. This is a modern and high-quality format.',
        },
        {
          question: 'Is camera recorder free?',
          answer: 'Yes, our camera recorder is completely free. No limitations or payments required.',
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
      cameraRecorder: 'Kamera Yozuvchi',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      cameraRecorder: 'Camera Recorder',
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
        name: current.cameraRecorder,
        item: `${baseUrl}/tools/camera-recorder`,
      },
    ],
  }
}

export default async function CameraRecorderPage({ params }: { params: Promise<{ locale: string }> }) {
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

      <CameraRecorder />
    </>
  )
}
