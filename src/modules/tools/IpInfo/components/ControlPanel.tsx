'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { StatsDisplay } from '@/components/shared/StatsDisplay'
import { MapPin, RefreshCw, Search, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ControlPanelProps {
  ipAddress: string
  isLoading: boolean
  error: string | null
  canDownload: boolean
  isEmpty: boolean
  stats: Array<{ label: string; value: number }>
  onIpAddressChange: (value: string) => void
  onAnalyze: () => void
  onLoadCurrentIP: () => void
  onClear: () => void
  onDownload: () => void
  hasCurrentIP: boolean
}

export default function ControlPanel({
  ipAddress,
  isLoading,
  error,
  canDownload,
  isEmpty,
  stats,
  onIpAddressChange,
  onAnalyze,
  onLoadCurrentIP,
  onClear,
  onDownload,
  hasCurrentIP,
}: ControlPanelProps) {
  const t = useTranslations('IpInfoPage.ControlPanel')

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          onClick={onLoadCurrentIP}
          variant="outline"
          size="sm"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 dark:border-blue-400/50 dark:text-blue-300 dark:hover:bg-blue-400/10"
          disabled={!hasCurrentIP}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {t('currentIpButton')}
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('clearButton')}
        </Button>
        {canDownload && (
          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10 dark:border-green-400/50 dark:text-green-300 dark:hover:bg-green-400/10"
          >
            <Download className="mr-2 h-4 w-4" />
            {t('downloadButton')}
          </Button>
        )}
      </div>

      {/* Terminal Input Panel */}
      <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{t('title')}</span>
        </div>

        {/* Input Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <Input
                placeholder={t('inputPlaceholder')}
                value={ipAddress}
                onChange={(e) => onIpAddressChange(e.target.value)}
                className="border-zinc-300 bg-zinc-50/50 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-800/50"
              />
              {error && (
                <p className="mt-2 flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400"></div>
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <StatsDisplay stats={stats} />
              <ShimmerButton
                onClick={onAnalyze}
                disabled={isEmpty || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 disabled:text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? t('loadingStatus') : t('analyzeButton')}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
