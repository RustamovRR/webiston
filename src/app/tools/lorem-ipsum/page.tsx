import { Metadata } from 'next'
import { LoremIpsum } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generatori - Lorem Ipsum Generator | Webiston',
  description:
    'Lorem Ipsum matn generatori. Placeholder matnlar yaratish tool. Generate Lorem Ipsum text for design and development. Free lorem ipsum generator.',
  keywords: [
    'Lorem Ipsum',
    'Lorem Ipsum generator',
    'Placeholder text',
    'Lorem Ipsum generatori',
    'Dummy text',
    'Sample text',
    'Filler text',
    'Lorem Ipsum yaratish',
    'Design placeholder',
    'Text generator',
    'Lorem Ipsum matn',
    'Prototype text',
    'Layout text',
    'Mock text',
    'Lorem generator',
    'Placeholder content',
    'Developer tools',
    'Design tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'Lorem Ipsum Generatori - Lorem Ipsum Generator | Webiston',
    description:
      'Lorem Ipsum matn generatori. Placeholder matnlar yaratish tool. Generate Lorem Ipsum text for design and development.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lorem Ipsum Generatori',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lorem Ipsum Generatori - Lorem Ipsum Generator',
    description: 'Lorem Ipsum matn generatori. Placeholder matnlar yaratish tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/lorem-ipsum',
    languages: {
      'uz-UZ': '/tools/lorem-ipsum',
      'en-US': '/tools/lorem-ipsum',
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

const LoremIpsumPage = () => {
  return <LoremIpsum />
}

export default LoremIpsumPage
