import type { Metadata } from 'next'
import { QrGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'QR Kod Generator - QR Code Yaratish Tool | Webiston',
  description:
    'QR kod yaratish uchun professional vosita. URL, matn, kontakt, WiFi uchun QR kodlar. Generate QR codes for URLs, text, contacts, WiFi.',
  keywords: [
    'QR code generator',
    'QR kod generatori',
    'QR kod yaratish',
    'QR generator',
    'URL to QR',
    'Text to QR',
    'WiFi QR code',
    'vCard QR',
    'professional qr',
    'webiston tools',
    'foydali vositalar',
  ],
  openGraph: {
    title: 'QR Kod Generator - QR Code Yaratish Tool | Webiston',
    description:
      'QR kod yaratish uchun professional vosita. URL, matn, kontakt, WiFi uchun QR kodlar. Generate QR codes for URLs, text, contacts.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'QR Kod Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Kod Generator - Professional QR Tool',
    description: 'QR kod yaratish professional vositasi. URL, matn, kontakt uchun QR kodlar.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/tools/qr-generator',
    languages: { 'uz-UZ': '/tools/qr-generator', 'en-US': '/tools/qr-generator' },
  },
  robots: { index: true, follow: true },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QR Code Generator',
  description: 'QR kod yaratish uchun professional vosita - URL, matn, kontakt, WiFi uchun',
  url: 'https://webiston.uz/tools/qr-generator',
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
    'URL QR Generation',
    'Text QR Generation',
    'Contact QR Generation',
    'WiFi QR Generation',
    'Custom Size Options',
    'Error Correction',
    'Professional Interface',
  ],
}

export default function QrGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <QrGenerator />
    </>
  )
}
