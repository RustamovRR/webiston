'use client'

import { Textarea } from '@/components/ui/textarea'
import { StatsDisplay } from '@/components/shared/StatsDisplay'
import { StatusIndicator } from './StatusIndicator'
import { MACOS_DOTS } from '@/constants/ui-constants'
import { cn } from '@/lib'
import type { PanelProps } from '@/types/panel'

export const Panel = ({ header, content, footer, className }: PanelProps) => {
  const isTerminal = header.showMacOSDots !== false

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm',
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-16 items-center justify-between border-b border-zinc-800 px-4',
          isTerminal ? 'bg-zinc-800/50' : 'bg-zinc-900/50',
        )}
      >
        <div className="flex items-center gap-3">
          {/* macOS dots */}
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
          <span className="text-lg font-semibold text-zinc-100">{header.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator status={header.status} />
          {header.actions && <div className="flex items-center gap-2">{header.actions}</div>}
        </div>
      </div>

      {/* Content */}
      <div
        className="relative flex-grow"
        style={{
          minHeight: content.minHeight || '400px',
          maxHeight: content.maxHeight || '500px',
        }}
      >
        {content.type === 'textarea' ? (
          <Textarea
            value={content.content || ''}
            onChange={(e) => content.onChange?.(e.target.value)}
            className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:ring-0"
            placeholder={content.placeholder}
            disabled={content.readOnly}
          />
        ) : content.type === 'display' ? (
          <div className="absolute inset-0 h-full w-full overflow-y-auto">
            {content.error ? (
              <div className="p-4">
                <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <strong className="text-sm text-red-400">Xatolik</strong>
                  </div>
                  <p className="font-mono text-sm text-red-300">{content.error}</p>
                </div>
              </div>
            ) : content.content ? (
              <div className="p-4">
                <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">{content.content}</pre>
              </div>
            ) : content.emptyState ? (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="text-zinc-500">
                  {content.emptyState.icon}
                  <p className="text-sm">{content.emptyState.message}</p>
                  {content.emptyState.subMessage && (
                    <p className="mt-2 text-xs opacity-75">{content.emptyState.subMessage}</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : content.type === 'custom' && content.customContent ? (
          <div className="absolute inset-0 h-full w-full">{content.customContent}</div>
        ) : null}
      </div>

      {/* Footer */}
      {footer && footer.showStats !== false && (
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
          {footer.stats && <StatsDisplay stats={footer.stats} />}
          {footer.additionalInfo && <div className="text-xs text-zinc-400">{footer.additionalInfo}</div>}
        </div>
      )}
    </div>
  )
}
