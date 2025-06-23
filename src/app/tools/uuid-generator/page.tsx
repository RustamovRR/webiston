import { Metadata } from 'next'
import { UuidGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'UUID Generatori - UUID Generator Tool | Webiston',
  description:
    'Noyob UUID (Universally Unique Identifier) yaratish tool. Generate unique UUIDs for your applications. Free online UUID generator.',
  keywords: [
    'UUID generator',
    'UUID generatori',
    'GUID generator',
    'Unique identifier',
    'UUID creator',
    'UUID yaratish',
    'Random UUID',
    'UUID maker',
    'Universally Unique Identifier',
    'Globally Unique Identifier',
    'UUID v4',
    'Random identifier',
    'Unique ID generator',
    'Database ID',
    'Primary key generator',
    'Developer tools',
    'Dasturlash vositalari',
    'Programming tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'UUID Generatori - UUID Generator Tool | Webiston',
    description:
      'Noyob UUID (Universally Unique Identifier) yaratish tool. Generate unique UUIDs for your applications.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'UUID Generatori',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UUID Generatori - UUID Generator Tool',
    description: 'Noyob UUID (Universally Unique Identifier) yaratish tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/uuid-generator',
    languages: {
      'uz-UZ': '/tools/uuid-generator',
      'en-US': '/tools/uuid-generator',
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

const UuidGeneratorPage = () => {
  return <UuidGenerator />
}

export default UuidGeneratorPage
