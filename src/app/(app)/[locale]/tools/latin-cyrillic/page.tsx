import { Metadata } from 'next'
import { LatinCyrillic } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Lotin-Kirill O'giruvchi | Latin-Cyrillic Converter | Webiston",
  description:
    "O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'girib beradigan professional onlayn tool. Convert Uzbek text between Latin and Cyrillic scripts instantly and accurately.",
  keywords: [
    'Lotin Kirill',
    'Latin Cyrillic',
    "O'zbek yozuvi",
    'Lotin kirill converter',
    'Uzbek transliteration',
    "O'zbek alifbosi",
    'Kirill lotin',
    'Text converter',
    'Uzbek script',
    "Onlayn o'giruvchi",
    'Webiston tools',
    'Foydali vositalar',
    'Uzbek alphabet converter',
    'Latin to Cyrillic',
    'Cyrillic to Latin',
    'Uzbek text converter',
    'Script converter',
    'Language tools',
    // Russian keywords
    'узбекский транслит',
    'латиница кириллица узбекский',
    'конвертер узбекского алфавита',
    'перевод с латиницы на кириллицу узбекский',
    'узбекская раскладка',
    'кириллица в латиницу',
    'онлайн-конвертер узбекский',
  ],
  openGraph: {
    title: "Lotin-Kirill O'giruvchi | Latin-Cyrillic Converter | Webiston",
    description:
      "O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'girib beradigan onlayn tool. Convert Uzbek text between Latin and Cyrillic scripts.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Lotin-Kirill O'giruvchi",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lotin-Kirill O'giruvchi | Latin-Cyrillic Converter",
    description: "O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'girib beradigan onlayn tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/latin-cyrillic',
    languages: {
      'uz-UZ': '/tools/latin-cyrillic',
      'en-US': '/en/tools/latin-cyrillic',
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

const LatinCyrillicPage = () => {
  return <LatinCyrillic />
}

export default LatinCyrillicPage
