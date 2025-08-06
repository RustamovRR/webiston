'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { Search, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuroraText, GradientTabs } from '@/components/ui'
import { TOOLS_LIST, TOOL_CATEGORIES, FILTER_OPTIONS, AUDIENCE_FILTERS, type Tool } from '@/constants'
import { useTranslations } from 'next-intl'

const ToolsMainPage = () => {
  const tMain = useTranslations('ToolsPage.Main')
  const tTools = useTranslations('Tools')
  const tCategories = useTranslations('ToolCategories')
  const tFilters = useTranslations('Filters')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAudience, setSelectedAudience] = useState('all')
  const hasAnimated = useRef(false)

  useEffect(() => {
    hasAnimated.current = true
  }, [])

  const allTools = useMemo(() => TOOLS_LIST, [])

  const filteredTools = useMemo(() => {
    let tools = allTools

    // Filter by category
    if (selectedCategory !== 'all') {
      tools = tools.filter((tool) => tool.category === selectedCategory)
    }

    // Filter by audience
    if (selectedAudience !== 'all') {
      tools = tools.filter((tool) => tool.audience === selectedAudience)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      tools = tools.filter((tool) => {
        const title = tTools(`${tool.tKey}.title`).toLowerCase()
        const description = tTools(`${tool.tKey}.description`).toLowerCase()
        return title.includes(query) || description.includes(query)
      })
    }

    return tools
  }, [searchQuery, selectedCategory, selectedAudience, allTools, tTools])

  const getCategoryLabel = (category: string) => {
    return tCategories(`${category}.title`)
  }

  const getAudienceColor = (audience: string) => {
    return audience === 'developer'
      ? 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/20 dark:text-blue-400'
      : 'bg-green-500/20 text-green-400 dark:bg-green-500/20 dark:text-green-400'
  }

  const ToolCard = ({ tool }: { tool: Tool }) => (
    <Link href={tool.href} className="group">
      <Card className="relative h-full border-zinc-200 bg-white/80 transition-all duration-200 hover:scale-[1.02] hover:border-zinc-300 hover:bg-white hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80">
        <div className="p-6">
          {/* Audience badge - top left */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className={`border-0 text-xs ${getAudienceColor(tool.audience)}`}>
              {tool.audience === 'developer' ? tMain('audienceDeveloper') : tMain('audienceGeneral')}
            </Badge>
          </div>

          {/* Category badge - top right */}
          <div className="absolute top-4 right-4">
            <Badge
              variant="secondary"
              className="border-zinc-300 bg-zinc-100/80 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400"
            >
              {getCategoryLabel(tool.category)}
            </Badge>
          </div>

          <div className="mt-6 mb-4 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${tool.color} opacity-80 transition-opacity group-hover:opacity-100`}
            >
              <tool.icon size={24} className="dark:text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg leading-tight font-semibold text-zinc-900 transition-colors group-hover:text-zinc-800 dark:text-zinc-100 dark:group-hover:text-white">
                {tTools(`${tool.tKey}.title`)}
              </h3>
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-zinc-600 transition-colors group-hover:text-zinc-500 dark:text-zinc-400 dark:group-hover:text-zinc-300">
            {tTools(`${tool.tKey}.description`)}
          </p>
        </div>
      </Card>
    </Link>
  )

  return (
    <motion.div
      className="mx-auto w-full max-w-7xl px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="mb-8 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 animate-pulse text-blue-400" />
          <h1 className="relative text-4xl font-bold">
            <AuroraText>{tMain('title')}</AuroraText>
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-center text-lg text-zinc-600 dark:text-zinc-400">{tMain('description')}</p>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">{tMain('filterByCategory')}</h3>
        <div className="flex justify-center">
          <GradientTabs
            options={FILTER_OPTIONS.map((option) => ({
              value: option.value,
              label: tFilters(option.value === 'all' ? 'allTools' : option.value),
              icon: <option.icon size={16} />,
            }))}
            value={selectedCategory}
            onChange={setSelectedCategory}
            toolCategory="utilities"
            size="md"
          />
        </div>
      </motion.div>

      {/* Audience Filters */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h3 className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">{tMain('filterByAudience')}</h3>
        <div className="flex justify-center gap-2">
          {AUDIENCE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedAudience(filter.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                selectedAudience === filter.value
                  ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tFilters(filter.value)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative mx-auto max-w-md">
          <Search
            size={20}
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-zinc-500 dark:text-zinc-400"
          />
          <Input
            type="text"
            placeholder={tMain('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-zinc-300 bg-white/50 pl-10 text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          {tMain('resultsFound', { count: filteredTools.length })}
        </p>
      </motion.div>

      {/* Tools Grid */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {filteredTools.length === 0 ? (
          <motion.div
            className="py-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-lg text-zinc-600 dark:text-zinc-400">{tMain('noResults')}</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">{tMain('noResultsHint')}</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.href}
                  layout
                  initial={hasAnimated.current ? false : { opacity: 0, y: 20, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: hasAnimated.current ? 0.2 : 0.4,
                      delay: hasAnimated.current ? 0 : index * 0.1,
                      ease: 'easeOut',
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2 },
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Statistics */}
      {!searchQuery && selectedCategory === 'all' && selectedAudience === 'all' && (
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {TOOL_CATEGORIES.reduce((acc, cat) => acc + cat.tools.length, 0)}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">{tMain('totalTools')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{TOOL_CATEGORIES.length}</div>
              <div className="text-zinc-600 dark:text-zinc-400">{tMain('categories')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {TOOL_CATEGORIES.flatMap((cat) => cat.tools).filter((tool) => tool.audience === 'general').length}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">{tMain('generalTools')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {TOOL_CATEGORIES.flatMap((cat) => cat.tools).filter((tool) => tool.audience === 'developer').length}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">{tMain('developerTools')}</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ToolsMainPage
