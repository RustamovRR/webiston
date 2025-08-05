'use client'

import { Cpu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CopyButton } from '@/components/shared'

interface SystemInfo {
  platform: string
  language: string
  timezone: string
  onlineStatus: boolean
  cookieEnabled: boolean
  languages: string[]
}

interface SystemInfoPanelProps {
  systemInfo: SystemInfo
}

const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({ systemInfo }) => {
  const t = useTranslations('DeviceInfoPage.SystemInfo')

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <Cpu className="h-5 w-5 text-green-500 dark:text-green-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={JSON.stringify(systemInfo, null, 2)} size="sm" variant="ghost" />
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('platform')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{systemInfo.platform}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('language')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{systemInfo.language}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('timezone')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{systemInfo.timezone}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('onlineStatus')}</div>
            <div
              className={`mt-1 flex items-center gap-2 ${
                systemInfo.onlineStatus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${systemInfo.onlineStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {systemInfo.onlineStatus ? t('online') : t('offline')}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('cookieEnabled')}</div>
            <div
              className={`mt-1 flex items-center gap-2 ${
                systemInfo.cookieEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${systemInfo.cookieEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {systemInfo.cookieEnabled ? t('yes') : t('no')}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('supportedLanguages')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{systemInfo.languages.slice(0, 3).join(', ')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemInfoPanel
