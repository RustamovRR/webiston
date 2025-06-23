'use client'

import { ArrowLeftRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'
import { countWords } from '@/lib/utils'
import { MACOS_DOTS } from '@/constants/ui-constants'
import { cn } from '@/lib'

interface DualTextPanelProps {
  sourceText: string
  convertedText: string
  sourcePlaceholder: string
  sourceLabel: string
  targetLabel: string
  onSourceChange: (text: string) => void
  onSwap?: () => void
  onClear?: () => void
  showSwapButton?: boolean
  showClearButton?: boolean
  isLoading?: boolean
  error?: string
  variant?: 'simple' | 'terminal'
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
  showSwapButton = true,
  showClearButton = true,
  isLoading = false,
  error,
  variant = 'simple',
}: DualTextPanelProps) {
  const sourceStats = [
    { label: 'belgi', value: sourceText.length },
    { label: "so'z", value: countWords(sourceText) },
    { label: 'qator', value: sourceText.split('\n').length },
  ]

  const targetStats = [
    { label: 'belgi', value: convertedText.length },
    { label: "so'z", value: countWords(convertedText) },
    { label: 'qator', value: convertedText.split('\n').length },
  ]

  const isTerminal = variant === 'terminal'

  const renderPanel = (type: 'source' | 'target') => {
    const isSource = type === 'source'
    const text = isSource ? sourceText : convertedText
    const label = isSource ? sourceLabel : targetLabel
    const stats = isSource ? sourceStats : targetStats

    return (
      <motion.div
        layout
        className={cn(
          'relative flex w-full flex-col shadow-inner',
          isTerminal
            ? 'rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm'
            : 'rounded-xl bg-zinc-900/80',
        )}
      >
        <section
          className={cn(
            'flex items-center justify-between border-b border-zinc-800 px-4',
            isTerminal ? 'h-16 bg-zinc-800/50' : 'h-16',
          )}
        >
          <div className="flex items-center gap-3">
            {/* macOS dots for terminal variant */}
            {isTerminal && (
              <div className="flex items-center gap-2">
                {MACOS_DOTS.map((dot, index) => (
                  <div
                    key={index}
                    className={cn('h-3 w-3 cursor-pointer rounded-full transition-colors', dot.color, dot.hover)}
                  />
                ))}
              </div>
            )}
            <span className="text-lg font-semibold text-zinc-100">{label}</span>
          </div>
          {isSource ? (
            <AnimatePresence>
              {showClearButton && sourceText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    onClick={onClear}
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-zinc-200"
                    aria-label="Tozalash"
                  >
                    <X size={18} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <CopyButton text={convertedText} disabled={!convertedText || isLoading} />
          )}
        </section>

        <section className="relative flex-grow" style={{ minHeight: '400px', maxHeight: '400px' }}>
          {isSource ? (
            <Textarea
              value={sourceText}
              onChange={(e) => onSourceChange(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 text-lg text-zinc-50 placeholder:text-zinc-500 focus:ring-0"
              placeholder={sourcePlaceholder}
              disabled={isLoading}
            />
          ) : (
            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
              {error ? (
                <div className="text-red-400">{error}</div>
              ) : isLoading ? (
                <div className="text-zinc-400">Ishlanmoqda...</div>
              ) : (
                <pre className="text-lg whitespace-pre-wrap text-zinc-50">{convertedText}</pre>
              )}
            </div>
          )}
        </section>

        <section className={cn('flex justify-end border-t border-zinc-800 px-4 py-2', isTerminal && 'bg-zinc-800/30')}>
          <StatsDisplay stats={stats} />
        </section>
      </motion.div>
    )
  }

  return (
    <div className="relative flex flex-col gap-4 md:flex-row md:gap-6">
      {renderPanel('source')}

      {showSwapButton && onSwap && (
        <div className="flex justify-center md:self-start md:pt-16">
          <Button
            onClick={onSwap}
            variant="outline"
            size="sm"
            className="group cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            aria-label="Almashtirish"
            disabled={isLoading}
          >
            <ArrowLeftRight size={18} className="transition-transform group-hover:scale-110" />
          </Button>
        </div>
      )}

      {renderPanel('target')}
    </div>
  )
}
