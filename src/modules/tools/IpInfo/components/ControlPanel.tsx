"use client"

import { Download, MapPin, RefreshCw, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { StatsDisplay } from "@/components/shared/StatsDisplay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShimmerButton } from "@/components/ui/shimmer-button"

interface ControlPanelProps {
  ipAddress: string
  isLoading: boolean
  error: string | null
  canDownload: boolean
  isEmpty: boolean
  stats: Array<{ label: string; value: number }>
  onIpAddressChange: (value: string) => void
  onAnalyze: () => void
  onLoadCurrentIP: () => void
  onClear: () => void
  onDownload: () => void
  hasCurrentIP: boolean
}

export default function ControlPanel({
  ipAddress,
  isLoading,
  error,
  canDownload,
  isEmpty,
  stats,
  onIpAddressChange,
  onAnalyze,
  onLoadCurrentIP,
  onClear,
  onDownload,
  hasCurrentIP
}: ControlPanelProps) {
  const t = useTranslations("IpInfoPage.ControlPanel")

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          onClick={onLoadCurrentIP}
          variant="outline"
          size="sm"
          className="border-info/50 text-info hover:bg-info/10"
          disabled={!hasCurrentIP}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {t("currentIpButton")}
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="border-border hover:bg-muted"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("clearButton")}
        </Button>
        {canDownload && (
          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            className="border-success/50 text-success hover:bg-success/10"
          >
            <Download className="mr-2 h-4 w-4" />
            {t("downloadButton")}
          </Button>
        )}
      </div>

      {/* Terminal Input Panel */}
      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            {t("title")}
          </span>
        </div>

        {/* Input Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <Input
                placeholder={t("inputPlaceholder")}
                value={ipAddress}
                onChange={(e) => onIpAddressChange(e.target.value)}
                className="border-border bg-muted/50 font-mono text-sm"
              />
              {error && (
                <p className="mt-2 flex items-center gap-2 text-sm text-destructive">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive"></div>
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <StatsDisplay stats={stats} />
              <ShimmerButton
                onClick={onAnalyze}
                disabled={isEmpty || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 disabled:text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? t("loadingStatus") : t("analyzeButton")}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
