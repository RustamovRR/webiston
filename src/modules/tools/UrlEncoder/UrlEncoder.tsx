"use client"

import { FileText, ArrowLeftRight, ExternalLink, Link } from "lucide-react"
import { useTranslations } from "next-intl"

// Shared Components
import { ToolHeader } from "@/components/shared/ToolHeader"
import { DualTextPanel } from "@/components/shared/DualTextPanel/DualTextPanel"

// Local Components
import { InfoSection, ControlPanel } from "./components"

// Utils & Hooks
import { useUrlEncoder } from "./hooks/useUrlEncoder"

const UrlEncoder = () => {
  const t = useTranslations("UrlEncoderPage")
  const {
    inputText,
    setInputText,
    mode,
    setMode,
    isProcessing,
    result,
    handleModeSwitch,
    handleClear,
    handleFileUpload,
    downloadResult,
    loadSampleText,
    canDownload,
    samples
  } = useUrlEncoder()

  const handleFileUploadWrapper = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const displayOutput = result.output || ""
  const fileSizeKB = Math.round((displayOutput.length / 1024) * 100) / 100

  // Status component
  const statusComponent =
    inputText.length > 0 ? (
      <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        {mode === "encode"
          ? t("Panel.readyToEncode")
          : t("Panel.readyToDecode")}
      </span>
    ) : null

  // Target empty state
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">
          {mode === "encode"
            ? t("Panel.encodedUrlWillAppear")
            : t("Panel.decodedTextWillAppear")}
        </p>
        <p className="mt-2 text-xs opacity-75">
          {t("Panel.enterTextOrUpload")}
        </p>
      </div>
    </div>
  )

  // Target footer component
  const targetFooterComponent = displayOutput ? (
    <div className="text-xs text-zinc-600 dark:text-zinc-400">
      <span className="text-zinc-500">{t("Panel.fileSize")}</span>{" "}
      <span className="text-zinc-700 dark:text-zinc-300">{fileSizeKB} KB</span>
    </div>
  ) : null

  // Custom target content for errors or URL info
  const targetContent =
    result.error && !result.isValid ? (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"></div>
            <strong className="text-sm text-red-700 dark:text-red-400">
              {t("Panel.conversionError")}
            </strong>
          </div>
          <p className="font-mono text-sm text-red-600 dark:text-red-300">
            {result.error}
          </p>
        </div>
      </div>
    ) : result.urlInfo?.isValidUrl ? (
      <div className="space-y-4 p-4">
        <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
          {displayOutput}
        </pre>

        {/* URL Info Section */}
        <div className="rounded-lg border border-zinc-300/30 bg-zinc-100/50 p-4 dark:border-zinc-700/30 dark:bg-zinc-800/30">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <Link size={16} className="text-indigo-400" />
            {t("Panel.urlStructure")}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="min-w-[80px] font-medium text-zinc-700 dark:text-zinc-300">
                Protocol:
              </span>
              <code className="rounded bg-zinc-200/50 px-2 py-1 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                {result.urlInfo.protocol}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="min-w-[80px] font-medium text-zinc-700 dark:text-zinc-300">
                Hostname:
              </span>
              <code className="rounded bg-zinc-200/50 px-2 py-1 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                {result.urlInfo.hostname}
              </code>
            </div>
            {result.urlInfo.pathname && (
              <div className="flex items-center gap-2">
                <span className="min-w-[80px] font-medium text-zinc-700 dark:text-zinc-300">
                  Path:
                </span>
                <code className="rounded bg-zinc-200/50 px-2 py-1 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {result.urlInfo.pathname}
                </code>
              </div>
            )}
            {result.urlInfo.search && (
              <div className="flex items-center gap-2">
                <span className="min-w-[80px] font-medium text-zinc-700 dark:text-zinc-300">
                  Query:
                </span>
                <code className="rounded bg-zinc-200/50 px-2 py-1 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {result.urlInfo.search}
                </code>
              </div>
            )}
            {result.urlInfo.hash && (
              <div className="flex items-center gap-2">
                <span className="min-w-[80px] font-medium text-zinc-700 dark:text-zinc-300">
                  Hash:
                </span>
                <code className="rounded bg-zinc-200/50 px-2 py-1 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {result.urlInfo.hash}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : null

  // Extra header component for valid URL
  const extraHeaderComponent =
    result.urlInfo?.isValidUrl && !result.error ? (
      <div className="flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
        <ExternalLink size={14} />
        <span>{t("Panel.validUrl")}</span>
      </div>
    ) : null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <ControlPanel
        mode={mode}
        setMode={setMode}
        isProcessing={isProcessing}
        handleFileUpload={handleFileUploadWrapper}
        samples={samples}
        loadSampleText={loadSampleText}
        handleClear={handleClear}
        canDownload={canDownload}
        downloadResult={downloadResult}
        handleModeSwitch={handleModeSwitch}
      />

      <DualTextPanel
        sourceText={inputText}
        convertedText={displayOutput}
        sourcePlaceholder={
          mode === "encode"
            ? t("Panel.encodePlaceholder")
            : t("Panel.decodePlaceholder")
        }
        sourceLabel={
          mode === "encode"
            ? t("Panel.plainTextInput")
            : t("Panel.encodedUrlInput")
        }
        targetLabel={
          mode === "encode"
            ? t("Panel.encodedUrlResult")
            : t("Panel.decodedUrlResult")
        }
        onSourceChange={setInputText}
        onSwap={handleModeSwitch}
        onClear={handleClear}
        swapIcon={<ArrowLeftRight size={20} />}
        swapButtonTitle={t("Panel.switchMode")}
        showSwapButton={true}
        showShadow={true}
        isProcessing={isProcessing}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        customTargetContent={targetContent}
        extraHeaderComponent={extraHeaderComponent}
      />

      <InfoSection />
    </div>
  )
}

export default UrlEncoder
