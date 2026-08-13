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
import { useEffect, useRef } from "react"
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
  /**
   * Put the caret in the source field on mount, for tools whose entire job is
   * paste → read. Honoured on pointer devices only.
   */
  autoFocusSource?: boolean
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
  sourceEmptyState,
  autoFocusSource = false
}: DualTextPanelProps) {
  const tCommon = useTranslations("Common")

  const sourceRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!autoFocusSource) return
    // Pointer devices only. On a phone, focusing on load raises the on-screen
    // keyboard over the result panel — the thing the visitor came to see —
    // before they have typed anything.
    if (!window.matchMedia("(pointer: fine)").matches) return
    // `preventScroll`: the field is above the fold on a desktop, and focusing
    // it must not yank the page away from the heading.
    sourceRef.current?.focus({ preventScroll: true })
  }, [autoFocusSource])

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
          // `shadow-2xl` was Tailwind's HEAVIEST shadow — the elevation a
          // modal or a floating palette earns, on a section that sits in the
          // page flow. In light mode the two panels read as 3D boxes lifted
          // off the page, and anything placed under them (the extension
          // callout) looked stuck to the bottom of a floating object.
          //
          // Nothing else inline on this site is elevated at all: the FAQ and
          // the alphabet table are `border border-border bg-card`, flat.
          // `shadow-sm` keeps the prop meaningful — the panel is still the
          // focus of the page — without leaving the plane. Four tools use it:
          // latin-cyrillic, base64-converter, hash-generator, url-encoder.
          showShadow && "shadow-sm"
        )}
      >
        {/* Header */}
        <header
          className={cn(
            "flex h-14 shrink-0 items-center justify-between border-b border-border px-4",
            isTerminal ? "bg-muted/50" : ""
          )}
        >
          {/* One marker, not three.
              This slot used to hold the macOS traffic lights — an imitation of
              close/minimise/zoom buttons that do not exist here, in the first
              place the eye lands, saying nothing. They were also three raw
              Tailwind palette classes (red, amber and green at a fixed weight)
              that never flipped with the colour scheme. It is the kicker mark the
              section headings use, and it carries one real bit: filled with
              the accent on the panel that holds the ANSWER. */}
          <div className="flex items-center gap-2.5">
            {isTerminal && (
              <span
                aria-hidden="true"
                className={cn(
                  "size-[6px] shrink-0 rounded-[2px]",
                  isSource ? "bg-border-strong" : "bg-primary"
                )}
              />
            )}
            <h2 id={panelId} className="font-medium text-base text-foreground">
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
              {/* Labelled, and `outline` rather than `ghost`.
                  Copying the result is the last step of every tool built on
                  this panel — it is what the visitor came for — and it was an
                  icon-only ghost button, the lowest-emphasis treatment in the
                  system. Most people using these tools are not developers, and
                  the two-overlapping-squares glyph is a developer convention:
                  it means nothing outside software. Measured on a phone, the
                  result of a converted article is 4,012px of text behind a
                  200px window, so someone who does not recognise the icon
                  scrolls and hand-selects instead. */}
              <CopyButton
                text={convertedText}
                disabled={!convertedText || isLoading}
                variant="outline"
                showLabel
                label={tCommon("copy")}
                copiedLabel={tCommon("copied")}
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
                  ref={sourceRef}
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
            /**
             * The result grows with the text, up to a cap. It used to be
             * `absolute inset-0`, which pinned it to the panel's MINIMUM
             * height for ever — measured on a converted article: 3,212px of
             * text behind a 500px window on a desktop, and **4,012px behind a
             * 200px window on a phone**, i.e. 95% of the answer hidden and
             * nineteen swipes inside a porthole to read it.
             *
             * `absolute` is kept for everything else — the empty state, the
             * error, the spinner and the two tools that render their own
             * target content — because those are centred against the panel and
             * a flow layout would collapse them.
             *
             * Capped, not free: `docs` rule — long output must never set the
             * page height. Short results still leave both panels on one screen
             * on a phone, which is why the MINIMUM stays where it was.
             */
            <div
              className={cn(
                "overflow-y-auto",
                convertedText && !customTargetContent && !error && !isLoading
                  ? "max-h-[70vh] lg:max-h-[calc(100dvh-16rem)]"
                  : "absolute inset-0"
              )}
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
              // `text-muted-foreground` belongs on the BUTTON, not on the
              // fallback icon it used to sit on.
              //
              // With it on the icon, a caller that passed its own `swapIcon`
              // silently lost the colour and inherited the one `ShimmerButton`
              // hardcodes — a raw palette grey meant for dark surfaces, nearly
              // invisible on a light page. base64-converter and url-encoder
              // did exactly that and looked permanently disabled in light
              // mode; latin-cyrillic, which passes no icon, was fine. Same
              // component, opposite result, decided by a prop that has nothing
              // to do with colour.
              className="h-12 w-12 rounded-full border-2 border-border bg-card/90! text-muted-foreground shadow-xl backdrop-blur-sm hover:border-ring hover:bg-muted/90 disabled:cursor-not-allowed disabled:opacity-40"
              title={swapButtonTitle}
              disabled={isLoading || !convertedText}
              aria-label={swapButtonTitle || "Swap"}
            >
              {swapIcon || (
                // No colour class: the button owns it, so a custom
                // `swapIcon` and this default look identical.
                <ArrowLeftRight size={20} aria-hidden="true" />
              )}
            </ShimmerButton>
          </div>
        </div>
      )}

      {renderPanel("target")}
    </div>
  )
}
