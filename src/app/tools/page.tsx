'use client'

import { Metadata } from 'next'

// export const metadata: Metadata = {
//   title: 'Developer Tools - Dasturlash Vositalari | Webiston',
//   description:
//     'Dasturchilar uchun 20+ foydali vositalar: JSON formatter, Base64 converter, Hash generator, UUID generator, Password generator va boshqalar.',
//   keywords: [
//     'developer tools',
//     'dasturlash vositalari',
//     'json formatter',
//     'base64 converter',
//     'hash generator',
//     'uuid generator',
//     'password generator',
//     'webiston',
//   ],
//   openGraph: {
//     title: 'Developer Tools - Dasturlash Vositalari | Webiston',
//     description:
//       'Dasturchilar uchun 20+ foydali vositalar: JSON formatter, Base64 converter, Hash generator va boshqalar',
//     type: 'website',
//     locale: 'uz_UZ',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Developer Tools - Dasturlash Vositalari | Webiston',
//     description: 'Dasturchilar uchun 20+ foydali vositalar',
//   },
//   alternates: {
//     canonical: '/tools',
//   },
// }

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { TOOL_CATEGORIES, type Tool } from '@/constants'

const ToolsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return TOOL_CATEGORIES
    }

    const query = searchQuery.toLowerCase().trim()

    return TOOL_CATEGORIES.map((category) => ({
      ...category,
      tools: category.tools.filter(
        (tool) => tool.title.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query),
      ),
    })).filter((category) => category.tools.length > 0)
  }, [searchQuery])

  const ToolCard = ({ tool }: { tool: Tool }) => (
    <Link href={tool.href} className="group">
      <Card className="h-full border-zinc-800 bg-zinc-900/80 transition-all duration-200 hover:scale-[1.02] hover:border-zinc-600 hover:bg-zinc-800/80">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tool.color}`}>
              <tool.icon size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white">{tool.title}</h3>
            </div>
          </div>
          <p className="text-sm text-zinc-400 group-hover:text-zinc-300">{tool.description}</p>
        </div>
      </Card>
    </Link>
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">Dasturchi Vositalari</h1>
        <p className="text-lg text-zinc-400">Dasturlash va veb-ishlab chiqish uchun foydali vositalar</p>
      </div>

      {/* Qidiruv */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-md">
          <Search size={20} className="absolute top-1/2 left-3 -translate-y-1/2 transform text-zinc-400" />
          <Input
            type="text"
            placeholder="Vositalarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-zinc-700 bg-zinc-800/50 pl-10 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Vositalar kategoriyalar bo'yicha */}
      <div className="space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-zinc-400">Hech qanday vosita topilmadi</p>
            <p className="mt-2 text-sm text-zinc-500">Qidiruv so'zingizni o'zgartirib ko'ring</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.id}>
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-zinc-100">{category.title}</h2>
                <p className="text-zinc-400">{category.description}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.tools.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Statistika */}
      {!searchQuery && (
        <div className="mt-16 text-center">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-zinc-100">
                {TOOL_CATEGORIES.reduce((acc, cat) => acc + cat.tools.length, 0)}
              </div>
              <div className="text-zinc-400">Jami vositalar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-100">{TOOL_CATEGORIES.length}</div>
              <div className="text-zinc-400">Kategoriyalar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-100">100%</div>
              <div className="text-zinc-400">Bepul</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolsPage
