import type { Metadata } from 'next'
import { UuidGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'UUID Generator - Noyob Identifikator Yaratuvchi | Webiston',
  description:
    'Professional UUID generator vositasi. UUID v4, v1, NIL formatlar. Noyob identifikatorlar yaratish, turli formatlar va versiyalar bilan.',
  keywords: [
    'UUID generator',
    'UUID yaratuvchi',
    'unique identifier',
    'GUID generator',
    'UUID v4',
    'UUID v1',
    'NIL UUID',
    'noyob identifikator',
    'random UUID',
    'timestamp UUID',
    'database ID',
    'session ID',
    'API tracking',
    'file naming',
    'distributed systems',
    'RFC 4122',
    'compact UUID',
    'brackets UUID',
    'UUID formats',
    'UUID validation',
    'developer tools',
    'web development',
    'Webiston tools',
  ],
  authors: [{ name: 'Webiston' }],
  creator: 'Webiston',
  publisher: 'Webiston',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://webiston.uz'),
  alternates: {
    canonical: '/tools/uuid-generator',
  },
  openGraph: {
    title: 'UUID Generator - Professional Noyob Identifikator Yaratuvchi',
    description:
      'UUID v4, v1, NIL formatlar bilan professional identifikatorlar yaratish. Turli formatlar va versiyalar.',
    url: '/tools/uuid-generator',
    siteName: 'Webiston',
    images: [
      {
        url: '/tools-preview.png',
        width: 1200,
        height: 630,
        alt: 'UUID Generator Tool Preview',
      },
    ],
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UUID Generator | Webiston',
    description: 'Professional UUID generator vositasi. UUID v4, v1, NIL formatlar va turli stillar.',
    images: ['/tools-preview.png'],
    creator: '@webiston_uz',
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
}

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'UUID Generator',
  description: 'Professional UUID generator tool for creating unique identifiers',
  url: 'https://webiston.uz/tools/uuid-generator',
  applicationCategory: 'DeveloperApplication',
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
    'UUID v4 generation (random)',
    'UUID v1 generation (timestamp-based)',
    'NIL UUID generation',
    'Multiple format support',
    'Standard UUID format',
    'Compact format (no hyphens)',
    'Brackets format',
    'Uppercase format',
    'Bulk generation (1-1000)',
    'UUID validation',
    'Statistics and analytics',
    'Download as TXT',
    'Download as JSON',
    'Copy individual UUIDs',
    'Copy all UUIDs',
    'Real-time format switching',
  ],
  softwareVersion: '1.0.0',
  dateCreated: '2024-01-01',
  dateModified: new Date().toISOString(),
  inLanguage: ['uz', 'en'],
  isAccessibleForFree: true,
}

export default function UuidGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <UuidGenerator />
    </>
  )
}
