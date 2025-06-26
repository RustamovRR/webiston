import { Metadata } from 'next'
import { MicrophoneTestClient } from './MicrophoneTestClient'

export const metadata: Metadata = {
  title: 'Mikrofon Test - Microphone Test Tool | Webiston',
  description:
    "Mikrofoningizni sinab ko'ring, audio sifatini tekshiring va real-time visualizatsiya ko'ring. Test your microphone quality with real-time audio visualization.",
  keywords: [
    'Microphone test',
    'Mikrofon test',
    'Audio test',
    'Microphone tester',
    'Audio quality test',
    'Voice test',
    'Sound test',
    'Audio recording test',
    'Mic test',
    'Audio visualization',
    'Real-time audio',
    'Sound quality',
    'Audio levels',
    'Voice recording',
    'Microphone quality',
    'Audio spectrum',
    'Sound analyzer',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'Mikrofon Test - Microphone Test Tool | Webiston',
    description:
      "Mikrofoningizni sinab ko'ring, audio sifatini tekshiring va real-time visualizatsiya ko'ring. Test your microphone quality.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mikrofon Test',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mikrofon Test - Microphone Test Tool',
    description: "Mikrofoningizni sinab ko'ring, audio sifatini tekshiring va real-time visualizatsiya ko'ring.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/microphone-test',
    languages: {
      'uz-UZ': '/tools/microphone-test',
      'en-US': '/tools/microphone-test',
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

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Mikrofon Test - Microphone Test Tool',
  description: "Mikrofoningizni sinab ko'ring, audio sifatini tekshiring va real-time visualizatsiya ko'ring",
  url: 'https://webiston.uz/tools/microphone-test',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  permissions: 'microphone',
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
    'Microphone Testing',
    'Audio Quality Analysis',
    'Real-time Visualization',
    'Audio Recording',
    'Multiple Device Support',
    'Professional Interface',
  ],
}

const MicrophoneTestPage = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MicrophoneTestClient />
    </>
  )
}

export default MicrophoneTestPage
