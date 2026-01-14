import React, { useState } from "react"
import {
  Eye,
  EyeOff,
  FileText,
  ChevronDown,
  Upload,
  Key,
  CheckCircle,
  Info,
  ChevronUp
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { GradientTabs } from "@/components/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface ControlPanelProps {
  viewMode: "decoded" | "raw"
  setViewMode: (mode: "decoded" | "raw") => void
  showSignature: boolean
  handleToggleSignature: () => void
  isProcessing: boolean
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  loadSampleText: (sample: string) => void
  samples: Array<{ key: string; label: string; value: string }>
  isValid: boolean
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  viewMode,
  setViewMode,
  showSignature,
  handleToggleSignature,
  isProcessing,
  handleFileUpload,
  loadSampleText,
  samples,
  isValid
}) => {
  const t = useTranslations("JwtDecoderPage.ControlPanel")
  const tInfo = useTranslations("JwtDecoderPage.ViewModeInfo")
  const [showInfo, setShowInfo] = useState(false)

  const viewModeOptions = [
    { value: "decoded", label: t("decoded"), icon: <Eye size={16} /> },
    { value: "raw", label: t("raw"), icon: <EyeOff size={16} /> }
  ]

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* View Mode Tabs */}
            <GradientTabs
              options={viewModeOptions}
              value={viewMode}
              onChange={(value) => setViewMode(value as "decoded" | "raw")}
              toolCategory="converters"
            />

            {/* View Mode Info Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Info size={16} className="mr-1" />
              {showInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>

            {/* Sample Data Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" />
                  {t("sampleJwt")}
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {samples.map((sample) => (
                  <DropdownMenuItem
                    key={sample.key}
                    onClick={() => loadSampleText(sample.value)}
                  >
                    {sample.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* File Upload */}
            <div>
              <input
                type="file"
                accept=".txt,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="jwt-file-upload"
                disabled={isProcessing}
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="jwt-file-upload" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  {isProcessing ? t("uploading") : t("fileUpload")}
                </label>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {isValid && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                <CheckCircle size={16} />
                <span className="text-sm">{t("validJwt")}</span>
              </div>
            )}

            {/* Signature Toggle */}
            {isValid && (
              <Button
                onClick={handleToggleSignature}
                variant={showSignature ? "default" : "outline"}
                size="sm"
              >
                <Key size={16} className="mr-2" />
                {showSignature ? t("hideSignature") : t("showSignature")}
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible View Mode Info with smooth animation */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showInfo ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="mt-4 rounded-lg border border-blue-200/50 bg-blue-50/30 p-3 dark:border-blue-800/20 dark:bg-blue-900/10">
            <div className="space-y-2 text-sm">
              <p>
                <strong className="text-blue-700 dark:text-blue-300">
                  {tInfo("decoded")}:
                </strong>{" "}
                <span className="text-blue-600/90 dark:text-blue-200/90">
                  {tInfo("decodedDescription")}
                </span>
              </p>
              <p>
                <strong className="text-blue-700 dark:text-blue-300">
                  {tInfo("raw")}:
                </strong>{" "}
                <span className="text-blue-600/90 dark:text-blue-200/90">
                  {tInfo("rawDescription")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
