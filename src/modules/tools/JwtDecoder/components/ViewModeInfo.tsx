import React from 'react'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

const ViewModeInfo: React.FC = () => {
  const t = useTranslations('JwtDecoderPage.ViewModeInfo')

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10">
      <div className="flex items-start gap-3">
        <Info size={20} className="mt-0.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
        <div>
          <h4 className="mb-2 font-medium text-blue-700 dark:text-blue-300">{t('title')}</h4>
          <div className="space-y-1 text-sm text-blue-700/90 dark:text-blue-200/90">
            <p>
              <strong>{t('decoded')}:</strong> {t('decodedDescription')}
            </p>
            <p>
              <strong>{t('raw')}:</strong> {t('rawDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewModeInfo
