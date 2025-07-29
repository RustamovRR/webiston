'use client'

import { RefreshCw, Copy, Download, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui'

interface ControlPanelProps {
  isLoading: boolean
  copied: string | null
  onRefresh: () => void
  onCopyAll: () => void
  onDownload: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({ isLoading, copied, onRefresh, onCopyAll, onDownload }) => {
  const t = useTranslations('DeviceInfoPage.ControlPanel')

  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/80 p-8 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <div className="text-lg text-zinc-600 dark:text-zinc-400">{t('loadingTitle')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-zinc-800 dark:text-zinc-200">{t('deviceInfoTitle')}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('deviceInfoDesc')}</p>
          </div>

          <div className="flex items-center gap-2">
            <ShimmerButton onClick={onRefresh} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('refreshButton')}
            </ShimmerButton>

            <Button onClick={onCopyAll} variant="outline" size="sm">
              {copied === 'all' ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied === 'all' ? t('copiedAll') : t('copyAllButton')}
            </Button>

            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('downloadButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
