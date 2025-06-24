import { Metadata } from 'next'
import { JsonFormatter } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'JSON Formatlash va Tekshirish Tool | JSON Formatter - Webiston',
  description:
    "JSON ma'lumotlarini formatlash, tekshirish va optimallashtirish tool. Format, validate and beautify JSON data. Bepul onlayn JSON formatlash va tekshirish vositasi.",
  keywords: [
    'JSON formatlash',
    'JSON formatter',
    'JSON tekshirish',
    'JSON validator',
    'JSON chiroylash',
    'JSON beautifier',
    'JSON formatlash tool',
    'JSON validator',
    'JSON parser',
    "JSON chiroyli ko'rinish",
    'JSON pretty print',
    'JSON minify',
    'JSON siqish',
    'JSON compress',
    "JSON ko'rish",
    'JSON viewer',
    'JSON tahrirlash',
    'JSON editor',
    'JSON test',
    'JSON tester',
    'JSON sintaksis tekshirish',
    'JSON syntax check',
    'JSON formatlash',
    'Format JSON',
    'JSON tekshirish',
    'Validate JSON',
    'Dasturchi vositalari',
    'Developer tools',
    'Dasturlash qurollari',
    'Webiston tools',
    'Foydali qurollar',
    'Utility tools',
  ],
  openGraph: {
    title: 'JSON Formatlash va Tekshirish Tool | JSON Formatter - Webiston',
    description:
      "JSON ma'lumotlarini formatlash, tekshirish va optimallashtirish tool. Format, validate and beautify JSON data.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JSON Formatlash va Tekshirish Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Formatlash va Tekshirish Tool | JSON Formatter',
    description: "JSON ma'lumotlarini formatlash, tekshirish va optimallashtirish tool.",
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
