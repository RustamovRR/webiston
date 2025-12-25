"use client"

import { FileType, Copy, RefreshCw, Download, Check, Type } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ShimmerButton, GradientTabs } from "@/components/ui"

type GenerationType = "paragraphs" | "sentences" | "words" | "bytes"

interface ConfigPanelProps {
  settings: {
    generationType: GenerationType
    amount: number
    textType: string
    startWithLorem: boolean
  }
  alternativeTexts: Record<string, { name: string }>
  generatedText: string
  copied: boolean
  generateText: () => void
  loadSample: () => void
  updateSettings: (updates: Partial<ConfigPanelProps["settings"]>) => void
  handleCopy: () => void
  downloadText: () => void
  clearText: () => void
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  settings,
  alternativeTexts,
  generatedText,
  copied,
  generateText,
  loadSample,
  updateSettings,
  handleCopy,
  downloadText,
  clearText
}) => {
  const t = useTranslations("LoremIpsumPage.ConfigPanel")
  const tTypes = useTranslations("LoremIpsumPage.GenerationTypes")

  const generationTypeOptions = [
    {
      value: "paragraphs",
      label: tTypes("paragraphs"),
      icon: <Type size={16} />
    },
    {
      value: "sentences",
      label: tTypes("sentences"),
      icon: <FileType size={16} />
    },
    {
      value: "words",
      label: tTypes("words"),
      icon: <Copy size={16} />
    },
    {
      value: "bytes",
      label: tTypes("bytes"),
      icon: <RefreshCw size={16} />
    }
  ]

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("status")}
          </span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {/* Quick Start */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium text-zinc-800 dark:text-zinc-200">
              {t("quickStart")}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("quickStartDesc")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadSample} variant="outline" size="sm">
              <FileType className="mr-2 h-4 w-4" />
              {t("loadSample")}
            </Button>
          </div>
        </div>

        {/* Generation Type */}
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("generationType")}
          </h3>
          <GradientTabs
            options={generationTypeOptions}
            value={settings.generationType}
            onChange={(value: string) =>
              updateSettings({ generationType: value as GenerationType })
            }
            toolCategory="utilities"
          />
        </div>

        {/* Settings Grid */}
        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Amount Setting */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("amount")}: {settings.amount}
            </label>
            <Input
              type="number"
              min="1"
              max="1000"
              value={settings.amount}
              onChange={(e) =>
                updateSettings({ amount: parseInt(e.target.value) || 1 })
              }
              className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              {t("amountRange")}
            </p>
          </div>

          {/* Text Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("textType")}
            </label>
            <Select
              value={settings.textType}
              onValueChange={(value) => updateSettings({ textType: value })}
            >
              <SelectTrigger className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(alternativeTexts).map(([key, data]) => (
                  <SelectItem key={key} value={key}>
                    {data.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lorem Checkbox */}
          {settings.textType === "cicero" && (
            <div className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                id="startWithLorem"
                checked={settings.startWithLorem}
                onChange={(e) =>
                  updateSettings({ startWithLorem: e.target.checked })
                }
                className="rounded border-zinc-300 bg-zinc-50 accent-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <label
                htmlFor="startWithLorem"
                className="text-sm text-zinc-700 dark:text-zinc-200"
              >
                {t("startWithLorem")}
              </label>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ShimmerButton onClick={generateText} size="sm">
            <Type className="mr-2 h-4 w-4" />
            {t("generateText")}
          </ShimmerButton>

          {generatedText && (
            <div className="flex items-center gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm">
                {copied ? (
                  <Check size={16} className="mr-2 text-green-500" />
                ) : (
                  <Copy size={16} className="mr-2" />
                )}
                {copied ? t("copied") : t("copy")}
              </Button>

              <Button onClick={downloadText} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                {t("download")}
              </Button>

              <Button onClick={clearText} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("clear")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigPanel
