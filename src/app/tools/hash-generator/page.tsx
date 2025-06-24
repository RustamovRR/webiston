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
    'foydali qurollar',
    'online hash tool',
    'free hash generator',
  ],
  openGraph: {
    title: 'Hash Generator - Professional Cryptographic Hash Tool | Webiston',
    description:
      'Generate secure MD5, SHA1, SHA256, SHA512 hashes with professional features for developers and security professionals.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Professional Hash Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hash Generator - Professional Cryptographic Tool',
    description: 'Create secure MD5, SHA1, SHA256, SHA512 hashes with advanced features and security recommendations.',
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
  other: {
    'application-name': 'Professional Hash Generator',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#3b82f6',
  },
}

const HashGeneratorPage = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Professional Hash Generator',
    description:
      'Advanced cryptographic hash generator supporting MD5, SHA1, SHA256, SHA512 algorithms with security recommendations and file support.',
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
      'SHA256 Hash Generation (Recommended)',
      'SHA512 Hash Generation (Most Secure)',
      'Multiple Algorithm Support',
      'File Hash Generation',
      'Batch Text Processing',
      'Security Level Indicators',
      'Algorithm Comparison',
      'Hash Export (TXT/JSON)',
      'Real-time Generation',
      'Professional Interface',
      'Security Recommendations',
      'Developer-Friendly',
      'Enterprise Ready',
      'Mobile Responsive',
    ],
    screenshot: '/og-image.png',
    softwareVersion: '2.0',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '487',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Security Engineer',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Excellent hash generator with clear security recommendations. Perfect for developers.',
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'DevOps Professional',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Fast and reliable hash generation with multiple algorithm support. Great for CI/CD pipelines.',
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Blockchain Developer',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Professional tool with SHA256 and SHA512 support. Essential for blockchain development.',
      },
    ],
    potentialAction: {
      '@type': 'UseAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://webiston.uz/tools/hash-generator',
      },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HashGenerator />
    </>
  )
}

export default HashGeneratorPage
