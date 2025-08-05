import React from 'react'
import { useTranslations } from 'next-intl'
import { Download, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatsDisplay, CopyButton } from '@/components/shared'
import { cn } from '@/lib'

interface UuidItem {
  id: string
  uuid: string
  version: string
  format: string
}

interface ResultsPanelProps {
  uuids: UuidItem[]
  outputStats: Array<{ label: string; value: number }>
  onDownloadTxt: () => void
  onDownloadJson: () => void
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ uuids, outputStats, onDownloadTxt, onDownloadJson }) => {
  const t = useTranslations('UuidGeneratorPage.ResultsPanel')

  const canDownload = uuids.length > 0

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', uuids.length > 0 ? 'bg-green-500' : 'bg-zinc-500')}></div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {uuids.length > 0 ? t('statusGenerated') : t('statusEmpty')}
            </span>
          </div>

          {/* Download Buttons */}
          {canDownload && (
            <div className="flex items-center gap-2">
              <Button onClick={onDownloadTxt} variant="outline" size="sm" className="h-8">
                <Download size={14} className="mr-1" />
                {t('downloadTxt')}
              </Button>
              <Button onClick={onDownloadJson} variant="outline" size="sm" className="h-8">
                <Download size={14} className="mr-1" />
                {t('downloadJson')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {uuids.length > 0 && <StatsDisplay stats={outputStats} className="mb-6" />}

        {uuids.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="text-center">
              <Hash className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t('emptyMessage')}</p>
            </div>
          </div>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {uuids.map((item, index) => (
              <div
                key={item.id}
                className="group flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-100/30 p-3 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm break-all text-zinc-800 dark:text-zinc-200">{item.uuid}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t('itemNumber')}
                    {index + 1} • {item.version.toUpperCase()} • {item.format}
                  </div>
                </div>
                <CopyButton
                  text={item.uuid}
                  variant="ghost"
                  size="sm"
                  className="ml-2 opacity-0 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsPanel
