import React from 'react'
import { useTranslations } from 'next-intl'
import { Hash } from 'lucide-react'
import { TerminalInput } from '@/components/shared/TerminalInput'
import { CopyButton } from '@/components/shared/CopyButton'
import { HashAlgorithm } from '../hooks/useHashGenerator'

interface HashResult {
  algorithm: string
  hash: string
  length: number
  status: 'deprecated' | 'weak' | 'secure' | 'recommended'
}

interface AlgorithmInfo {
  status: 'deprecated' | 'weak' | 'secure' | 'recommended'
  recommendation: string
  description: string
}

interface DetailedResultsProps {
  hashResults: HashResult[]
  getAlgorithmInfo: (algorithm: HashAlgorithm) => AlgorithmInfo
}

const DetailedResults: React.FC<DetailedResultsProps> = ({ hashResults, getAlgorithmInfo }) => {
  const t = useTranslations('HashGeneratorPage.DetailedResults')
  const tInfo = useTranslations('HashGeneratorPage.Info')

  if (hashResults.length === 0) return null

  const customContent = (
    <div className="p-6">
      <div className="space-y-4">
        {hashResults.map((result) => {
          const info = getAlgorithmInfo(result.algorithm as HashAlgorithm)
          return (
            <div
              key={result.algorithm}
              className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash size={20} className="text-zinc-500 dark:text-zinc-400" />
                  <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{result.algorithm}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    ({result.length} {t('characters') || 'belgi'})
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      result.status === 'deprecated'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                        : result.status === 'weak'
                          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400'
                          : result.status === 'secure'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                            : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                    }`}
                  >
                    {tInfo(`descriptions.${result.status}`)}
                  </span>
                </div>
                <CopyButton text={result.hash} />
              </div>
              <div className="rounded bg-zinc-100 p-3 font-mono text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                {result.hash}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <TerminalInput
      title={t('title') || 'Batafsil Hash Natijalari'}
      customContent={customContent}
      variant="info"
      showShadow={true}
      animate={true}
    />
  )
}

export default DetailedResults
