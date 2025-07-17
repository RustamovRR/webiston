'use client'

import { ArrowLeftRight, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'
import { countWords } from '@/lib/utils'
import { MACOS_DOTS } from '@/constants/ui-constants'
import { cn } from '@/lib'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui'

interface DualTextPanelProps {
  sourceText: string
  convertedText: string
  sourcePlaceholder: string
  sourceLabel: string
  targetLabel: string
  onSourceChange: (text: string) => void
  onSwap?: () => void
  onClear?: () => void
  swapIcon?: React.ReactNode
  swapButtonTitle?: string
  showSwapButton?: boolean
  showClearButton?: boolean
  isProcessing?: boolean
  error?: string
  variant?: 'simple' | 'terminal'
  statusComponent?: React.ReactNode
  targetEmptyState?: React.ReactNode
  targetFooterComponent?: React.ReactNode
  showShadow?: boolean
  customTargetContent?: React.ReactNode
  extraHeaderComponent?: React.ReactNode
}

export function DualTextPanel({
  sourceText,
  convertedText,
  sourcePlaceholder,
  sourceLabel,
  targetLabel,
  onSourceChange,
  onSwap,
  onClear,
  swapIcon,
  swapButtonTitle,
  showSwapButton = true,
  showClearButton = true,
  isProcessing: isLoading = false,
  error,
  variant = 'terminal',
  statusComponent,
  targetEmptyState,
  targetFooterComponent,
  showShadow = false,
  customTargetContent,
  extraHeaderComponent,
}: DualTextPanelProps) {
  const tCommon = useTranslations('Common')

  const sourceStats = [
    { label: tCommon('stats.characters'), value: sourceText.length },
    { label: tCommon('stats.words'), value: countWords(sourceText) },
    { label: tCommon('stats.lines'), value: sourceText.split('\n').length },
  ]

  const targetStats = [
    { label: tCommon('stats.characters'), value: convertedText.length },
    { label: tCommon('stats.words'), value: countWords(convertedText) },
    { label: tCommon('stats.lines'), value: convertedText.split('\n').length },
  ]

  const isTerminal = variant === 'terminal'

  const DefaultTargetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">{tCommon('resultWillAppear')}</p>
      </div>
    </div>
  )

  const renderPanel = (type: 'source' | 'target') => {
    const isSource = type === 'source'
    const text = isSource ? sourceText : convertedText
    const label = isSource ? sourceLabel : targetLabel
    const stats = isSource ? sourceStats : targetStats

    return (
      <div
        className={cn(
          'relative flex w-full flex-col rounded-xl',
          isTerminal
            ? 'border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/80'
            : 'bg-zinc-100 dark:bg-zinc-900/80',
          showShadow && 'shadow-2xl',
        )}
      >
        <section
          className={cn(
            'flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800',
            isTerminal ? 'bg-zinc-100/50 dark:bg-zinc-800/50' : '',
          )}
        >
          <div className="flex items-center gap-2">
            {isTerminal && (
              <div className="flex items-center gap-2">
                {MACOS_DOTS.map((dot, index) => (
                  <div key={index} className={cn('h-3 w-3 rounded-full', dot.color)} />
                ))}
              </div>
            )}
            <span className="ml-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
          </div>
          {isSource ? (
            <div className="flex items-center gap-1">
              {statusComponent}
              <AnimatePresence>
                {showClearButton && sourceText.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={onClear}
                      variant="ghost"
                      size="sm"
                      className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      aria-label={tCommon('clear')}
                    >
                      <X size={18} />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {extraHeaderComponent}
              <CopyButton text={convertedText} disabled={!convertedText || isLoading} />
            </div>
          )}
        </section>

        <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
          {isSource ? (
            <Textarea
              value={sourceText}
              onChange={(e) => onSourceChange(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-0 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              placeholder={sourcePlaceholder}
              disabled={isLoading}
            />
          ) : (
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {customTargetContent ? (
                customTargetContent
              ) : error ? (
                <div className="p-4 text-red-500 dark:text-red-400">{error}</div>
              ) : isLoading ? (
                <div className="flex h-full items-center justify-center p-4 text-zinc-500 dark:text-zinc-400">
                  {tCommon('processing')}
                </div>
              ) : convertedText ? (
                <div className="p-4">
                  <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
                    {convertedText}
                  </pre>
                </div>
              ) : (
                targetEmptyState || DefaultTargetEmptyState
              )}
            </div>
          )}
        </div>

        <section
          className={cn(
            'flex items-center justify-end border-t border-zinc-200 px-4 py-3 dark:border-zinc-800',
            isTerminal && 'bg-zinc-100/30 dark:bg-zinc-800/30',
          )}
        >
          <StatsDisplay stats={stats} />
        </section>
      </div>
    )
  }

  return (
    <div className="relative grid gap-6 lg:grid-cols-2">
      {renderPanel('source')}
      {showSwapButton && onSwap && (
        <div className="relative lg:absolute lg:top-1/2 lg:left-1/2 lg:z-10 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div className="flex justify-center lg:justify-start">
            <ShimmerButton
              onClick={onSwap}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-2 border-zinc-300 !bg-white/90 shadow-xl backdrop-blur-sm hover:border-indigo-500/50 hover:bg-zinc-100/90 dark:border-zinc-700 dark:!bg-zinc-900/90 dark:hover:bg-zinc-800/90"
              title={swapButtonTitle}
              disabled={isLoading}
            >
              {swapIcon || <ArrowLeftRight size={20} className="text-zinc-600 dark:text-zinc-300" />}
            </ShimmerButton>
          </div>
        </div>
      )}
      {renderPanel('target')}
    </div>
  )
}
