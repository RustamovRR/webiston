"use client"

/**
 * Latin-Cyrillic Transliteration Tool
 * Converts text between Uzbek Latin and Cyrillic scripts
 * Also supports Russian Cyrillic to Latin conversion
 */

import { ArrowLeftRight, ChevronDown, FileText, Upload, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

// Shared Components
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"
import { GradientTabs } from "@/components/ui"
// UI Components
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

// Local imports
import {
  ChunkSelector,
  DownloadMenu,
  FileUploadModal,
  InfoSection
} from "./components"
import { useFileTransliterate, useLatinCyrillic } from "./hooks"
import type {
  DownloadFormat,
  SampleTextKey,
  TransliterationDirection
} from "./types"

/**
 * Main component for Latin-Cyrillic transliteration tool
 * Follows dumb component pattern - all logic in hooks
 */
export function LatinCyrillicPage() {
  const t = useTranslations("LatinCyrillicPage")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const {
    direction,
    sourceText,
    convertedText,
    sourceLang,
    targetLang,
    sourcePlaceholder,
    samples,
    setDirection,
    setSourceText,
    handleSwap,
    handleClear,
    loadSample
  } = useLatinCyrillic()

  // File upload hook - auto-close modal on success
  const fileHandler = useFileTransliterate((text) => {
    setSourceText(text)
    // Close modal after short delay to show success state
    setTimeout(() => setIsUploadModalOpen(false), 800)
  })

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    await fileHandler.uploadFile(file)
  }

  // Handle clear - reset both text and file state
  const handleFullClear = () => {
    handleClear()
    fileHandler.reset()
  }

  // Handle chunk selection
  const handleChunkSelect = (chunkId: number | null) => {
    fileHandler.selectChunk(chunkId)
  }

  // Handle download current (chunk or all based on selection)
  const handleDownloadCurrent = async (format: DownloadFormat) => {
    await fileHandler.downloadCurrent(
      convertedText,
      format,
      fileHandler.selectedChunkId === null
    )
  }

  // Handle download all chunks - downloads the full converted text
  const handleDownloadAll = async (format: DownloadFormat) => {
    // Download full converted text, not source chunks
    await fileHandler.downloadCurrent(convertedText, format, true)
  }

  // Tab options for direction selection
  const tabOptions = [
    {
      value: "latin-to-cyrillic" as TransliterationDirection,
      label: t("latinToCyrillic"),
      icon: <ArrowLeftRight size={16} />
    },
    {
      value: "cyrillic-to-latin" as TransliterationDirection,
      label: t("cyrillicToLatin"),
      icon: <ArrowLeftRight size={16} className="rotate-180" />
    }
  ]

  // Status indicator with file info
  const statusComponent = sourceText.length > 0 && (
    <span className="flex items-center gap-1 text-xs text-blue-400">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      {fileHandler.fileName ? (
        <span className="max-w-32 truncate">{fileHandler.fileName}</span>
      ) : (
        t("statusReady")
      )}
    </span>
  )

  // Empty state for target panel
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">{t("emptyStateTitle")}</p>
        <p className="mt-2 text-xs opacity-75">{t("emptyStateDescription")}</p>
      </div>
    </div>
  )

  // Footer for target panel
  const targetFooterComponent = convertedText && (
    <div className="text-xs text-zinc-400">
      <span className="text-zinc-500">{t("alphabet")}:</span>{" "}
      <span className="text-zinc-300">{targetLang}</span>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* Control Panel */}
      <div className="mb-6 rounded-lg border p-4 backdrop-blur-sm dark:border-none dark:bg-zinc-900/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Direction Tabs */}
          <div className="flex flex-wrap items-center gap-4">
            <GradientTabs
              options={tabOptions}
              value={direction}
              onChange={(value) =>
                setDirection(value as TransliterationDirection)
              }
              toolCategory="converters"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* File Upload Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload size={16} className="mr-2" />
              {t("fileUpload.button")}
            </Button>

            {/* Sample Texts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" />
                  {t("sampleTexts")}
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {samples.map((sample) => (
                  <DropdownMenuItem
                    key={sample.key}
                    onClick={() => loadSample(sample.key as SampleTextKey)}
                  >
                    {sample.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Button */}
            <Button variant="ghost" size="sm" onClick={handleFullClear}>
              <X size={16} className="mr-2" />
              {t("clear")}
            </Button>

            {/* Download Menu - enhanced with chunk options */}
            <DownloadMenu
              onDownloadCurrent={handleDownloadCurrent}
              onDownloadAll={handleDownloadAll}
              disabled={!convertedText}
              isProcessing={fileHandler.isProcessing}
              hasChunks={fileHandler.hasMultipleChunks}
              selectedChunkId={fileHandler.selectedChunkId}
            />
          </div>
        </div>
      </div>

      {/* Chunk Selector - shows when file has multiple chunks */}
      {fileHandler.hasMultipleChunks && (
        <ChunkSelector
          chunks={fileHandler.chunks}
          selectedChunkId={fileHandler.selectedChunkId}
          onSelectChunk={handleChunkSelect}
        />
      )}

      {/* Text Panels */}
      <DualTextPanel
        sourceText={sourceText}
        convertedText={convertedText}
        sourcePlaceholder={sourcePlaceholder}
        sourceLabel={t("sourceInput", { sourceLang })}
        targetLabel={t("targetResult", { targetLang })}
        onSourceChange={setSourceText}
        onSwap={handleSwap}
        onClear={handleFullClear}
        swapButtonTitle={t("swapDirection")}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        showShadow
      />

      {/* Information Section */}
      <InfoSection />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileSelect={handleFileSelect}
        isDragging={fileHandler.isDragging}
        isProcessing={fileHandler.isProcessing}
        status={fileHandler.status}
        progress={fileHandler.progress}
        error={fileHandler.error}
        fileName={fileHandler.fileName}
        onDragEnter={fileHandler.handleDragEnter}
        onDragLeave={fileHandler.handleDragLeave}
        onDragOver={fileHandler.handleDragOver}
        onDrop={fileHandler.handleDrop}
      />
    </div>
  )
}
