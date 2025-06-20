import { Card } from '@/components'
import { TOOLS_LIST } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foydali Qurollar | Webiston',
  description:
    "Dasturlash va matn ishlatish uchun foydali onlayn qurollar to'plami. Lotin-Kirill o'giruvchi va boshqa utility tool'lar.",
  keywords: [
    'Foydali qurollar',
    'Onlayn tools',
    'Utility tools',
    'Lotin Kirill',
    'Text converter',
    'Developer tools',
    'Webiston tools',
    "O'zbek tools",
  ],
  openGraph: {
    title: 'Foydali Qurollar | Webiston',
    description: "Dasturlash va matn ishlatish uchun foydali onlayn qurollar to'plami.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foydali Qurollar | Webiston',
    description: "Dasturlash va matn ishlatish uchun foydali onlayn qurollar to'plami.",
  },
  alternates: {
    canonical: '/tools',
  },
}

export default function ToolsPage() {
  return (
    <div className="w-full px-16 pb-16 max-sm:px-6">
      <header className="mt-8 flex flex-col items-center p-10 pt-20 text-center max-lg:px-0">
        <h1 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-6xl font-extrabold text-transparent max-lg:text-4xl">
          Foydali Qurollar
        </h1>
        <p className="mx-auto max-w-[750px] text-xl text-gray-600 dark:text-gray-300">
          Dasturlash va matn ishlatish uchun foydali onlayn qurollar to'plami. Barcha tool'lar bepul va qulay
          foydalanish uchun mo'ljallangan.
        </p>
      </header>

      <section className="mt-12 flex w-full flex-col gap-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {TOOLS_LIST.map((tool, index) => (
            <Card key={index} href={tool.href} title={tool.title} description={tool.description} />
          ))}
        </div>
      </section>
    </div>
  )
}
