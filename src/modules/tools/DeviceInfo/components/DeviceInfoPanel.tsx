'use client'

import { HardDrive } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CopyButton } from '@/components/shared'

interface DeviceInfo {
  type: string
  touchSupport: boolean
  maxTouchPoints: number
  isMobile: boolean
}

interface DeviceInfoPanelProps {
  deviceInfo: DeviceInfo
}

const DeviceInfoPanel: React.FC<DeviceInfoPanelProps> = ({ deviceInfo }) => {
  const t = useTranslations('DeviceInfoPage.DeviceInfo')

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <HardDrive className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={JSON.stringify(deviceInfo, null, 2)} size="sm" variant="ghost" />
          <div className="h-2 w-2 rounded-full bg-orange-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('deviceType')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{deviceInfo.type}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('touchScreen')}</div>
            <div
              className={`mt-1 flex items-center gap-2 ${
                deviceInfo.touchSupport ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${deviceInfo.touchSupport ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {deviceInfo.touchSupport ? t('touchSupported') : t('touchNotSupported')}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('maxTouchPoints')}</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">{deviceInfo.maxTouchPoints}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t('mobileDevice')}</div>
            <div
              className={`mt-1 flex items-center gap-2 ${
                deviceInfo.isMobile ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${deviceInfo.isMobile ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
              {deviceInfo.isMobile ? t('yes') : t('no')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeviceInfoPanel
