import React from 'react'
import { Key } from 'lucide-react'
import { useTranslations } from 'next-intl'

const SignatureInfo: React.FC = () => {
  const t = useTranslations('JwtDecoderPage.SignatureInfo')

  return (
    <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50/50 p-4 dark:border-yellow-800/30 dark:bg-yellow-900/10">
      <div className="flex items-start gap-3">
        <Key size={20} className="mt-0.5 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />
        <div>
          <h4 className="mb-2 font-medium text-yellow-700 dark:text-yellow-300">{t('title')}</h4>
          <div className="space-y-1 text-sm text-yellow-700/90 dark:text-yellow-200/90">
            <p>{t('description1')}</p>
            <p>{t('description2')}</p>
            <p>{t('description3')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignatureInfo
