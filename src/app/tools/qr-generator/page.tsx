import { Metadata } from 'next'
import { QrGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'QR Kod Generatori - QR Code Generator | Webiston',
  description:
    "Matn, URL va ma'lumotlardan QR kod yaratish tool. Generate QR codes from text, URLs and data. Free online QR code generator and creator.",
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
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'QR Kod Generatori - QR Code Generator | Webiston',
    description: "Matn, URL va ma'lumotlardan QR kod yaratish tool. Generate QR codes from text, URLs and data.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QR Kod Generatori',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Kod Generatori - QR Code Generator',
    description: "Matn, URL va ma'lumotlardan QR kod yaratish tool.",
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
}

const QrGeneratorPage = () => {
  return <QrGenerator />
}

export default QrGeneratorPage
