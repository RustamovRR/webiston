import { Metadata } from 'next'
import { JsonFormatter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'JSON Formatter - JSON Formatlash Tool | Webiston',
  description:
    "JSON ma'lumotlarini formatlash, validate qilish va beautify qilish tool. Format, validate and beautify JSON data. Free online JSON formatter and validator.",
  keywords: [
    'JSON formatter',
    'JSON validator',
    'JSON beautifier',
    'JSON formatlash',
    'JSON validator',
    'JSON parser',
    'JSON pretty print',
    'JSON minify',
    'JSON compress',
    'JSON viewer',
    'JSON editor',
    'JSON tester',
    'JSON syntax check',
    'Format JSON',
    'Validate JSON',
    'Developer tools',
    'Dasturlash vositalari',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'JSON Formatter - JSON Formatlash Tool | Webiston',
    description:
      "JSON ma'lumotlarini formatlash, validate qilish va beautify qilish tool. Format, validate and beautify JSON data.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JSON Formatter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Formatter - JSON Formatlash Tool',
    description: "JSON ma'lumotlarini formatlash, validate qilish va beautify qilish tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/json-formatter',
    languages: {
      'uz-UZ': '/tools/json-formatter',
      'en-US': '/tools/json-formatter',
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

const JsonFormatterPage = () => {
  return <JsonFormatter />
}

export default JsonFormatterPage
