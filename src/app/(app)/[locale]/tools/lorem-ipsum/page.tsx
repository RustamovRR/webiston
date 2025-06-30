import type { Metadata } from 'next'
import { LoremIpsum } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Placeholder Matn Yaratuvchi | Webiston',
  description:
    'Professional Lorem Ipsum generator. Create placeholder text for design and development projects. Lorem ipsum matn yaratuvchi - dizayn va dasturlash uchun.',
  keywords: [
    'lorem ipsum generator',
    'placeholder text generator',
    'lorem ipsum yaratish',
    'placeholder matn',
    'matn generatori',
    'dummy text generator',
    'lorem ipsum text',
    'design placeholder',
    'typography testing',
    'webiston tools',
    'foydali vositalar',
  ],
  openGraph: {
    title: 'Lorem Ipsum Generator - Professional Placeholder Text Tool | Webiston',
    description:
      'Professional Lorem Ipsum generator with multiple text types. Create placeholder content for web design and development.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Lorem Ipsum Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lorem Ipsum Generator - Professional Placeholder Tool',
    description: 'Professional Lorem Ipsum generator for design and development projects.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/tools/lorem-ipsum',
    languages: { 'uz-UZ': '/tools/lorem-ipsum', 'en-US': '/tools/lorem-ipsum' },
  },
  robots: { index: true, follow: true },
}

const LoremIpsumPage = () => {
  return <LoremIpsum />
}

export default LoremIpsumPage
