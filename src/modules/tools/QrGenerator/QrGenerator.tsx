"use client"

import { FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { ToolHeader, DualTextPanel } from "@/components/shared"
import { ControlPanel, QrDisplay, InfoSection } from "./components"
import CollapsibleCustomizationPanel from "./components/CollapsibleCustomizationPanel"
import { useQrGenerator } from "./hooks/useQrGenerator"

const QrGenerator = () => {
  const t = useTranslations("QrGeneratorPage.ToolHeader")
  const tInput = useTranslations("QrGeneratorPage.InputPanel")
  const tResults = useTranslations("QrGeneratorPage.ResultsPanel")
  const {
    inputText,
    qrUrl,
    customQrUrl,
    qrSize,
    errorLevel,
    isGenerating,
    stats,
    groupedPresets,
    availableSizes,
    errorLevels,
    customization,
    setInputText,
    setQrSize,
    setErrorLevel,
    setCustomization,
    handlePresetSelect,
    handleClear,
    downloadQr,
    handleFileUpload,
    detectInputType
  } = useQrGenerator({
    onSuccess: (message) => console.log(message),
    onError: (error) => console.error(error)
  })

  const handleFileUploadChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const inputType = detectInputType(inputText)
  const canDownload = !!customQrUrl

  // Status component
  const statusComponent =
    inputText.length > 0 ? (
      <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        {tInput("status")}
      </span>
    ) : null

  // Target empty state
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">{tResults("emptyTitle")}</p>
        <p className="mt-2 text-xs opacity-75">
          {tResults("emptyDescription")}
        </p>
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t("title")} description={t("description")} />

      <ControlPanel
        qrSize={qrSize}
        errorLevel={errorLevel}
        isGenerating={isGenerating}
        availableSizes={availableSizes}
        errorLevels={errorLevels}
        groupedPresets={groupedPresets}
        canDownload={canDownload}
        inputText={inputText}
        onSizeChange={setQrSize}
        onErrorLevelChange={setErrorLevel}
        onPresetSelect={handlePresetSelect}
        onFileUpload={handleFileUploadChange}
        onClear={handleClear}
        onDownload={downloadQr}
      />

      <DualTextPanel
        sourceText={inputText}
        convertedText={
          customQrUrl
            ? `${tResults("success")}\n\n${tResults("originalText")}\n${inputText.length > 100 ? inputText.substring(0, 100) + "..." : inputText}\n\n${tResults("size")} ${qrSize}x${qrSize} pixels\n${tResults("errorCorrection")} ${errorLevel}\n${tResults("type")} ${inputType}\n\n${tResults("note")}`
            : ""
        }
        sourceLabel={tInput("title")}
        targetLabel={tResults("title")}
        onSourceChange={setInputText}
        sourcePlaceholder={tInput("placeholder")}
        onClear={handleClear}
        showSwapButton={false}
        isProcessing={isGenerating}
        variant="terminal"
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        showShadow={true}
      />

      <CollapsibleCustomizationPanel
        customization={customization}
        onCustomizationChange={setCustomization}
        isValid={!!inputText.trim()}
        qrUrl={qrUrl}
        inputText={inputText}
      />

      <QrDisplay
        qrUrl={customQrUrl}
        qrSize={qrSize}
        errorLevel={errorLevel}
        inputType={inputType}
        inputText={inputText}
        customization={customization}
        stats={stats}
        onDownload={downloadQr}
      />

      <InfoSection />
    </div>
  )
}

export default QrGenerator
