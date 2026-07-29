import {
  Download,
  Hash,
  Image,
  QrCode,
  Settings,
  Upload,
  X,
  Zap
} from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"
import { useEffect, useState } from "react"
import { GradientTabs, ShimmerButton } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib"
import type { QrErrorLevel, QrPreset, QrSize } from "../hooks/useQrGenerator"

interface ControlPanelProps {
  qrSize: QrSize
  errorLevel: QrErrorLevel
  isGenerating: boolean
  availableSizes: ReadonlyArray<{
    readonly value: number
    readonly label: string
    readonly description: string
  }>
  errorLevels: ReadonlyArray<{
    readonly value: string
    readonly label: string
    readonly description: string
  }>
  groupedPresets: Record<string, QrPreset[]>
  canDownload: boolean
  inputText: string
  onSizeChange: (size: QrSize) => void
  onErrorLevelChange: (level: QrErrorLevel) => void
  onPresetSelect: (preset: QrPreset) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  onDownload: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  qrSize,
  errorLevel,
  isGenerating,
  availableSizes,
  errorLevels,
  groupedPresets,
  canDownload,
  inputText,
  onSizeChange,
  onErrorLevelChange,
  onPresetSelect,
  onFileUpload,
  onClear,
  onDownload
}) => {
  const t = useTranslations("QrGeneratorPage.ControlPanel")
  const tCategories = useTranslations("QrGeneratorPage.Categories")
  const tSizes = useTranslations("QrGeneratorPage.Sizes")
  const _tErrorLevels = useTranslations("QrGeneratorPage.ErrorLevels")

  const [activeCategory, setActiveCategory] = useState("url")
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Reset selected preset when input text changes manually
  useEffect(() => {
    if (selectedPreset && inputText.trim() !== selectedPreset.trim()) {
      setSelectedPreset(null)
    }
  }, [inputText, selectedPreset])

  const categoryOptions = [
    {
      value: "url",
      label: tCategories("url"),
      icon: <Hash size={16} />
    },
    {
      value: "contact",
      label: tCategories("contact"),
      icon: <Zap size={16} />
    },
    {
      value: "text",
      label: tCategories("text"),
      icon: <X size={16} />
    },
    {
      value: "wifi",
      label: tCategories("wifi"),
      icon: <Settings size={16} />
    },
    {
      value: "sms",
      label: tCategories("sms"),
      icon: <QrCode size={16} />
    }
  ]

  const sizeOptions = availableSizes.map((size) => ({
    value: size.value.toString(),
    label: size.label,
    icon: <Image size={16} />
  }))

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
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Selection */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("categoryLabel")}
            </span>
            <GradientTabs
              options={categoryOptions}
              value={activeCategory}
              onChange={setActiveCategory}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">
                {tCategories(`descriptions.${activeCategory}`)}
              </div>
            </div>
          </div>

          {/* QR Size */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("sizeLabel")}
            </span>
            <GradientTabs
              options={sizeOptions}
              value={qrSize.toString()}
              onChange={(value) => onSizeChange(Number(value) as QrSize)}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">
                {tSizes("description")}
              </div>
            </div>
          </div>
        </div>

        {/* Error Level */}
        <div className="mt-6 space-y-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("errorLevelLabel")}
          </span>
          <div className="grid gap-2 md:grid-cols-4">
            {errorLevels.map((level) => (
              <label
                key={level.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors",
                  errorLevel === level.value
                    ? "border-green-500 bg-green-500/10 text-success"
                    : "border-border text-muted-foreground hover:border-zinc-400 hover:text-foreground dark:hover:border-zinc-600"
                )}
              >
                <input
                  type="radio"
                  name="errorLevel"
                  value={level.value}
                  checked={errorLevel === level.value}
                  onChange={(e) =>
                    onErrorLevelChange(e.target.value as QrErrorLevel)
                  }
                  className="sr-only"
                />
                <div className="text-sm font-medium">{level.label}</div>
                <div className="text-xs opacity-75">{level.description}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Preset Selection */}
        {groupedPresets[activeCategory] && (
          <div className="mt-6 space-y-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("presetsLabel")}
            </span>
            <div className="grid gap-2 md:grid-cols-2">
              {groupedPresets[activeCategory].map(
                (preset: QrPreset, index: number) => {
                  const isActive = inputText.trim() === preset.value.trim()

                  const handlePresetClick = () => {
                    setSelectedPreset(preset.value)
                    onPresetSelect(preset)
                  }

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 transition-colors",
                        isActive
                          ? "border-info bg-info/10"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            isActive ? "text-info" : "text-foreground"
                          )}
                        >
                          {preset.label}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            isActive ? "text-info" : "text-muted-foreground"
                          )}
                        >
                          {preset.description}
                        </div>
                      </div>
                      <Button
                        onClick={handlePresetClick}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "ml-2",
                          isActive && "bg-info text-white hover:bg-info"
                        )}
                      >
                        {isActive ? t("selected") : t("load")}
                      </Button>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* File Upload */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".txt,.json,.csv,.md"
                onChange={onFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  {t("fileUpload")}
                </label>
              </Button>
            </div>

            {/* Clear */}
            {inputText && (
              <Button onClick={onClear} variant="outline" size="sm">
                <X size={16} className="mr-2" />
                {t("clear")}
              </Button>
            )}
          </div>

          {/* Download */}
          {canDownload && (
            <ShimmerButton
              onClick={onDownload}
              disabled={isGenerating}
              size="sm"
            >
              <Download size={16} className="mr-2" />
              {isGenerating ? t("downloading") : t("download")}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
