import { Metadata } from 'next'
import { UrlEncoder } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'URL Kodlash va Dekodlash Tool | URL Encoder/Decoder - Webiston',
  description:
    "URL manzillarini xavfsiz formatga kodlash va dekodlash tool. Percent encoding, query parametrlar va form ma'lumotlarini kodlash. Bepul onlayn URL encoder/decoder vositasi.",
  keywords: [
    'URL kodlash',
    'URL encoder',
    'URL dekodlash',
    'URL decoder',
    'URL kodlash tool',
    'URL encoding',
    'URL dekodlash tool',
    'URL decoding',
    'Percent encoding',
    'Percent kodlash',
    'URI encoder',
    'URI kodlovchi',
    'URL escape',
    'URL unescape',
    'URL konverter',
    'URL converter',
    'URL formatlash',
    'URL formatter',
    'Veb URL kodlovchi',
    'Web URL encoder',
    'Query string encoder',
    'Qidiruv qatori kodlash',
    'URI encoding',
    'URI kodlash',
    'Character encoding',
    'Belgilar kodlash',
    'Form data encoding',
    'Forma malumotlari kodlash',
    'API URL encoding',
    'API URL kodlash',
    'Veb dasturlash vositalari',
    'Web development tools',
    'Dasturchi vositalari',
    'Developer tools',
    'URL validation',
    'URL tekshirish',
    'URL parser',
    'URL tahlilchi',
    'URL analyzer',
    'URL analizator',
    'Webiston tools',
    'Foydali qurollar',
    'Utility tools',
    'Veb qurollar',
    'Web tools',
    'Onlayn qurollar',
    'Online tools',
  ],
  openGraph: {
    title: 'URL Kodlash va Dekodlash Tool | URL Encoder/Decoder - Webiston',
    description:
      "URL manzillarini xavfsiz formatga kodlash va dekodlash tool. Percent encoding, query parametrlar va form ma'lumotlarini kodlash.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'URL Kodlash va Dekodlash Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Kodlash va Dekodlash Tool | URL Encoder/Decoder',
    description: 'URL manzillarini xavfsiz formatga kodlash va dekodlash tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/url-encoder',
    languages: {
      'uz-UZ': '/tools/url-encoder',
      'en-US': '/tools/url-encoder',
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
}

// JSON-LD structured data for better SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'URL Encoder/Decoder',
  description: 'Professional URL encoder/decoder tool for web developers',
  url: 'https://webiston.uz/tools/url-encoder',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  permissions: 'No special permissions required',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Webiston',
    url: 'https://webiston.uz',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Webiston',
    logo: {
      '@type': 'ImageObject',
      url: 'https://webiston.uz/logo.png',
    },
  },
  featureList: [
    'URL Encoding/Decoding',
    'Percent Encoding',
    'Query String Processing',
    'Form Data Encoding',
    'Real-time Conversion',
    'File Upload Support',
    'URL Validation',
    'Batch Processing',
  ],
  softwareVersion: '1.0.0',
  dateCreated: '2024-01-01',
  dateModified: new Date().toISOString(),
  inLanguage: ['uz', 'en', 'ru'],
  isAccessibleForFree: true,
  creator: {
    '@type': 'Organization',
    name: 'Webiston',
  },
}

const UrlEncoderPage = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <UrlEncoder />
    </>
  )
}

export default UrlEncoderPage
