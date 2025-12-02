import type { Metadata } from 'next'
import { CurrencyConverter } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Valyuta Konverteri - Bepul O'zbek Valyuta Kalkulyatori | Webiston",
  description:
    "O'zbekiston va dunyo valyutalarini real-time konvertatsiya qiling. CBU rasmiy kurslar, tarixiy grafiklar, 75+ valyuta. Tez, aniq va bepul!",
  keywords: [
    // O'zbek tilida
    'valyuta konverteri',
    'valyuta kalkulyatori',
    'dollar som kursi',
    'dollar som',
    'usd uzs',
    'rubl som',
    'rub uzs',
    'yevro som',
    'eur uzs',
    'valyuta kursi',
    'valyuta kurslari',
    'cbu kurslari',
    'markaziy bank kurslari',
    "o'zbekiston valyuta",
    'valyuta hisoblash',
    'valyuta calculator',
    'currency converter uzbekistan',
    'valyuta konvertatsiya',
    'valyuta almashtirish',
    'dollar kursi bugun',
    'yevro kursi bugun',
    'rubl kursi bugun',
    'valyuta kursi bugun',
    'valyuta tarixi',
    'valyuta grafik',
    'cross rate',
    'валюта конвертер',
    'курс валют',
    'доллар сум',
    'рубль сум',
    'евро сум',

    // Ingliz tilida
    'currency converter',
    'uzbekistan currency',
    'uzs to usd',
    'usd to uzs',
    'uzbek som converter',
    'uzbekistan exchange rate',
    'cbu rates',
    'central bank uzbekistan',
    'currency calculator',
    'exchange rate calculator',
    'currency exchange',
    'forex converter',
    'money converter',
    'currency rates uzbekistan',

    // Rus tilida
    'конвертер валют узбекистан',
    'курс валют узбекистан',
    'доллар сум курс',
    'рубль сум курс',
    'евро сум курс',
    'калькулятор валют',
    'обмен валют',
    'курсы цб узбекистана',
    'узбекский сум',
    'конвертация валют',
    'курс доллара сегодня',
    'курс евро сегодня',
    'курс рубля сегодня',

    // Long-tail keywords
    'dollar som kursi bugun cbu',
    'valyuta konverteri online bepul',
    'uzbekistan currency converter online',
    'конвертер валют узбекистан онлайн',
    'cbu uz valyuta kurslari',
    'markaziy bank valyuta kurslari',
    'real time currency converter uzbekistan',
    'historical exchange rates uzbekistan',
    'valyuta kursi tarixi grafik',
  ],
  openGraph: {
    title: "Valyuta Konverteri - Bepul O'zbek Valyuta Kalkulyatori | Webiston",
    description:
      '75+ valyutani real-time konvertatsiya qiling. CBU rasmiy kurslar, tarixiy grafiklar, offline rejim. Tez, aniq va bepul!',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/tools/currency-converter',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: 'Valyuta Konverteri - Webiston',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'Valyuta Konverteri - Bepul Kalkulyator',
    description: '75+ valyuta, CBU rasmiy kurslar, tarixiy grafiklar. Tez va bepul!',
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/currency-converter',
    languages: {
      uz: 'https://webiston.uz/tools/currency-converter',
      en: 'https://webiston.uz/en/tools/currency-converter',
      'x-default': 'https://webiston.uz/tools/currency-converter',
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
  category: 'Finance',
  classification: 'Currency Tools',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': ['WebApplication', 'SoftwareApplication', 'FinancialProduct'],
  name: 'Valyuta Konverteri - Webiston',
  alternateName: ['Currency Converter', 'Конвертер валют', 'Valyuta Kalkulyatori'],
  description:
    "Professional valyuta konverteri. 75+ valyuta, CBU rasmiy kurslar, tarixiy grafiklar. O'zbekiston va dunyo valyutalarini real-time konvertatsiya qiling.",
  url: 'https://webiston.uz/tools/currency-converter',
  applicationCategory: ['FinanceApplication', 'UtilityApplication'],
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
    "75+ valyuta qo'llab-quvvatlash",
    'CBU rasmiy kurslar',
    'Real-time konvertatsiya',
    'Tarixiy grafiklar (7/30/90 kun, 1 yil)',
    'Cross-rate hisoblash',
    'Offline rejim',
    'Tez konvertatsiya (mashhur juftliklar)',
    'Mobil qurilmalar uchun optimallashtirilgan',
    'Bepul va cheksiz foydalanish',
    'Xavfsiz va maxfiy',
  ],
  softwareVersion: '1.0',
  datePublished: '2025-01-01',
  dateModified: '2025-01-01',
  inLanguage: ['uz', 'en', 'ru'],
  keywords:
    'valyuta konverteri, currency converter, dollar som, usd uzs, cbu kurslari, valyuta kalkulyatori, конвертер валют',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
}

