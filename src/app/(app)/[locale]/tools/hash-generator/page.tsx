import { Metadata } from 'next'
import { HashGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Hash Generator - Professional Cryptographic Hash Tool | Webiston',
  description:
    'Advanced hash generator supporting MD5, SHA1, SHA256, SHA512 algorithms. Create secure cryptographic hashes for passwords, files, data integrity verification.',
  keywords: [
    'hash generator',
    'hash generatori',
    'MD5 hash',
    'SHA1 hash',
    'SHA256 hash',
    'SHA512 hash',
    'cryptographic hash',
    'password hash',
    'data integrity',
    'checksum calculator',
    'message digest',
    'hash function',
    'secure hash',
    'text to hash',
    'file hash',
    'hash verification',
    'digital fingerprint',
    'hash yaratish',
    'kriptografik hash',
    'xavfsiz hash',
    'fayl hash',
    "ma'lumot butunligi",
    'parol hash',
    'hash tekshirish',
    'security tool',
    'developer tool',
    'blockchain hash',
    'bitcoin hash',
    'ethereum hash',
    'hash comparison',
    'bulk hash generation',
    'batch hash processing',
    'professional hash tool',
    'enterprise hash',
    'hash analytics',
    'webiston tools',
    'foydali vositalar',
    'online hash tool',
    'free hash generator',
  ],
  openGraph: {
    title: 'Hash Generator - MD5, SHA256, SHA512 Tool | Webiston',
    description:
      'MD5, SHA1, SHA256, SHA512 hash yaratish tool. Generate secure cryptographic hashes with professional features.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Hash Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hash Generator - MD5, SHA256, SHA512 Tool',
    description: 'MD5, SHA1, SHA256, SHA512 hash yaratish tool. Generate secure cryptographic hashes.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/tools/hash-generator',
    languages: { 'uz-UZ': '/tools/hash-generator', 'en-US': '/tools/hash-generator' },
  },
  robots: { index: true, follow: true },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Hash Generator',
  description: 'MD5, SHA1, SHA256, SHA512 hash yaratish va kriptografik hash generator vositasi',
  url: 'https://webiston.uz/tools/hash-generator',
  applicationCategory: 'SecurityApplication',
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
    'MD5 Hash Generation',
    'SHA1 Hash Generation',
    'SHA256 Hash Generation',
    'SHA512 Hash Generation',
    'File Hash Support',
    'Security Recommendations',
    'Multiple Algorithm Support',
    'Professional Interface',
  ],
}

const HashGeneratorPage = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HashGenerator />
    </>
  )
}

export default HashGeneratorPage
