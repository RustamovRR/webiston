"use client"

import { Check, Copy, Download, FileType, RefreshCw, Type } from "lucide-react"
import { useTranslations } from "next-intl"
import { GradientTabs, ShimmerButton } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

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
    <div className="mb-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-foreground">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-muted-foreground">{t("status")}</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {/* Quick Start */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium text-foreground">{t("quickStart")}</h3>
            <p className="text-sm text-muted-foreground">
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
          <h3 className="text-sm font-medium text-foreground">
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
            <label
              htmlFor="configpanel-amount"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {t("amount")}: {settings.amount}
            </label>
            <Input
              id="configpanel-amount"
              type="number"
              min="1"
              max="1000"
              value={settings.amount}
              onChange={(e) =>
                updateSettings({ amount: parseInt(e.target.value, 10) || 1 })
              }
              className="border-border bg-muted/50"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t("amountRange")}
            </p>
          </div>

          {/* Text Type */}
          <div>
            <label
              htmlFor="configpanel-texttype"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {t("textType")}
            </label>
            <Select
              value={settings.textType}
              onValueChange={(value) => updateSettings({ textType: value })}
            >
              <SelectTrigger
                id="configpanel-texttype"
                className="border-border bg-muted/50"
              >
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
                className="rounded border-border bg-muted accent-blue-500"
              />
              <label
                htmlFor="startWithLorem"
                className="text-sm text-foreground"
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
                  <Check size={16} className="mr-2 text-success" />
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
