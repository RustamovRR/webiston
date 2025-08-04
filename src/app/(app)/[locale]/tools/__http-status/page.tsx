import { Metadata } from 'next'
import { HttpStatus } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'HTTP Status Kodlari - HTTP Status Codes Reference | Webiston',
  description:
    "Barcha HTTP status kodlari va ularning ma'nolarini o'rganing. Complete HTTP status codes reference with descriptions and examples.",
  keywords: [
    'HTTP status codes',
    'HTTP status kodlari',
    '404 error',
    '500 error',
    '200 OK',
    '301 redirect',
    'HTTP response codes',
    'Server status',
    'Web development',
    'API status codes',
    'HTTP reference',
    'Status code meaning',
    'Web developer tools',
    'HTTP protocol',
    'REST API',
    'Web debugging',
    'Webiston tools',
    'Foydali vositalar',
  ],
  openGraph: {
    title: 'HTTP Status Kodlari - HTTP Status Codes Reference | Webiston',
    description:
      "Barcha HTTP status kodlari va ularning ma'nolarini o'rganing. Complete HTTP status codes reference with descriptions.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HTTP Status Kodlari',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTTP Status Kodlari - HTTP Status Codes Reference',
    description: "Barcha HTTP status kodlari va ularning ma'nolarini o'rganing. Complete HTTP status codes reference.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/http-status',
    languages: {
      'uz-UZ': '/tools/http-status',
      'en-US': '/tools/http-status',
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

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'HTTP Status Kodlari - HTTP Status Codes Reference',
  description: "Barcha HTTP status kodlari va ularning ma'nolarini o'rganing",
  url: 'https://webiston.uz/tools/http-status',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
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
  featureList: [
    'Complete HTTP Status Codes Reference',
    'Category-based Organization',
    'Search and Filter Functionality',
    'Detailed Descriptions',
    'Real-world Examples',
    'Professional Interface',
  ],
}

const HttpStatusPage = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HttpStatus />
    </>
  )
}

export default HttpStatusPage
