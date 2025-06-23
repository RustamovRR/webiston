import { Metadata } from 'next'
import { Base64Converter } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Base64 Converter - Base64 O'giruvchi | Webiston",
  description:
    "Matnlarni Base64 formatiga va aksincha o'girib beradigan onlayn tool. Encode va decode text to/from Base64 format instantly. Free online Base64 encoder decoder.",
  keywords: [
    'Base64 converter',
    'Base64 encoder',
    'Base64 decoder',
    "Base64 o'giruvchi",
    'Matn kodlash',
    'Text encoding',
    'Base64 encode decode',
    'Online encoder',
    'Developer tools',
    'Dasturlash vositalari',
    'Webiston tools',
    'Foydali qurollar',
    'String converter',
    'Text converter',
    'URL safe encoding',
  ],
  openGraph: {
    title: "Base64 Converter - Base64 O'giruvchi | Webiston",
    description:
      "Matnlarni Base64 formatiga va aksincha o'girib beradigan onlayn tool. Encode va decode text to/from Base64 format instantly.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Base64 Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Base64 Converter - Base64 O'giruvchi",
    description: "Matnlarni Base64 formatiga va aksincha o'girib beradigan onlayn tool.",
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
