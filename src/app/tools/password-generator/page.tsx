import type { Metadata } from 'next'
import { PasswordGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Password Generator - Xavfsiz Parol Yaratish Tool | Webiston',
  description:
    'Xavfsiz va kuchli parollar yaratish vositasi. Generate strong, secure passwords with customizable options. Professional password generator tool.',
  keywords: [
    'password generator',
    'parol yaratuvchi',
    'secure password',
    'xavfsiz parol',
    'strong password',
    'kuchli parol',
    'random password',
    'cybersecurity',
    'password security',
    'webiston tools',
    'foydali qurollar',
  ],
  openGraph: {
    title: 'Password Generator - Xavfsiz Parol Yaratish Tool | Webiston',
    description:
      'Xavfsiz va kuchli parollar yaratish vositasi. Generate strong, secure passwords with customizable options.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Password Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Password Generator - Professional Security Tool',
    description: 'Xavfsiz parollar yaratish professional vositasi. Custom settings bilan.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/tools/password-generator',
    languages: { 'uz-UZ': '/tools/password-generator', 'en-US': '/tools/password-generator' },
  },
  robots: { index: true, follow: true },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Password Generator',
  description: 'Xavfsiz va kuchli parollar yaratish uchun professional vosita',
  url: 'https://webiston.uz/tools/password-generator',
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
    'Random Password Generation',
    'Memorable Password Creation',
    'Custom Length Settings',
    'Character Type Options',
    'Password Strength Analysis',
    'Professional Interface',
  ],
}

export default function PasswordGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PasswordGenerator />
    </>
  )
}
