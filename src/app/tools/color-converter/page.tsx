import type { Metadata } from 'next'
import { ColorConverter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Color Converter - Rang Konvertatsiya Vositasi | Webiston',
  description:
    'HEX, RGB, HSL formatlar orasida rang konvertatsiyasi. Rang palitralari generatsiyasi va professional rang moslamalari uchun onlayn vosita.',
  keywords: [
    'color converter',
    'hex to rgb',
    'rgb to hsl',
    'rang konvertatsiyasi',
    'color palette generator',
    'rang palitra',
    'design tools',
    'web development',
    'css colors',
    'color picker',
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
    canonical: '/tools/color-converter',
  },
  openGraph: {
    title: 'Color Converter - Professional Rang Konvertatsiya Vositasi',
    description:
      'HEX, RGB, HSL formatlar orasida rang konvertatsiyasi. Rang palitralari generatsiyasi va professional rang moslamalari.',
    url: '/tools/color-converter',
    siteName: 'Webiston',
    images: [
      {
        url: '/tools-preview.png',
        width: 1200,
        height: 630,
        alt: 'Color Converter Tool Preview',
      },
    ],
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Converter | Webiston',
    description: 'Professional rang konvertatsiya va palette generatsiya vositasi. HEX, RGB, HSL formatlar.',
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
  name: 'Color Converter',
  description: 'Professional rang konvertatsiya va palette generatsiya vositasi',
  url: 'https://webiston.uz/tools/color-converter',
  applicationCategory: 'DesignApplication',
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
    'HEX to RGB conversion',
    'RGB to HSL conversion',
    'Color palette generation',
    'Preset color library',
    'Random color generator',
    'Palette download functionality',
    'Monochromatic palette',
    'Analogous palette',
    'Complementary palette',
  ],
}

export default function ColorConverterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ColorConverter />
    </>
  )
}
