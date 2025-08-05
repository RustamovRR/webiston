'use client'

import { Monitor } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CopyButton } from '@/components/shared'

interface BrowserInfo {
  name: string
  version: string
  userAgent: string
}

interface BrowserInfoPanelProps {
  browserInfo: BrowserInfo
}

const BrowserInfoPanel: React.FC<BrowserInfoPanelProps> = ({ browserInfo }) => {
  const t = useTranslations('DeviceInfoPage.BrowserInfo')

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <Monitor className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={JSON.stringify(browserInfo, null, 2)} size="sm" variant="ghost" />
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('browserName')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{browserInfo.name}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('version')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{browserInfo.version}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{t('userAgent')}</div>
            <div className="rounded-lg border border-zinc-300 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
              <code className="font-mono text-xs break-all text-zinc-700 dark:text-zinc-300">
                {browserInfo.userAgent}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrowserInfoPanel
