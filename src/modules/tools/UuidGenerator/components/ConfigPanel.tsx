import {
  Clock,
  Dice6,
  FileText,
  Hash,
  RefreshCw,
  Settings,
  Shuffle
} from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"
import { GradientTabs, ShimmerButton } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib"
import type { UuidFormat, UuidVersion } from "../hooks/useUuidGenerator"

interface ConfigPanelProps {
  count: number
  version: UuidVersion
  format: UuidFormat
  isGenerating: boolean
  sampleCounts: Array<{ label: string; value: number }>
  onCountChange: (count: number) => void
  onVersionChange: (version: UuidVersion) => void
  onFormatChange: (format: UuidFormat) => void
  onGenerate: () => void
  onClear: () => void
  onLoadSample: (count: number) => void
  hasResults: boolean
  getVersionInfo: (version: UuidVersion) => any
  getFormatInfo: (format: UuidFormat) => any
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  count,
  version,
  format,
  isGenerating,
  sampleCounts,
  onCountChange,
  onVersionChange,
  onFormatChange,
  onGenerate,
  onClear,
  onLoadSample,
  hasResults,
  getVersionInfo,
  getFormatInfo
}) => {
  const t = useTranslations("UuidGeneratorPage.ConfigPanel")
  const tVersion = useTranslations("UuidGeneratorPage.VersionSelector")
  const tFormat = useTranslations("UuidGeneratorPage.FormatSelector")

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 1
    onCountChange(value)
  }

  const versionOptions = [
    {
      value: "v4",
      label: tVersion("v4"),
      icon: <Shuffle size={16} />
    },
    {
      value: "v1",
      label: tVersion("v1"),
      icon: <Clock size={16} />
    },
    {
      value: "nil",
      label: tVersion("nil"),
      icon: <Hash size={16} />
    }
  ]

  const formatOptions = [
    {
      value: "standard",
      label: tFormat("standard"),
      icon: <Hash size={16} />
    },
    {
      value: "compact",
      label: tFormat("compact"),
      icon: <FileText size={16} />
    },
    {
      value: "brackets",
      label: tFormat("brackets"),
      icon: <Settings size={16} />
    },
    {
      value: "uppercase",
      label: tFormat("uppercase"),
      icon: <Dice6 size={16} />
    }
  ]

  const currentVersionInfo = getVersionInfo(version)
  const currentFormatInfo = getFormatInfo(format)

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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* UUID Version */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-foreground">
              {t("versionLabel")}
            </span>
            <GradientTabs
              options={versionOptions}
              value={version}
              onChange={(value) => onVersionChange(value as UuidVersion)}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">
                {currentVersionInfo.description}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Xavfsizlik:
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    currentVersionInfo.security === "High" && "text-success",
                    currentVersionInfo.security === "Medium" &&
                      "text-yellow-400",
                    currentVersionInfo.security === "None" && "text-destructive"
                  )}
                >
                  {currentVersionInfo.security}
                </span>
                {currentVersionInfo.recommended && (
                  <span className="rounded bg-green-900/30 px-1.5 py-0.5 text-xs text-success">
                    Tavsiya
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* UUID Format */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-foreground">
              {t("formatLabel")}
            </span>
            <GradientTabs
              options={formatOptions}
              value={format}
              onChange={(value) => onFormatChange(value as UuidFormat)}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">
                {currentFormatInfo.description}
              </div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                {currentFormatInfo.example}
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Count */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="configpanel-countlabel"
                className="text-sm font-medium text-foreground"
              >
                {t("countLabel")}
              </label>
              <input
                id="configpanel-countlabel"
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={handleCountChange}
                disabled={isGenerating}
                className="w-20 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors focus:border-zinc-400 focus:outline-none disabled:opacity-50 dark:focus:border-zinc-600"
              />
              <span className="text-xs text-muted-foreground">
                {t("countRange")}
              </span>
            </div>

            {/* Sample selections */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("sampleLabel")}
              </span>
              {sampleCounts.map((sample) => (
                <Button
                  key={sample.value}
                  onClick={() => onLoadSample(sample.value)}
                  variant={count === sample.value ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 px-2 text-xs transition-colors",
                    count === sample.value
                      ? "bg-info text-white hover:bg-info"
                      : "hover:bg-muted"
                  )}
                >
                  {sample.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Generate */}
            <ShimmerButton
              onClick={onGenerate}
              disabled={isGenerating}
              size="sm"
            >
              <RefreshCw
                size={16}
                className={cn("mr-2", isGenerating && "animate-spin")}
              />
              {isGenerating ? t("generating") : t("generateButton")}
            </ShimmerButton>

            {/* Clear */}
            {hasResults && (
              <Button onClick={onClear} variant="outline" size="sm">
                {t("clearButton")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigPanel
