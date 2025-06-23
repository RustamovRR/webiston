import { Metadata } from 'next'
import { UrlEncoder } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'URL Encoder/Decoder - URL Kodlash Tool | Webiston',
  description:
    'URL va matnlarni encode/decode qilish tool. Encode and decode URLs and text. Free online URL encoder decoder with percent encoding.',
  keywords: [
    'URL encoder',
    'URL decoder',
    'URL kodlash',
    'Percent encoding',
    'URL encoding',
    'URI encoder',
    'URL escape',
    'URL unescape',
    'Encode URL',
    'Decode URL',
    'URL converter',
    'URL formatter',
    'Web URL encoder',
    'Query string encoder',
    'URI encoding',
    'Character encoding',
    'Developer tools',
    'Web tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'URL Encoder/Decoder - URL Kodlash Tool | Webiston',
    description: 'URL va matnlarni encode/decode qilish tool. Encode and decode URLs and text.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'URL Encoder/Decoder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Encoder/Decoder - URL Kodlash Tool',
    description: 'URL va matnlarni encode/decode qilish tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/url-encoder',
    languages: {
      'uz-UZ': '/tools/url-encoder',
      'en-US': '/tools/url-encoder',
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

const UrlEncoderPage = () => {
  return <UrlEncoder />
}

export default UrlEncoderPage
