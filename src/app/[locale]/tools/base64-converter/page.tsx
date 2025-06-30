import { Metadata } from 'next'
import { Base64Converter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Base64 Konverter va Kodlash Tool | Base64 Converter - Webiston',
  description:
    "Matnlarni Base64 formatiga va aksincha o'girish tool. Encode va decode text to/from Base64 format instantly. Bepul onlayn Base64 kodlash va dekodlash vositasi.",
  keywords: [
    'Base64 konverter',
    'Base64 converter',
    'Base64 kodlash',
    'Base64 encoder',
    'Base64 dekodlash',
    'Base64 decoder',
    "Base64 o'giruvchi",
    'Base64 converter tool',
    'Matn kodlash',
    'Text encoding',
    'Matn dekodlash',
    'Text decoding',
    'Base64 encode decode',
    'Base64 kodlash dekodlash',
    'Onlayn kodlovchi',
    'Online encoder',
    'Onlayn dekodlovchi',
    'Online decoder',
    'Dasturchi vositalari',
    'Developer tools',
    'Dasturlash vositalari',
    'Programming tools',
    'Webiston tools',
    'Foydali vositalar',
    'Utility tools',
    'String converter',
    'Matn konverter',
    'Text converter',
    'URL safe encoding',
    'URL xavfsiz kodlash',
    'Binary to text',
    'Binary matn',
  ],
  openGraph: {
    title: 'Base64 Konverter va Kodlash Tool | Base64 Converter - Webiston',
    description:
      "Matnlarni Base64 formatiga va aksincha o'girish tool. Encode va decode text to/from Base64 format instantly.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Base64 Konverter va Kodlash Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base64 Konverter va Kodlash Tool | Base64 Converter',
    description: "Matnlarni Base64 formatiga va aksincha o'girish tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/base64-converter',
    languages: {
      'uz-UZ': '/tools/base64-converter',
      'en-US': '/tools/base64-converter',
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

const Base64ConverterPage = () => {
  return <Base64Converter />
}

export default Base64ConverterPage
