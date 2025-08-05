'use client'

import { useTranslations } from 'next-intl'

interface ResolutionCategory {
  name: string
  resolution: string
}

interface ResolutionCategoriesPanelProps {
  categories: ResolutionCategory[]
  currentCategory?: string
}

const ResolutionCategoriesPanel: React.FC<ResolutionCategoriesPanelProps> = ({ categories, currentCategory }) => {
  const t = useTranslations('ScreenResolutionPage.ResolutionCategories')

  return (
    <div className="rounded-lg border border-zinc-200 bg-white/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">{t('title')}</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
              currentCategory === category.name
                ? 'border border-blue-500/30 bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/20'
                : 'bg-zinc-100/50 dark:bg-zinc-800/30'
            }`}
          >
            <div>
              <div className="font-medium text-zinc-700 dark:text-zinc-300">{category.name}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">{category.resolution}</div>
            </div>
            {currentCategory === category.name && (
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResolutionCategoriesPanel
