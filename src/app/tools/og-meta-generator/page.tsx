import { Metadata } from 'next'
import { OgMetaGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'OG Meta Generatori - Open Graph Meta Tag Generator | Webiston',
  description:
    'Open Graph va Twitter Card meta teglarini yaratish tool. Generate Open Graph and Twitter Card meta tags for better social media sharing.',
  keywords: [
    'OG meta generator',
    'Open Graph generator',
    'Meta tag generator',
    'Twitter Card generator',
    'Social media meta tags',
    'OG tags',
    'Facebook meta tags',
    'Twitter meta tags',
    'SEO meta tags',
    'Social sharing tags',
    'Meta teglar',
    'Open Graph teglar',
    'Social media optimization',
    'Website meta tags',
    'HTML meta generator',
    'Social preview',
    'Developer tools',
    'SEO tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'OG Meta Generatori - Open Graph Meta Tag Generator | Webiston',
    description:
      'Open Graph va Twitter Card meta teglarini yaratish tool. Generate Open Graph and Twitter Card meta tags for better social media sharing.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OG Meta Generatori',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OG Meta Generatori - Open Graph Meta Tag Generator',
    description: 'Open Graph va Twitter Card meta teglarini yaratish tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/og-meta-generator',
    languages: {
      'uz-UZ': '/tools/og-meta-generator',
      'en-US': '/tools/og-meta-generator',
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

const OgMetaGeneratorPage = () => {
  return <OgMetaGenerator />
}

export default OgMetaGeneratorPage
