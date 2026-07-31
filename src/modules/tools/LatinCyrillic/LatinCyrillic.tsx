"use client"

/**
 * Latin ↔ Cyrillic converter.
 *
 * The client island. Everything static on this route — the alphabet table, the
 * FAQ, the JSON-LD — is rendered by `page.tsx` as a Server Component sibling,
 * so none of it costs the user any JavaScript.
 */

import { Button } from "@webiston/ui/primitives/button"
import { cn } from "@webiston/ui/utils"
import { Paperclip, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  DirectionTabs,
  DownloadMenu,
  DropZone,
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
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
    >
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-3 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
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
          >
            <Paperclip className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("file.button")}
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
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={!sourceText}
          >
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("clear")}
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

      {file.isBusy && (
        <div
          className="mb-4 h-1 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={file.progress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            file.progress.statusKey
              ? t(`file.progress.${file.progress.statusKey}`)
              : t("file.button")
          }
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${file.progress.percentage}%` }}
          />
        </div>
      )}

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
            convertedText ? (
              <span
                aria-live="polite"
                className={cn(
                  "font-mono text-[11px] transition-colors duration-200",
                  justCopied ? "text-primary" : "text-muted-foreground"
                )}
              >
                {justCopied ? t("copied") : t("shortcutHint")}
              </span>
            ) : null
          }
          showShadow
        />
      </DropZone>
    </div>
  )
}
