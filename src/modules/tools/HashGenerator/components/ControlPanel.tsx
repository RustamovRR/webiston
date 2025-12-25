import React from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, FileText, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShimmerButton, GradientTabs } from "@/components/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface ControlPanelProps {
  activeTab: "text" | "file"
  setActiveTab: (tab: "text" | "file") => void
  isGenerating: boolean
  canDownload: boolean
  sampleTexts: readonly { readonly label: string; readonly value: string }[]
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSampleSelect: (value: string) => void
  onClear: () => void
  onDownloadTxt: () => void
  onDownloadJson: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  activeTab,
  setActiveTab,
  isGenerating,
  canDownload,
  sampleTexts,
  onFileUpload,
  onSampleSelect,
  onClear,
  onDownloadTxt,
  onDownloadJson
}) => {
  const t = useTranslations("HashGeneratorPage.ControlPanel")

  const tabOptions = [
    {
      value: "text",
      label: t("textHash") || "Matn Hash",
      icon: <FileText size={16} />
    },
    {
      value: "file",
      label: t("fileHash") || "Fayl Hash",
      icon: <Upload size={16} />
    }
  ]

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tab Selection */}
          <GradientTabs
            value={activeTab}
            options={tabOptions}
            onChange={(tab) => setActiveTab(tab as "text" | "file")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* File Upload */}
          <input
            type="file"
            accept=".txt,.json,.csv,.md,.xml,.log"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isGenerating}
          />
          <Button variant="outline" size="sm" asChild disabled={isGenerating}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={16} className="mr-2" />
              {t("uploadFile") || "Fayl yuklash"}
            </label>
          </Button>

          {/* Sample Data Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                {t("sampleHash") || "Namuna Hash"}
                <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {sampleTexts.map((sample, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSampleSelect(sample.value)}
                >
                  {sample.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Button */}
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X size={16} className="mr-2" />
            {t("clear") || "Tozalash"}
          </Button>

          {/* Download Buttons */}
          <ShimmerButton
            onClick={onDownloadTxt}
            disabled={!canDownload || isGenerating}
            variant="outline"
            size="sm"
            className="border-input border !bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:border-none dark:!bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          >
            <Download size={16} className="mr-2" />
            {t("downloadTxt") || "TXT yuklab olish"}
          </ShimmerButton>

          <ShimmerButton
            onClick={onDownloadJson}
            disabled={!canDownload || isGenerating}
            variant={canDownload ? "default" : "outline"}
            size="sm"
            className="border-input border !bg-white hover:bg-zinc-50 hover:text-zinc-900 dark:border-none dark:!bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          >
            <Download size={16} className="mr-2" />
            {t("downloadJson") || "JSON yuklab olish"}
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
