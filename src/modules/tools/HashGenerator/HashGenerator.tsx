"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Hash, Upload } from "lucide-react"

// Shared Components
import { ToolHeader } from "@/components/shared/ToolHeader"
import { DualTextPanel } from "@/components/shared/DualTextPanel"

// Local Components
import {
  ControlPanel,
  AlgorithmSelector,
  DetailedResults,
  InfoSection
} from "./components"

// Utils & Hooks
import { useHashGenerator } from "./hooks/useHashGenerator"

const HashGenerator = () => {
  const t = useTranslations("HashGeneratorPage")
  const [activeTab, setActiveTab] = useState<"text" | "file">("text")

  const {
    inputText,
    selectedAlgorithms,
    hashResults,
    isGenerating,
    availableAlgorithms,
    sampleTexts,
    setInputText,
    toggleAlgorithm,
    handleClear,
    handleFileUpload,
    downloadHashes,
    downloadAsJson,
    getAlgorithmInfo
  } = useHashGenerator({
    onSuccess: (message) => console.log(message),
    onError: (error) => console.error(error)
  })

  const handleFileUploadChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
      setActiveTab("text")
    }
  }

  const canDownload = hashResults.length > 0
  const hashOutputText =
    hashResults.length > 0
      ? hashResults
          .map((result) => `${result.algorithm}: ${result.hash}`)
          .join("\n\n")
      : ""

  // Status component
  const statusComponent =
    inputText.length > 0 ? (
      <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        {t("InputPanel.readyToHash") || "Hash yaratishga tayyor"}
      </span>
    ) : null

  // Target empty state
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500 dark:text-zinc-400">
        <Hash size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">
          {t("ResultsPanel.noResults") ||
            "Hash natijalari bu yerda ko'rsatiladi"}
        </p>
        <p className="mt-2 text-xs opacity-75">
          {t("ResultsPanel.instruction") || "Matn kiriting va algoritm tanlang"}
        </p>
      </div>
    </div>
  )

  // Target footer component
  const targetFooterComponent =
    hashResults.length > 0 ? (
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        <span>{t("ResultsPanel.hashCount") || "Hash soni"}:</span>{" "}
        <span className="text-zinc-700 dark:text-zinc-300">
          {hashResults.length}
        </span>
      </div>
    ) : null

  // Custom source content for file upload
  const customSourceContent =
    activeTab === "file" ? (
      <div className="flex h-full items-center justify-center">
        <label className="flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed border-zinc-300 p-8 transition-colors hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500">
          <Upload size={48} className="text-zinc-400 dark:text-zinc-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("InputPanel.selectFile") || "Faylni tanlang"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {t("InputPanel.supportedFormats") ||
                "TXT, JSON, CSV, MD, XML, LOG (10MB gacha)"}
            </p>
          </div>
          <input
            type="file"
            accept=".txt,.json,.csv,.md,.xml,.log"
            onChange={handleFileUploadChange}
            className="hidden"
          />
        </label>
      </div>
    ) : undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title={t("ToolHeader.title") || "Hash Generator"}
        description={
          t("ToolHeader.description") ||
          "MD5, SHA256, SHA512 va boshqa kriptografik hash algoritmlar bilan ma'lumotlarni hash qilish"
        }
      />

      {/* Control Panel */}
      <ControlPanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isGenerating={isGenerating}
        canDownload={canDownload}
        sampleTexts={sampleTexts}
        onFileUpload={handleFileUploadChange}
        onSampleSelect={setInputText}
        onClear={handleClear}
        onDownloadTxt={downloadHashes}
        onDownloadJson={downloadAsJson}
      />

      {/* Algorithm Selection */}
      <AlgorithmSelector
        availableAlgorithms={availableAlgorithms}
        selectedAlgorithms={selectedAlgorithms}
        onToggleAlgorithm={toggleAlgorithm}
        getAlgorithmInfo={getAlgorithmInfo}
      />

      {/* Dual Text Panel */}
      <DualTextPanel
        sourceText={inputText}
        convertedText={hashOutputText}
        sourcePlaceholder={
          t("InputPanel.textPlaceholder") ||
          "Hash qilmoqchi bo'lgan matnni kiriting..."
        }
        sourceLabel={
          activeTab === "text"
            ? t("InputPanel.textInput") || "Matn Kirish"
            : t("InputPanel.fileInput") || "Fayl Hash Kirish"
        }
        targetLabel={t("ResultsPanel.title") || "Hash Natijalari"}
        onSourceChange={setInputText}
        onClear={handleClear}
        showSwapButton={false}
        showShadow={true}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        customSourceContent={customSourceContent}
      />

      {/* Detailed Results */}
      <div className="mt-6">
        <DetailedResults
          hashResults={hashResults}
          getAlgorithmInfo={getAlgorithmInfo}
        />
      </div>

      {/* Info Section */}
      <InfoSection />
    </div>
  )
}

export default HashGenerator
