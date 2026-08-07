"use client"

/**
 * JSON formatter and validator.
 *
 * Brought onto the same footing as the converter and the QR generator: the
 * page is `max-w-[1536px]` so its content edge meets the header and footer
 * (it was `max-w-7xl`, 256px narrower than the chrome above it), colour comes
 * from tokens rather than from `zinc`/`orange` palette classes, and the
 * controls are a row instead of a card wrapped around a gap.
 */

import { CodeHighlight } from "@webiston/ui/primitives/code-highlight"
import { AlertTriangle, FileJson } from "lucide-react"
import { useTranslations } from "next-intl"

import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { ControlBar, InfoSection, JsonTree } from "./components"
import { HIGHLIGHT_LIMIT_BYTES } from "./constants"
import { useJsonFormatter } from "./hooks/useJsonFormatter"
import { formatBytes } from "./utils/json"

const JsonFormatter = () => {
  const t = useTranslations("JsonFormatterPage")
  const tErrors = useTranslations("JsonFormatterPage.Errors")
  const {
    input,
    setInput,
    indent,
    setIndent,
    view,
    setView,
    showLineNumbers,
    toggleLineNumbers,
    result,
    hasAnalysis,
    output,
    outputBytes,
    fileError,
    acceptedFileTypes,
    readFile,
    download,
    loadSample,
    clear
  } = useJsonFormatter()

  // A filled dot, not a 10%-alpha one. The invalid state used
  // `bg-destructive/10` — the same value as the panel BACKGROUND behind it, so
  // the status dot was invisible exactly when it mattered.
  const status = hasAnalysis ? (
    <span
      className={`flex items-center gap-1.5 text-xs ${
        result.isValid ? "text-success" : "text-destructive"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${
          result.isValid ? "bg-success" : "bg-destructive"
        }`}
      />
      {result.isValid ? t("Panel.validFormat") : t("Panel.errorExists")}
    </span>
  ) : null

  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <FileJson size={44} className="opacity-40" aria-hidden="true" />
      <p className="mt-3 text-sm">{t("Panel.emptyStateTitle")}</p>
      <p className="mt-1 text-xs opacity-75">
        {t("Panel.emptyStateDescription")}
      </p>
    </div>
  )

  // The document's own numbers, the way the QR tool shows "29×29 modul":
  // size, keys, depth — measured, not decorative.
  const footer = output ? (
    <div className="flex flex-wrap gap-x-4 font-mono text-muted-foreground text-xs tabular-nums">
      <span>
        {t("Panel.fileSize")} {formatBytes(outputBytes)}
      </span>
      {result.stats && (
        <span>
          {t("Panel.stats", {
            keys: result.stats.keys,
            depth: result.stats.depth
          })}
        </span>
      )}
    </div>
  ) : null

  const targetContent =
    hasAnalysis && !result.isValid ? (
      <div className="p-4">
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={14}
              className="shrink-0 text-destructive"
              aria-hidden="true"
            />
            <strong className="font-medium text-destructive text-sm">
              {t("Panel.errorTitle")}
            </strong>
            {/* Where to look. The old error said only what was wrong. */}
            {result.position && (
              <span className="ml-auto font-mono text-destructive/80 text-xs tabular-nums">
                {t("Panel.errorPosition", {
                  line: result.position.line,
                  column: result.position.column
                })}
              </span>
            )}
          </div>
          <p className="mt-2 font-mono text-destructive text-sm">
            {tErrors(result.errorKind ?? "invalidJsonFormat")}
          </p>
          {/* Only for the failures we could not classify: better a raw engine
              sentence than nothing, but never in place of a translated one. */}
          {result.errorKind === "invalidJsonFormat" && result.errorDetail && (
            <p className="mt-1 font-mono text-destructive/70 text-xs">
              {tErrors("jsonError")} {result.errorDetail}
            </p>
          )}
        </div>
      </div>
    ) : view === "tree" && result.isValid ? (
      <JsonTree value={result.value} />
    ) : output ? (
      outputBytes > HIGHLIGHT_LIMIT_BYTES ? (
        // Plain monospace above the limit — see the constant. Same padding
        // and type as the highlighted view, so only the colour is lost.
        <pre className="whitespace-pre-wrap wrap-break-word p-4 font-mono text-foreground text-sm">
          {output}
        </pre>
      ) : (
        <CodeHighlight
          code={output}
          language="json"
          showLineNumbers={showLineNumbers}
        />
      )
    ) : null

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <ControlBar
        indent={indent}
        onIndentChange={setIndent}
        view={view}
        onViewChange={setView}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={toggleLineNumbers}
        canDownload={result.isValid && output.length > 0}
        acceptedFileTypes={acceptedFileTypes}
        onFile={readFile}
        onSample={loadSample}
        onDownload={download}
      />

      {/* Inline, dismissable by acting — a `window.alert` blocked the page and
          carried untranslated Uzbek even though the keys existed. */}
      {fileError && (
        <p
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-destructive text-sm"
        >
          <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
          {tErrors(fileError)}
        </p>
      )}

      <DualTextPanel
        sourceText={input}
        convertedText={output}
        sourcePlaceholder={t("Panel.sourcePlaceholder")}
        sourceLabel={t("Panel.sourceLabel")}
        targetLabel={
          view === "minified"
            ? t("Panel.targetLabelMinified")
            : view === "tree"
              ? t("Panel.targetLabelTree")
              : t("Panel.targetLabelFormatted")
        }
        onSourceChange={setInput}
        onClear={clear}
        showSwapButton={false}
        statusComponent={status}
        targetEmptyState={emptyState}
        targetFooterComponent={footer}
        customTargetContent={targetContent}
      />

      <InfoSection />
    </div>
  )
}

export default JsonFormatter
export { JsonFormatter }
