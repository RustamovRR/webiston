"use client"

import { FileJson } from "lucide-react"
import { useTranslations } from "next-intl"
import { DualTextPanel } from "@/components/shared/DualTextPanel"
// Shared Components
import { ToolHeader } from "@/components/shared/ToolHeader"
import { CodeHighlight } from "@/components/ui"

// Local Components
import { ControlPanel, InfoSection } from "./components"

// Utils & Hooks
import { useJsonFormatter } from "./hooks/useJsonFormatter"

const JsonFormatter = () => {
  const t = useTranslations("JsonFormatterPage")
  const {
    inputJson,
    setInputJson,
    indentation,
    setIndentation,
    showLineNumbers,
    isMinified,
    jsonResult,
    handleFileUpload,
    loadSampleJson,
    downloadResult,
    clearInput,
    toggleMinify,
    toggleLineNumbers
  } = useJsonFormatter()

  const displayJson = isMinified ? jsonResult.minified : jsonResult.formatted
  const fileSizeKB = Math.round((displayJson.length / 1024) * 100) / 100

  // Status component for JSON validation
  const statusComponent =
    inputJson.length > 0 ? (
      jsonResult.isValid ? (
        <span className="flex items-center gap-1 text-xs text-success">
          <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
          {t("Panel.validFormat")}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive/10"></div>
          {t("Panel.errorExists")}
        </span>
      )
    ) : null

  // Target empty state
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileJson size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">{t("Panel.emptyStateTitle")}</p>
        <p className="mt-2 text-xs opacity-75">
          {t("Panel.emptyStateDescription")}
        </p>
      </div>
    </div>
  )

  // Target footer component
  const targetFooterComponent = displayJson ? (
    <div className="text-xs text-muted-foreground">
      <span className="text-zinc-500">{t("Panel.fileSize")}</span>{" "}
      <span className="text-zinc-700 dark:text-zinc-300">{fileSizeKB} KB</span>
    </div>
  ) : null

  // Custom target content for JSON with syntax highlighting
  const targetContent =
    jsonResult.error && !jsonResult.isValid ? (
      <div className="p-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive/10"></div>
            <strong className="text-sm text-destructive">
              {t("Panel.errorTitle")}
            </strong>
          </div>
          <p className="font-mono text-sm text-destructive">
            {jsonResult.error}
          </p>
        </div>
      </div>
    ) : displayJson ? (
      <CodeHighlight
        code={displayJson}
        language="json"
        showLineNumbers={showLineNumbers}
      />
    ) : null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <ControlPanel
        indentation={indentation}
        setIndentation={setIndentation}
        showLineNumbers={showLineNumbers}
        isMinified={isMinified}
        isValid={jsonResult.isValid}
        handleFileUpload={handleFileUpload}
        loadSampleJson={loadSampleJson}
        clearInput={clearInput}
        toggleMinify={toggleMinify}
        toggleLineNumbers={toggleLineNumbers}
        downloadResult={downloadResult}
      />

      <DualTextPanel
        sourceText={inputJson}
        convertedText={displayJson}
        sourcePlaceholder={t("Panel.sourcePlaceholder")}
        sourceLabel={t("Panel.sourceLabel")}
        targetLabel={
          isMinified
            ? t("Panel.targetLabelMinified")
            : t("Panel.targetLabelFormatted")
        }
        onSourceChange={setInputJson}
        onClear={clearInput}
        showSwapButton={false}
        showShadow={true}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        customTargetContent={targetContent}
      />

      <InfoSection />
    </div>
  )
}

export default JsonFormatter
