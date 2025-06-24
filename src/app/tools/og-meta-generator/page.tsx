import type { Metadata } from 'next'
import { OgMetaGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'OG Meta Generator - Open Graph Meta Tag Tool | Webiston',
  description:
    'Open Graph va Twitter Card meta teglarini yaratish vositasi. Generate Open Graph and Twitter Card meta tags for social media sharing.',
  keywords: [
    'OG meta generator',
    'Open Graph generator',
    'meta tag yaratuvchi',
    'Twitter Card generator',
    'social media meta',
    'OG teglar',
    'SEO meta tags',
    'ijtimoiy tarmoq',
    'meta generator',
    'webiston tools',
    'foydali qurollar',
  ],
  openGraph: {
    title: 'OG Meta Generator - Open Graph Meta Tag Tool | Webiston',
    description:
      'Open Graph va Twitter Card meta teglarini yaratish vositasi. Generate professional meta tags for social media sharing.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'OG Meta Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OG Meta Generator - Professional Meta Tool',
    description: 'Open Graph va Twitter Card meta teglarini professional tool bilan yarating.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/tools/og-meta-generator',
    languages: { 'uz-UZ': '/tools/og-meta-generator', 'en-US': '/tools/og-meta-generator' },
  },
  robots: { index: true, follow: true },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'OG Meta Generator',
  description: 'Open Graph va Twitter Card meta teglarini yaratish uchun professional vosita',
  url: 'https://webiston.uz/tools/og-meta-generator',
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
    'Open Graph Meta Generation',
    'Twitter Card Support',
    'SEO Optimization',
    'Social Media Preview',
    'Template Library',
    'Professional Interface',
  ],
}

export default function OgMetaGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <OgMetaGenerator />
    </>
  )
}
