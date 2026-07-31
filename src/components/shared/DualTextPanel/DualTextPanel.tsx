"use client"

/**
 * DualTextPanel Component
 * Two-panel layout for text transformation tools
 * Semantic HTML with proper ARIA attributes
 */

import {
  Button,
  CopyButton,
  cn,
  ShimmerButton,
  StatsDisplay
} from "@webiston/ui"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeftRight, FileText, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { MACOS_DOTS } from "@/constants/ui-constants"
import { countWords } from "@/lib/utils"

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
  variant?: "simple" | "terminal"
  statusComponent?: React.ReactNode
  targetEmptyState?: React.ReactNode
  targetFooterComponent?: React.ReactNode
  showShadow?: boolean
  customTargetContent?: React.ReactNode
  customSourceContent?: React.ReactNode
  extraHeaderComponent?: React.ReactNode
  /**
   * Rendered over the source textarea while it is empty — the place to put the
   * one or two actions that get a first-time visitor started. It sits ON the
   * textarea rather than replacing it so a click on the empty space still
   * focuses the field.
   */
  sourceEmptyState?: React.ReactNode
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
  variant = "terminal",
  statusComponent,
  targetEmptyState,
  targetFooterComponent,
  showShadow = false,
  customTargetContent,
  customSourceContent,
  extraHeaderComponent,
  sourceEmptyState
}: DualTextPanelProps) {
  const tCommon = useTranslations("Common")

  const sourceStats = [
    { label: tCommon("stats.characters"), value: sourceText.length },
    { label: tCommon("stats.words"), value: countWords(sourceText) },
    { label: tCommon("stats.lines"), value: sourceText.split("\n").length }
  ]

  const targetStats = [
    { label: tCommon("stats.characters"), value: convertedText.length },
    { label: tCommon("stats.words"), value: countWords(convertedText) },
    { label: tCommon("stats.lines"), value: convertedText.split("\n").length }
  ]

  const isTerminal = variant === "terminal"

  const DefaultTargetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-muted-foreground">
        <FileText
          size={48}
          className="mx-auto mb-4 opacity-50"
          aria-hidden="true"
        />
        <p className="text-sm">{tCommon("resultWillAppear")}</p>
      </div>
    </div>
  )

  const renderPanel = (type: "source" | "target") => {
    const isSource = type === "source"
    const label = isSource ? sourceLabel : targetLabel
    const stats = isSource ? sourceStats : targetStats
    const panelId = `panel-${type}`
    const contentId = `content-${type}`

    return (
      <article
        aria-labelledby={panelId}
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-xl",
          isTerminal
            ? "border border-border bg-card/80 backdrop-blur-sm"
            : "bg-muted/80",
          showShadow && "shadow-2xl"
        )}
      >
        {/* Header */}
        <header
          className={cn(
            "flex h-14 shrink-0 items-center justify-between border-b border-border px-4",
            isTerminal ? "bg-muted/50" : ""
          )}
        >
          <div className="flex items-center gap-2">
            {isTerminal && (
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {MACOS_DOTS.map((dot, index) => (
                  <div
                    key={index}
                    className={cn("h-3 w-3 rounded-full", dot.color)}
                  />
                ))}
              </div>
            )}
            <h2
              id={panelId}
              className="ml-2 text-base font-medium text-foreground"
            >
              {label}
            </h2>
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
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      onClick={onClear}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={tCommon("clear")}
                    >
                      <X size={18} aria-hidden="true" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {extraHeaderComponent}
              <CopyButton
                text={convertedText}
                disabled={!convertedText || isLoading}
              />
            </div>
          )}
        </header>

        {/* Content area */}
        {/* Below `lg` the panels stack, so a 400px minimum put the result a
            full screen-height below the input: on a phone you typed into a box
            whose output you could not see. 200px keeps both in view at
            375x667 and still grows with the content. */}
        <div
          id={contentId}
          className="relative min-h-[200px] flex-1 sm:min-h-[320px] lg:min-h-[500px]"
        >
          {isSource ? (
            customSourceContent ? (
              <div className="absolute inset-0">{customSourceContent}</div>
            ) : (
              <>
                <textarea
                  value={sourceText}
                  onChange={(e) => onSourceChange(e.target.value)}
                  className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
                  placeholder={sourcePlaceholder}
                  disabled={isLoading}
                  aria-label={sourceLabel}
                  spellCheck={false}
                />
                {sourceEmptyState && sourceText.length === 0 && (
                  // Under the placeholder line, not at the bottom of the
                  // panel: the panel is 500px tall on a desktop and the
                  // bottom edge sits below the fold, so actions parked there
                  // were measured at y=878 in a 720px viewport — present in
                  // the DOM and invisible to the user.
                  <div className="pointer-events-none absolute inset-x-0 top-12 flex px-4">
                    {sourceEmptyState}
                  </div>
                )}
              </>
            )
          ) : (
            <div
              className="absolute inset-0 overflow-y-auto"
              role="region"
              aria-label={targetLabel}
              aria-live="polite"
            >
              {customTargetContent ? (
                customTargetContent
              ) : error ? (
                <div className="p-4 text-destructive" role="alert">
                  {error}
                </div>
              ) : isLoading ? (
                <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                  <span aria-live="polite">{tCommon("processing")}</span>
                </div>
              ) : convertedText ? (
                <div className="p-4">
                  <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-foreground">
                    {convertedText}
                  </pre>
                </div>
              ) : (
                targetEmptyState || DefaultTargetEmptyState
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          className={cn(
            "flex shrink-0 items-center justify-between border-t border-border px-4 py-2.5",
            isTerminal && "bg-muted/30"
          )}
        >
          <div className="flex items-center">
            {!isSource && targetFooterComponent}
          </div>
          <StatsDisplay stats={stats} />
        </footer>
      </article>
    )
  }

  return (
    <div
      className="relative grid gap-6 lg:grid-cols-2"
      role="group"
      aria-label="Text transformation panels"
    >
      {renderPanel("source")}

      {showSwapButton && onSwap && (
        <div className="relative lg:absolute lg:left-1/2 lg:top-1/2 lg:z-10 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div className="flex justify-center lg:justify-start">
            {/* Disabled with nothing to swap. It used to stay enabled on an
                empty panel, so the first thing a visitor clicked was a button
                that silently did nothing. */}
            <ShimmerButton
              onClick={onSwap}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-2 border-border bg-card/90! shadow-xl backdrop-blur-sm hover:border-ring hover:bg-muted/90 disabled:cursor-not-allowed disabled:opacity-40"
              title={swapButtonTitle}
              disabled={isLoading || !convertedText}
              aria-label={swapButtonTitle || "Swap"}
            >
              {swapIcon || (
                <ArrowLeftRight
                  size={20}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </ShimmerButton>
          </div>
        </div>
      )}

      {renderPanel("target")}
    </div>
  )
}
