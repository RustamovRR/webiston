import React from 'react'
import { useTranslations } from 'next-intl'
import { CopyButton } from '@/components/shared/CopyButton'

interface SignatureSectionProps {
  signature: string
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ signature }) => {
  const t = useTranslations('JwtDecoderPage.SignatureSection')

  return (
    <div className="animate-in slide-in-from-top-2 fade-in rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-200 duration-300 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80 transition-all duration-200 hover:bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80 transition-all duration-200 hover:bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/80 transition-all duration-200 hover:bg-green-500"></div>
          </div>
          <span className="ml-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={signature} disabled={false} />
        </div>
      </div>
      <div className="relative min-h-[120px]">
        <div className="p-4 transition-all duration-200">
          <div className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('description')}</div>
          <pre className="rounded bg-zinc-100 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-800 transition-colors duration-200 dark:bg-zinc-800/50 dark:text-zinc-200">
            {signature}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default SignatureSection
