import { LotinKirillConverter } from '@/components'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Lotin-Kirill O'giruvchi | Webiston",
  description:
    "O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'girib beradigan onlayn tool. Lotin va kirill alifbosida yozilgan matnlarni tezda tarjima qiling.",
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
    'Foydali qurollar',
  ],
  openGraph: {
    title: "Lotin-Kirill O'giruvchi | Webiston",
    description: "O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'girib beradigan onlayn tool.",
    type: 'website',
    locale: 'uz_UZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lotin-Kirill O'giruvchi | Webiston",
    description: "O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'girib beradigan onlayn tool.",
  },
  alternates: {
    canonical: '/tools/latin-cyrillic',
  },
}

export default function LatinCyrillicPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex-1 p-4">
        <LotinKirillConverter />
      </div>
    </div>
  )
}
