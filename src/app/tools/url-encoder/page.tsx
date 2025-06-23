import { Metadata } from 'next'
import { UrlEncoder } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'URL Encoder/Decoder - URL Kodlash va Dekodlash Vositasi | Webiston',
  description:
    "Professional URL encoder/decoder vositasi. URL manzillarini xavfsiz formatga kodlash va dekodlash. Percent encoding, query parametrlari, form ma'lumotlarini kodlash.",
  keywords: [
    'URL encoder',
    'URL decoder',
    'URL kodlash',
    'URL dekodlash',
    'Percent encoding',
    'URL encoding',
    'URI encoder',
    'URL escape',
    'URL unescape',
    'Encode URL',
    'Decode URL',
    'URL converter',
    'URL formatter',
    'Web URL encoder',
    'Query string encoder',
    'URI encoding',
    'Character encoding',
    'Form data encoding',
    'API URL encoding',
    'Web development tools',
    'Developer tools',
    'URL validation',
    'URL parser',
    'URL analyzer',
    'Webiston tools',
    'Foydali qurollar',
    'Web tools',
    'Online tools',
  ],
  openGraph: {
    title: 'URL Encoder/Decoder - Professional URL Kodlash Vositasi | Webiston',
    description:
      "URL manzillarini xavfsiz formatga kodlash va dekodlash. Percent encoding, query parametrlari va form ma'lumotlarini kodlash uchun professional vosita.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/tools/url-encoder-og.png',
        width: 1200,
        height: 630,
        alt: 'URL Encoder/Decoder - Webiston',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Encoder/Decoder - Professional URL Kodlash Vositasi',
    description: 'URL manzillarini xavfsiz formatga kodlash va dekodlash uchun professional vosita.',
    images: ['/tools/url-encoder-twitter.png'],
    site: '@webiston_uz',
    creator: '@webiston_uz',
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/url-encoder',
    languages: {
      'uz-UZ': 'https://webiston.uz/tools/url-encoder',
      'en-US': 'https://webiston.uz/en/tools/url-encoder',
      'ru-RU': 'https://webiston.uz/ru/tools/url-encoder',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  authors: [
    {
      name: 'Webiston',
      url: 'https://webiston.uz',
    },
  ],
  creator: 'Webiston',
  publisher: 'Webiston',
  applicationName: 'Webiston Tools',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  category: 'Technology',
  classification: 'Web Development Tools',
  other: {
    'application-name': 'URL Encoder/Decoder',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'URL Encoder',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#18181b',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#18181b',
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
