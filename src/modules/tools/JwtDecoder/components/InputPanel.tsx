import React from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Textarea } from '@/components/ui/textarea'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

interface InputPanelProps {
  inputText: string
  setInputText: (text: string) => void
  isProcessing: boolean
  handleClear: () => void
  inputStats: {
    characters: number
    words: number
    lines: number
  }
  partsCount: number
}

const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  isProcessing,
  handleClear,
  inputStats,
  partsCount,
}) => {
  const t = useTranslations('JwtDecoderPage.InputPanel')

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="ml-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatsDisplay
            stats={[
              { label: t('characters'), value: inputStats.characters },
              { label: t('parts'), value: partsCount },
              { label: t('lines'), value: inputStats.lines },
            ]}
          />
          {inputText && (
            <button
              onClick={handleClear}
              className="cursor-pointer rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Tozalash"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('placeholder')}
          className="min-h-[120px] resize-none border-0 bg-transparent font-mono text-sm text-zinc-900 placeholder-zinc-500 focus-visible:ring-0 dark:text-zinc-100 dark:placeholder-zinc-500"
          disabled={isProcessing}
        />
      </div>
    </div>
  )
}

export default InputPanel
