'use client'

import { useTranslations } from 'next-intl'

export function InfoSection() {
  const t = useTranslations('CameraRecorderPage.InfoSection')

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
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
          <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">{t('useCases.title')}</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <span>
                  <strong>{t('useCases.contentCreation.title')}</strong> {t('useCases.contentCreation.description')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>
                  <strong>{t('useCases.documentation.title')}</strong> {t('useCases.documentation.description')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <span>
                  <strong>{t('useCases.education.title')}</strong> {t('useCases.education.description')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <span>
                  <strong>{t('useCases.testing.title')}</strong> {t('useCases.testing.description')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                <span>
                  <strong>{t('useCases.qualityControl.title')}</strong> {t('useCases.qualityControl.description')}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">{t('tips.title')}</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                {t('tips.lighting')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                {t('tips.microphone')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                {t('tips.quality')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                {t('tips.screenshot')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                {t('tips.storage')}
              </li>
            </ul>

            <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10">
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <strong>{t('note.title')}</strong> {t('note.content')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
