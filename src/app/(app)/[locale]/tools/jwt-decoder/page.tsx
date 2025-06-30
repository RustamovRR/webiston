import { Metadata } from 'next'
import { JwtDecoder } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'JWT Decoder - JWT Token Dekoder | Webiston',
  description:
    "JWT tokenlarni decode qilish va ma'lumotlarini ko'rish tool. Decode JWT tokens and view their contents. Free online JWT decoder and analyzer.",
  keywords: [
    'JWT decoder',
    'JWT token decoder',
    'JWT dekoder',
    'JSON Web Token',
    'JWT parser',
    'Token decoder',
    'JWT analyzer',
    'JWT validator',
    'JWT debugger',
    'Token parser',
    'JWT payload',
    'JWT header',
    'JWT signature',
    'Authentication token',
    'Bearer token',
    'Security token',
    'Developer tools',
    'Dasturlash vositalari',
    'Webiston tools',
    'Foydali vositalar',
  ],
  openGraph: {
    title: 'JWT Decoder - JWT Token Dekoder | Webiston',
    description:
      "JWT tokenlarni decode qilish va ma'lumotlarini ko'rish tool. Decode JWT tokens and view their contents.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JWT Decoder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JWT Decoder - JWT Token Dekoder',
    description: "JWT tokenlarni decode qilish va ma'lumotlarini ko'rish tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/jwt-decoder',
    languages: {
      'uz-UZ': '/tools/jwt-decoder',
      'en-US': '/tools/jwt-decoder',
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

const JwtDecoderPage = () => {
  return <JwtDecoder />
}

export default JwtDecoderPage
