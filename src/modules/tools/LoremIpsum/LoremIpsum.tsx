"use client"

import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToolHeader, StatsDisplay } from "@/components/shared"
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ConfigPanel, InfoSection, HelpSection } from "./components"
import { useLoremIpsum } from "./hooks/useLoremIpsum"
import { useTranslations } from "next-intl"

export default function LoremIpsumPage() {
  const t = useTranslations("LoremIpsumPage.ToolHeader")
  const tPanel = useTranslations("LoremIpsumPage.MainPanel")

  const {
    generatedText,
    copied,
    settings,
    textInfo,
    alternativeTexts,
    textStats,
    generateText,
    clearText,
    loadSample,
    updateSettings,
    handleCopy,
    downloadText
  } = useLoremIpsum()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t("title")} description={t("description")} />

      <ConfigPanel
        settings={settings}
        alternativeTexts={alternativeTexts}
        generatedText={generatedText}
        copied={copied}
        generateText={generateText}
        loadSample={loadSample}
        updateSettings={updateSettings}
        handleCopy={handleCopy}
        downloadText={downloadText}
        clearText={clearText}
      />

      {/* Stats Display */}
      {generatedText && <StatsDisplay stats={textStats} className="mb-6" />}

      {/* Main Panel */}
      <DualTextPanel
        sourceText={generatedText}
        convertedText={textInfo}
        sourcePlaceholder={tPanel("sourcePlaceholder")}
        sourceLabel={tPanel("sourceLabel")}
        targetLabel={tPanel("targetLabel")}
        onSourceChange={(text) => {
          // Allow manual editing if needed
        }}
        variant="terminal"
        showSwapButton={false}
        showClearButton={false}
        statusComponent={
          generatedText && (
            <div className="flex items-center gap-2">
              <Button onClick={handleCopy} variant="ghost" size="sm">
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          )
        }
      />

      <InfoSection alternativeTexts={alternativeTexts} />

      <HelpSection />
    </div>
  )
}
