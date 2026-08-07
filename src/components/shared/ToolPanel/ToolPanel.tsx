import { cn, StatsDisplay } from "@webiston/ui"
import { useTranslations } from "next-intl"
import type React from "react"
import { MACOS_DOTS, TEXT_STYLES, UI_PATTERNS } from "@/constants/ui-constants"

interface ToolPanelProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  stats?: Array<{ label: string; value: number }>
  variant?: "terminal" | "simple"
  className?: string
  minHeight?: string
  maxHeight?: string
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  title,
  children,
  actions,
  stats,
  variant = "simple",
  className,
  minHeight = "400px",
  maxHeight = "500px"
}) => {
  const isTerminal = variant === "terminal"
  const panelPattern = isTerminal
    ? UI_PATTERNS.TERMINAL_PANEL
    : UI_PATTERNS.INPUT_PANEL

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
                  className={cn(
                    "h-3 w-3 cursor-pointer rounded-full transition-colors",
                    dot.color,
                    dot.hover
                  )}
                />
              ))}
            </div>
          )}

          <span className={cn(TEXT_STYLES.SUBTITLE, "ml-2")}>{title}</span>
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
interface TextInputPanelProps extends Omit<ToolPanelProps, "children"> {
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
  const t = useTranslations("Common")
  return (
    <ToolPanel {...panelProps}>
      <div className="absolute inset-0 flex flex-col">
        {error ? (
          <div className="p-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive"></div>
                <strong className="text-sm text-destructive">
                  {t("error")}
                </strong>
              </div>
              <p className={TEXT_STYLES.ERROR}>{error}</p>
            </div>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 resize-none border-0 bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            placeholder={placeholder}
            readOnly={readOnly}
          />
        )}
      </div>
    </ToolPanel>
  )
}

// Specialized output panel for displaying results
interface OutputPanelProps extends Omit<ToolPanelProps, "children"> {
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
  emptyStateMessage,
  additionalContent,
  ...panelProps
}) => {
  const t = useTranslations("Common")
  return (
    <ToolPanel {...panelProps}>
      <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
        {error ? (
          <div className="p-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive"></div>
                <strong className="text-sm text-destructive">
                  {t("error")}
                </strong>
              </div>
              <p className={TEXT_STYLES.ERROR}>{error}</p>
            </div>
          </div>
        ) : content ? (
          <div>
            <pre className="font-mono text-sm break-all whitespace-pre-wrap text-foreground">
              {content}
            </pre>
            {additionalContent}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="text-muted-foreground">
              {emptyStateIcon && (
                <div className="mx-auto mb-4 opacity-50">{emptyStateIcon}</div>
              )}
              <p className="text-sm">
                {emptyStateMessage ?? t("resultWillAppear")}
              </p>
              <p className="mt-2 text-xs opacity-75">{t("enterData")}</p>
            </div>
          </div>
        )}
      </div>
    </ToolPanel>
  )
}
