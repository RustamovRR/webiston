import { Metadata } from 'next'
import { ColorConverter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Rang Konverteri - Color Converter Tool | Webiston',
  description:
    "Ranglarni turli formatlarga o'girib beruvchi tool: HEX, RGB, HSL, HSV. Convert colors between different formats. Free online color converter and picker.",
  keywords: [
    'Color converter',
    'Rang konverteri',
    'HEX to RGB',
    'RGB to HEX',
    'HSL converter',
    'HSV converter',
    'Color picker',
    'Rang tanlash',
    'Color formats',
    'Rang formatlari',
    'CSS colors',
    'Web colors',
    'Color palette',
    'Color codes',
    'Hex colors',
    'RGB colors',
    'Developer tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'Rang Konverteri - Color Converter Tool | Webiston',
    description:
      "Ranglarni turli formatlarga o'girib beruvchi tool: HEX, RGB, HSL, HSV. Convert colors between different formats.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rang Konverteri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rang Konverteri - Color Converter Tool',
    description: "Ranglarni turli formatlarga o'girib beruvchi tool: HEX, RGB, HSL, HSV.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/color-converter',
    languages: {
      'uz-UZ': '/tools/color-converter',
      'en-US': '/tools/color-converter',
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

const ColorConverterPage = () => {
  return <ColorConverter />
}

export default ColorConverterPage
