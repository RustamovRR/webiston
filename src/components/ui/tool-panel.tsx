import React from 'react'
import { cn } from '@/lib'
import { UI_PATTERNS, MACOS_DOTS, TEXT_STYLES } from '@/constants/ui-constants'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

interface ToolPanelProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  stats?: Array<{ label: string; value: number }>
  variant?: 'terminal' | 'simple'
  className?: string
  minHeight?: string
  maxHeight?: string
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  title,
  children,
  actions,
  stats,
  variant = 'simple',
  className,
  minHeight = '400px',
  maxHeight = '500px',
}) => {
  const isTerminal = variant === 'terminal'
  const panelPattern = isTerminal ? UI_PATTERNS.TERMINAL_PANEL : UI_PATTERNS.INPUT_PANEL

  return (
    <div className={cn(panelPattern.container, className)}>
      {/* Header */}
      <div className={panelPattern.header}>
        <div className="flex items-center gap-3">
          {/* macOS dots for terminal variant */}
          {isTerminal && (
            <div className={UI_PATTERNS.TERMINAL_PANEL.dots}>
              {MACOS_DOTS.map((dot, index) => (
                <div
                  key={index}
                  className={cn('h-3 w-3 cursor-pointer rounded-full transition-colors', dot.color, dot.hover)}
                />
              ))}
            </div>
          )}

          <span className={cn(TEXT_STYLES.SUBTITLE, 'ml-2')}>{title}</span>
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className={panelPattern.content} style={{ minHeight, maxHeight }}>
        {children}
      </div>

      {/* Footer with stats */}
      {stats && stats.length > 0 && (
        <div className={panelPattern.footer}>
          <StatsDisplay stats={stats} />
        </div>
      )}
    </div>
  )
}

// Specialized input panel for text areas
interface TextInputPanelProps extends Omit<ToolPanelProps, 'children'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  autoFocus?: boolean
  error?: string
}

export const TextInputPanel: React.FC<TextInputPanelProps> = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  autoFocus = false,
  error,
  ...panelProps
}) => {
  return (
    <ToolPanel {...panelProps}>
      <div className="absolute inset-0 flex flex-col">
        {error ? (
          <div className="p-4">
            <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <strong className="text-sm text-red-400">Xatolik</strong>
              </div>
              <p className={TEXT_STYLES.ERROR}>{error}</p>
            </div>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:ring-0 focus:outline-none"
            placeholder={placeholder}
            readOnly={readOnly}
            autoFocus={autoFocus}
          />
        )}
      </div>
    </ToolPanel>
  )
}

// Specialized output panel for displaying results
interface OutputPanelProps extends Omit<ToolPanelProps, 'children'> {
  content: string
  error?: string
  emptyStateIcon?: React.ReactNode
  emptyStateMessage?: string
  additionalContent?: React.ReactNode
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  content,
  error,
  emptyStateIcon,
  emptyStateMessage = "Natija bu yerda ko'rinadi...",
  additionalContent,
  ...panelProps
}) => {
  return (
    <ToolPanel {...panelProps}>
      <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
        {error ? (
          <div className="p-4">
            <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <strong className="text-sm text-red-400">Xatolik</strong>
              </div>
              <p className={TEXT_STYLES.ERROR}>{error}</p>
            </div>
          </div>
        ) : content ? (
          <div>
            <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">{content}</pre>
            {additionalContent}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="text-zinc-500">
              {emptyStateIcon && <div className="mx-auto mb-4 opacity-50">{emptyStateIcon}</div>}
              <p className="text-sm">{emptyStateMessage}</p>
              <p className="mt-2 text-xs opacity-75">Ma'lumot kiriting</p>
            </div>
          </div>
        )}
      </div>
    </ToolPanel>
  )
}
