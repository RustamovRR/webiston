"use client"

/**
 * Latin ↔ Cyrillic converter.
 *
 * The client island. Everything static on this route — the alphabet table, the
 * FAQ, the JSON-LD — is rendered by `page.tsx` as a Server Component sibling,
 * so none of it costs the user any JavaScript.
 */

import { ProgressBar } from "@webiston/ui/composites/ProgressBar"
import { Button } from "@webiston/ui/primitives/button"
import { cn } from "@webiston/ui/utils"
import { BookLock, Paperclip, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  DirectionTabs,
  DownloadMenu,
  DropZone,
  ExceptionsDialog,
  PreservedTerms,
  SourceEmptyActions
} from "./components"
import { SAMPLE_TEXT, SUPPORTED_EXTENSIONS } from "./constants"
import { useFileImport, useLatinCyrillic } from "./hooks"
import type { DownloadFormat } from "./types"

export function LatinCyrillicPage() {
  const t = useTranslations("LatinCyrillicPage")
  const fileInput = useRef<HTMLInputElement>(null)

  const {
    sourceText,
    convertedText,
    preference,
    direction,
    preservedTerms,
    exceptions,
    addException,
    removeException,
    setPreference,
    setSourceText,
    swap,
    clear
  } = useLatinCyrillic()

  const file = useFileImport(setSourceText)

  const isLatinSource = direction === "latin-to-cyrillic"
  const sourceLang = isLatinSource ? t("latin") : t("cyrillic")
  const targetLang = isLatinSource ? t("cyrillic") : t("latin")

  // The keyboard copy has to acknowledge itself. A silent shortcut is
  // indistinguishable from a shortcut that is not bound.
  const [justCopied, setJustCopied] = useState(false)
  const [exceptionsOpen, setExceptionsOpen] = useState(false)
  useEffect(() => {
    if (!justCopied) return
    const timer = setTimeout(() => setJustCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [justCopied])

  const clearAll = () => {
    clear()
    file.resetFile()
  }

  /**
   * The job here is paste → copy, and the tool had no keyboard path for either
   * (verified: zero key handlers across the module before this).
   *
   * Bound on the wrapper rather than on `document`: React events bubble up
   * from the textarea, so these fire exactly when focus is inside the tool and
   * never steal Escape from the search dialog or anything else on the page.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!convertedText) return
      event.preventDefault()
      void navigator.clipboard.writeText(convertedText).then(
        () => setJustCopied(true),
        () => {}
      )
      return
    }
    if (event.key === "Escape" && sourceText) {
      event.preventDefault()
      clearAll()
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a bubbling key
    // handler scoped to the tool, not an interactive element of its own
    <div
      className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
    >
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* A toolbar, not a card.
          The card treatment put a bordered box around two groups that are not
          one thing — a direction switch and file actions — and at this width
          the band between them measured 535px, 44% of the row. An empty CARD
          reads as "something is missing here"; the same gap on the page reads
          as ordinary whitespace. The panels below are the only cards now, so
          the eye has one level of nesting to follow instead of two. */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <DirectionTabs
          value={preference}
          onChange={setPreference}
          resolvedHint={
            sourceText
              ? t("direction.resolved", { target: targetLang })
              : undefined
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept={SUPPORTED_EXTENSIONS.join(",")}
            className="sr-only"
            onChange={(event) => {
              const picked = event.target.files?.[0]
              if (picked) void file.importFile(picked)
              // Reset so choosing the SAME file twice fires change again — the
              // old modal never did this, which is why a second upload after a
              // successful one appeared to do nothing.
              event.target.value = ""
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInput.current?.click()}
            disabled={file.isBusy}
            aria-label={t("file.button")}
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            <span className="ml-2 max-sm:sr-only">{t("file.button")}</span>
          </Button>

          <DownloadMenu
            onDownload={(format: DownloadFormat) =>
              void file.download(convertedText, format)
            }
            disabled={!convertedText}
            isBusy={file.isBusy}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExceptionsOpen(true)}
            aria-label={t("exceptions.button")}
          >
            <BookLock className="h-4 w-4" aria-hidden="true" />
            <span className="ml-2 max-sm:sr-only">
              {t("exceptions.button")}
            </span>
            {exceptions.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 font-mono text-[10px] text-primary-foreground tabular-nums">
                {exceptions.length}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={!sourceText}
            aria-label={t("clear")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="ml-2 max-sm:sr-only">{t("clear")}</span>
          </Button>
        </div>
      </div>

      {file.errorKey && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive text-sm"
        >
          {t(`file.errors.${file.errorKey}`, { size: file.maxFileSizeMb })}
        </p>
      )}

      {/* Always mounted, so it collapses on its own instead of vanishing. */}
      <ProgressBar
        value={file.progress.percentage}
        active={file.showProgress}
        className={file.showProgress ? "mb-4" : "mb-0"}
        label={
          file.progress.statusKey
            ? t(`file.progress.${file.progress.statusKey}`)
            : t("file.button")
        }
      />

      <DropZone onFile={(dropped) => void file.importFile(dropped)}>
        <DualTextPanel
          sourceText={sourceText}
          convertedText={convertedText}
          sourcePlaceholder={
            isLatinSource
              ? t("inputPlaceholderLatin")
              : t("inputPlaceholderCyrillic")
          }
          sourceLabel={t("sourceInput", { sourceLang })}
          targetLabel={t("targetResult", { targetLang })}
          onSourceChange={setSourceText}
          onSwap={swap}
          onClear={clearAll}
          swapButtonTitle={t("swapDirection")}
          isProcessing={file.isBusy}
          statusComponent={
            file.fileName ? (
              <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="max-w-32 truncate">{file.fileName}</span>
              </span>
            ) : null
          }
          sourceEmptyState={
            <SourceEmptyActions
              onText={setSourceText}
              onSample={() => setSourceText(SAMPLE_TEXT)}
            />
          }
          targetFooterComponent={
            // Priority order, and it is deliberate: the copy acknowledgement
            // is transient and must win; after that, "why is this word still
            // in Latin?" is a real question and the shortcut hint is not.
            convertedText ? (
              justCopied ? (
                <span
                  aria-live="polite"
                  className="font-mono text-[11px] text-primary transition-colors duration-200"
                >
                  {t("copied")}
                </span>
              ) : preservedTerms.length > 0 ? (
                <PreservedTerms terms={preservedTerms} />
              ) : (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {t("shortcutHint")}
                </span>
              )
            ) : null
          }
          showShadow
          autoFocusSource
        />
      </DropZone>

      <ExceptionsDialog
        isOpen={exceptionsOpen}
        onClose={() => setExceptionsOpen(false)}
        exceptions={exceptions}
        onAdd={addException}
        onRemove={removeException}
      />
    </div>
  )
}
