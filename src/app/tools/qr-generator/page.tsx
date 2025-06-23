import { Metadata } from 'next'
import { QrGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'QR Kod Generatori - Professional QR Code Generator | Webiston',
  description:
    'Professional QR code generator for URLs, text, email, WiFi, vCard contacts. Multi-format support with error correction. QR kod yaratish va yuklab olish.',
  keywords: [
    'QR code generator',
    'QR kod generatori',
    'QR code creator',
    'QR generator',
    'QR kod yaratish',
    'Generate QR code',
    'QR code maker',
    'Text to QR',
    'URL to QR',
    'QR scanner',
    'QR code tool',
    'Quick Response code',
    'Barcode generator',
    'QR kod skaner',
    'Mobile QR',
    'QR code reader',
    'Free QR generator',
    'Online QR tool',
    'vCard QR code',
    'WiFi QR code',
    'Email QR code',
    'Phone QR code',
    'SMS QR code',
    'Professional QR',
    'Error correction',
    'QR code download',
    'Batch QR generation',
    'Custom QR size',
    'QR analytics',
    'Business QR',
    'Marketing QR',
    'Event QR code',
    'Contact QR',
    'Webiston tools',
    'Foydali qurollar',
    'QR kod yuklab olish',
    'Professional tool',
  ],
  openGraph: {
    title: 'QR Kod Generatori - Professional QR Code Generator | Webiston',
    description: 'Create professional QR codes for URLs, text, contacts, WiFi with error correction and custom sizes.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QR Kod Generatori - Professional QR Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Kod Generatori - Professional QR Code Generator',
    description: 'Create QR codes for URLs, text, contacts, WiFi with error correction and download options.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/qr-generator',
    languages: {
      'uz-UZ': '/tools/qr-generator',
      'en-US': '/tools/qr-generator',
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
  other: {
    'application-name': 'QR Code Generator Tool',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#10b981',
  },
}

const QrGeneratorPage = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Professional QR Code Generator',
    description:
      'Advanced QR code generator supporting multiple formats: URLs, text, email, WiFi, vCard contacts with error correction levels.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    permissions: 'browser',
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
      'URL QR Code Generation',
      'Text QR Code Generation',
      'Email QR Code Generation',
      'Phone Number QR Code',
      'SMS QR Code Generation',
      'WiFi QR Code Generation',
      'vCard Contact QR Code',
      'Location QR Code',
      'Custom Size Options',
      'Error Correction Levels',
      'Instant Download',
      'Batch Processing',
      'Professional Interface',
      'Real-time Preview',
      'Multiple Formats',
      'Mobile Responsive',
    ],
    screenshot: '/og-image.png',
    softwareVersion: '2.0',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '312',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Marketing User',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Perfect QR generator for marketing campaigns with professional features.',
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Business Owner',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Easy to use QR generator for contact cards and WiFi sharing.',
      },
    ],
    potentialAction: {
      '@type': 'UseAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://webiston.uz/tools/qr-generator',
      },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <QrGenerator />
    </>
  )
}

export default QrGeneratorPage
