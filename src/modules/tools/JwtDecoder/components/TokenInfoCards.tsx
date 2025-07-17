import React from 'react'
import { Clock, Shield, Key } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TokenInfoProps {
  tokenInfo: {
    isExpired: boolean
    expiresAt: Date | null
    algorithm?: string
    tokenType?: string
    issuedAt: Date | null
    isNotYetValid?: boolean
    notBefore?: Date | null
  }
}

const TokenInfoCards: React.FC<TokenInfoProps> = ({ tokenInfo }) => {
  const t = useTranslations('JwtDecoderPage.TokenInfo')

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div
        className={`rounded-lg border p-4 ${
          tokenInfo.isExpired
            ? 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/20'
            : 'border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/20'
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <Clock
            size={16}
            className={tokenInfo.isExpired ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}
          />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{t('expiration')}</span>
        </div>
        <p
          className={`text-sm ${tokenInfo.isExpired ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`}
        >
          {tokenInfo.isExpired ? t('expired') : t('valid')}
        </p>
        {tokenInfo.expiresAt && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{tokenInfo.expiresAt.toLocaleString()}</p>
        )}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
        <div className="mb-2 flex items-center gap-2">
          <Shield size={16} className="text-blue-500 dark:text-blue-400" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{t('algorithm')}</span>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-300">{tokenInfo.algorithm || t('unknown')}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {t('type')}: {tokenInfo.tokenType || 'JWT'}
        </p>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/30 dark:bg-yellow-900/20">
        <div className="mb-2 flex items-center gap-2">
          <Key size={16} className="text-yellow-500 dark:text-yellow-400" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{t('issued')}</span>
        </div>
        {tokenInfo.issuedAt ? (
          <p className="text-sm text-yellow-600 dark:text-yellow-300">{tokenInfo.issuedAt.toLocaleString()}</p>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('noData')}</p>
        )}
      </div>
    </div>
  )
}

export default TokenInfoCards
