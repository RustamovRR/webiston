import React from 'react'
import { useTranslations } from 'next-intl'
import { UuidVersion, UuidFormat } from '../hooks/useUuidGenerator'

interface InputPanelProps {
  count: number
  version: UuidVersion
  format: UuidFormat
  getVersionInfo: (version: UuidVersion) => any
  getFormatInfo: (format: UuidFormat) => any
}

const InputPanel: React.FC<InputPanelProps> = ({ count, version, format, getVersionInfo, getFormatInfo }) => {
  const t = useTranslations('UuidGeneratorPage.InputPanel')

  const currentVersionInfo = getVersionInfo(version)
  const currentFormatInfo = getFormatInfo(format)

  return (
    <div className="h-[96%] overflow-auto rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
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
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('status')}</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {/* Settings Summary */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('settingsTitle')}</h3>
          <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="font-mono text-zinc-800 dark:text-zinc-300">{count}</span>
              <span>{t('countLabel')}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-zinc-800 dark:text-zinc-300">{version.toUpperCase()}</span>
              <span>{t('versionLabel')}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-zinc-800 dark:text-zinc-300">{format}</span>
              <span>{t('formatLabel')}</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Version Info */}
          <div className="rounded-lg bg-zinc-100/50 p-4 dark:bg-zinc-800/50">
            <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('versionInfoTitle')}</h3>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div>
                <span className="text-zinc-800 dark:text-zinc-300">{t('nameLabel')}</span> {currentVersionInfo.name}
              </div>
              <div>
                <span className="text-zinc-800 dark:text-zinc-300">{t('descriptionLabel')}</span>{' '}
                {currentVersionInfo.description}
              </div>
              <div>
                <span className="text-zinc-800 dark:text-zinc-300">{t('securityLabel')}</span>{' '}
                {currentVersionInfo.security}
              </div>
            </div>
          </div>

          {/* Format Info */}
          <div className="rounded-lg bg-zinc-100/50 p-4 dark:bg-zinc-800/50">
            <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('formatInfoTitle')}</h3>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div>
                <span className="text-zinc-800 dark:text-zinc-300">{t('nameLabel')}</span> {currentFormatInfo.name}
              </div>
              <div>
                <span className="text-zinc-800 dark:text-zinc-300">{t('patternLabel')}</span>
              </div>
              <div className="font-mono text-xs text-zinc-600 dark:text-zinc-500">{currentFormatInfo.description}</div>
              <div>
                <span className="text-zinc-800 dark:text-zinc-300">{t('exampleLabel')}</span>
              </div>
              <div className="font-mono text-xs text-zinc-600 dark:text-zinc-500">{currentFormatInfo.example}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InputPanel
