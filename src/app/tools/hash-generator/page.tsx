import { Metadata } from 'next'
import { HashGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Hash Generatori - Hash Generator Tool | Webiston',
  description:
    'Matnlardan MD5, SHA-1, SHA-256, SHA-512 hash yaratuvchi tool. Generate cryptographic hashes from text: MD5, SHA-1, SHA-256, SHA-512. Free online hash generator.',
  keywords: [
    'Hash generator',
    'Hash generatori',
    'MD5 hash',
    'SHA-1 hash',
    'SHA-256 hash',
    'SHA-512 hash',
    'Cryptographic hash',
    'Hash function',
    'Checksum generator',
    'Text to hash',
    'Kriptografik hash',
    'Hash yaratish',
    'Security hash',
    'Data integrity',
    'Hash calculator',
    'Message digest',
    'Developer tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'Hash Generatori - Hash Generator Tool | Webiston',
    description:
      'Matnlardan MD5, SHA-1, SHA-256, SHA-512 hash yaratuvchi tool. Generate cryptographic hashes from text.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hash Generatori',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hash Generatori - Hash Generator Tool',
    description: 'Matnlardan MD5, SHA-1, SHA-256, SHA-512 hash yaratuvchi tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/hash-generator',
    languages: {
      'uz-UZ': '/tools/hash-generator',
      'en-US': '/tools/hash-generator',
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

const HashGeneratorPage = () => {
  return <HashGenerator />
}

export default HashGeneratorPage
