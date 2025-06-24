import type { Metadata } from 'next'
import { ColorConverter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Color Converter - Rang Konvertatsiya Tool | Webiston',
  description:
    'HEX, RGB, HSL ranglarni konvertatsiya qilish va palette yaratish tool. Convert colors between HEX, RGB, HSL formats and generate color palettes.',
  keywords: [
    'color converter',
    'rang konvertatsiyasi',
    'hex to rgb',
    'rgb to hsl',
    'color palette',
    'rang palitra',
    'color picker',
    'design tools',
    'webiston tools',
    'foydali qurollar',
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
    languages: { 'uz-UZ': '/tools/color-converter', 'en-US': '/tools/color-converter' },
  },
  openGraph: {
    title: 'Color Converter - Rang Konvertatsiya Tool | Webiston',
    description:
      'HEX, RGB, HSL ranglarni konvertatsiya qilish va palette yaratish tool. Convert colors and generate palettes.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Color Converter Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Converter - Rang Konvertatsiya Tool',
    description: 'HEX, RGB, HSL ranglarni konvertatsiya qilish va palette yaratish tool.',
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
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