function generateFAQSchema(locale: string = 'uz') {
  const faqData = {
    uz: {
      questions: [
        {
          question: 'Valyuta konverteri qanday ishlaydi?',
          answer:
            "Bizning vositamiz O'zbekiston Markaziy Bankining rasmiy kurslaridan foydalanadi. Siz miqdor va valyutalarni tanlab, real-time konvertatsiya qilishingiz mumkin. 75+ valyuta qo'llab-quvvatlanadi.",
        },
        {
          question: 'Kurslar qancha tez-tez yangilanadi?',
          answer:
            'CBU kurslarni har kuni ertalab soat 09:00 da yangilaydi. Bizning saytimiz avtomatik ravishda yangi kurslarni oladi va 1 soat davomida cache qiladi.',
        },
        {
          question: 'Nima uchun bankdagi kurs bilan farq bor?',
          answer:
            "Biz CBU ning rasmiy kurslarini ko'rsatamiz. Banklar esa o'z komissiyasini qo'shadi (odatda 1-3%). Shuning uchun real kurs biroz yuqori yoki pastroq bo'lishi mumkin.",
        },
        {
          question: "Tarixiy ma'lumotlarni ko\'rish mumkinmi?",
          answer:
            "Ha! Siz 7 kun, 30 kun, 90 kun yoki 1 yillik tarixiy kurslarni grafik shaklida ko'rishingiz mumkin. Barcha ma'lumotlar CBU arxividan olinadi.",
        },
      ],
    },
    en: {
      questions: [
        {
          question: 'How does the currency converter work?',
          answer:
            'Our tool uses official rates from the Central Bank of Uzbekistan. You can select amount and currencies for real-time conversion. 75+ currencies supported.',
        },
        {
          question: 'How often are rates updated?',
          answer:
            'CBU updates rates daily at 09:00 AM. Our site automatically fetches new rates and caches them for 1 hour.',
        },
        {
          question: 'Why is there a difference with bank rates?',
          answer:
            'We show official CBU rates. Banks add their commission (usually 1-3%). So real rates may be slightly higher or lower.',
        },
        {
          question: 'Can I view historical data?',
          answer:
            'Yes! You can view historical rates for 7 days, 30 days, 90 days, or 1 year in chart format. All data is from CBU archive.',
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

function generateBreadcrumbSchema(locale: string = 'uz') {
  const breadcrumbData = {
    uz: {
      home: 'Bosh sahifa',
      tools: 'Vositalar',
      currencyConverter: 'Valyuta Konverteri',
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      currencyConverter: 'Currency Converter',
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
        name: current.currencyConverter,
        item: `${baseUrl}/tools/currency-converter`,
      },
    ],
  }
}

export default async function CurrencyConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) || { locale: 'uz' }

  const faqSchema = generateFAQSchema(locale)
  const breadcrumbSchema = generateBreadcrumbSchema(locale)

  return (
    <>
      {/* Main Application Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <CurrencyConverter />
    </>
  )
}
