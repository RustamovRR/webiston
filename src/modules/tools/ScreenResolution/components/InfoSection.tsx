'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const InfoSection: React.FC = () => {
  const t = useTranslations('ScreenResolutionPage.InfoSection')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 rounded-xl border border-zinc-200/30 bg-white/60 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60"
    >
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        {t('title')}
      </h3>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
            {t('realTimeTitle')}
          </h4>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t('realTimeDesc')}</p>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
            {t('professionalTestingTitle')}
          </h4>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• {t('professionalTestingItems.responsive')}</li>
            <li>• {t('professionalTestingItems.crossDevice')}</li>
            <li>• {t('professionalTestingItems.fullscreen')}</li>
            <li>• {t('professionalTestingItems.pixelRatio')}</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400"></div>
            {t('technicalAnalysisTitle')}
          </h4>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• {t('technicalAnalysisItems.resolution')}</li>
            <li>• {t('technicalAnalysisItems.deviceType')}</li>
            <li>• {t('technicalAnalysisItems.aspectRatio')}</li>
            <li>• {t('technicalAnalysisItems.jsonExport')}</li>
          </ul>
        </div>
      </div>

      {/* Resolution Standards */}
      <div className="mt-6 rounded-lg border border-zinc-300/30 bg-zinc-100/30 p-4 dark:border-zinc-700/30 dark:bg-zinc-800/30">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
          <svg
            className="h-4 w-4 text-cyan-500 dark:text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3"
            />
          </svg>
          {t('resolutionStandardsTitle')}
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-500">{t('popularResolutions')}</p>
            <div className="space-y-2">
              <div className="flex justify-between rounded bg-zinc-200/50 p-2 text-sm dark:bg-zinc-900/50">
                <span className="text-zinc-700 dark:text-zinc-300">4K UHD</span>
                <code className="text-blue-600 dark:text-blue-400">3840×2160</code>
              </div>
              <div className="flex justify-between rounded bg-zinc-200/50 p-2 text-sm dark:bg-zinc-900/50">
                <span className="text-zinc-700 dark:text-zinc-300">Full HD</span>
                <code className="text-blue-600 dark:text-blue-400">1920×1080</code>
              </div>
              <div className="flex justify-between rounded bg-zinc-200/50 p-2 text-sm dark:bg-zinc-900/50">
                <span className="text-zinc-700 dark:text-zinc-300">HD</span>
                <code className="text-blue-600 dark:text-blue-400">1366×768</code>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-500">{t('deviceCategories')}</p>
            <div className="space-y-2">
              <div className="flex justify-between rounded bg-zinc-200/50 p-2 text-sm dark:bg-zinc-900/50">
                <span className="text-zinc-700 dark:text-zinc-300">Mobile</span>
                <code className="text-green-600 dark:text-green-400">≤ 768px</code>
              </div>
              <div className="flex justify-between rounded bg-zinc-200/50 p-2 text-sm dark:bg-zinc-900/50">
                <span className="text-zinc-700 dark:text-zinc-300">Tablet</span>
                <code className="text-green-600 dark:text-green-400">769px - 1024px</code>
              </div>
              <div className="flex justify-between rounded bg-zinc-200/50 p-2 text-sm dark:bg-zinc-900/50">
                <span className="text-zinc-700 dark:text-zinc-300">Desktop</span>
                <code className="text-green-600 dark:text-green-400">1025px+</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Tips */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('webDevTitle')}</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('webDevDesc')}</p>
        </div>

        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{t('qaTitle')}</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('qaDesc')}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
        <div className="text-sm text-cyan-600 dark:text-cyan-400">
          <strong>💡 {t('proTipTitle')}</strong> {t('proTipDesc')}
          <code className="mx-1 rounded bg-cyan-400/20 px-1 text-cyan-700 dark:text-cyan-300">
            &lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;
          </code>
          {t('proTipCode')}
        </div>
      </div>
    </motion.div>
  )
}

export default InfoSection
