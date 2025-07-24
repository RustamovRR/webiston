import React from 'react'
import { useTranslations } from 'next-intl'
import { NumberTicker } from '@/components/ui/number-ticker'

interface StatsData {
  total: number
  unique: number
  duplicates: number
  bytes: number
}

interface StatsPanelProps {
  stats: StatsData
  isVisible: boolean
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, isVisible }) => {
  const t = useTranslations('UuidGeneratorPage.ResultsPanel')
  const tPanel = useTranslations('UuidGeneratorPage.StatsPanel')

  if (!isVisible) return null

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">{tPanel('title')}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            <NumberTicker value={stats.total} />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('totalLabel')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            <NumberTicker value={stats.unique} />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('uniqueLabel')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            <NumberTicker value={stats.duplicates} />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('duplicatesLabel')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            <NumberTicker value={stats.bytes} />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('bytesLabel')}</div>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
