"use client"

/**
 * Latin-Cyrillic Transliteration Tool
 * Converts text between Uzbek Latin and Cyrillic scripts
 * Also supports Russian Cyrillic to Latin conversion
 */

import {
  ArrowLeftRight,
  ChevronDown,
  Download,
  FileText,
  X
} from "lucide-react"
import { useTranslations } from "next-intl"

// Shared Components
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"
import { GradientTabs, ShimmerButton } from "@/components/ui"
// UI Components
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

// Local imports
import { InfoSection } from "./components"
import { useLatinCyrillic } from "./hooks"
import type { SampleTextKey, TransliterationDirection } from "./types"

/**
 * Main component for Latin-Cyrillic transliteration tool
 * Follows dumb component pattern - all logic in useLatinCyrillic hook
 */
export function LatinCyrillicPage() {
  const t = useTranslations("LatinCyrillicPage")

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

  // Download result as text file
  const handleDownload = () => {
    if (!convertedText) return

    const content = [
      t("downloadFile.title"),
      "",
      `${t("downloadFile.createdAt")}: ${new Date().toLocaleString()}`,
      `${t("downloadFile.direction")}: ${sourceLang} → ${targetLang}`,
      "",
      t("downloadFile.sourceText"),
      sourceText,
      "",
      t("downloadFile.convertedText"),
      convertedText,
      "",
      "---",
      "",
      t("downloadFile.generatedBy")
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `transliteration-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
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

  // Status indicator
  const statusComponent = sourceText.length > 0 && (
    <span className="flex items-center gap-1 text-xs text-blue-400">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      {t("statusReady")}
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
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X size={16} className="mr-2" />
              {t("clear")}
            </Button>

            {/* Download Button */}
            <ShimmerButton
              onClick={handleDownload}
              disabled={!convertedText}
              variant={convertedText ? "default" : "outline"}
              size="sm"
            >
              <Download size={16} className="mr-2" />
              {t("download")}
            </ShimmerButton>
          </div>
        </div>
      </div>

      {/* Text Panels */}
      <DualTextPanel
        sourceText={sourceText}
        convertedText={convertedText}
        sourcePlaceholder={sourcePlaceholder}
        sourceLabel={t("sourceInput", { sourceLang })}
        targetLabel={t("targetResult", { targetLang })}
        onSourceChange={setSourceText}
        onSwap={handleSwap}
        onClear={handleClear}
        swapButtonTitle={t("swapDirection")}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        showShadow
      />

      {/* Information Section */}
      <InfoSection />
    </div>
  )
}
