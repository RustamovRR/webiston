import React from 'react'
import { useTranslations } from 'next-intl'
import { HashAlgorithm } from '@/hooks/tools/useHashGenerator'

interface AlgorithmInfo {
  status: 'deprecated' | 'weak' | 'secure' | 'recommended'
  recommendation: string
  description: string
}

interface AlgorithmSelectorProps {
  availableAlgorithms: HashAlgorithm[]
  selectedAlgorithms: HashAlgorithm[]
  onToggleAlgorithm: (algorithm: HashAlgorithm) => void
  getAlgorithmInfo: (algorithm: HashAlgorithm) => AlgorithmInfo
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  availableAlgorithms,
  selectedAlgorithms,
  onToggleAlgorithm,
  getAlgorithmInfo,
}) => {
  const t = useTranslations('HashGeneratorPage.AlgorithmSelector')
  const tInfo = useTranslations('HashGeneratorPage.Info')

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span className="ml-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('title') || 'Hash Algoritmlari'}
        </span>
      </div>

      {/* Algorithm Buttons */}
      <div className="flex flex-wrap gap-3">
        {availableAlgorithms.map((algorithm) => {
          const info = getAlgorithmInfo(algorithm)
          const isActive = selectedAlgorithms.includes(algorithm)
          return (
            <button
              key={algorithm}
              onClick={() => onToggleAlgorithm(algorithm)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'border-zinc-300 bg-zinc-100/50 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              }`}
            >
              <span>{algorithm}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  info.status === 'deprecated'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                    : info.status === 'weak'
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400'
                      : info.status === 'secure'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                }`}
              >
                {t(`${algorithm}`) || info.recommendation}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AlgorithmSelector
