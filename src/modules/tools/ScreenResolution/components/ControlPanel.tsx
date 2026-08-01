"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { StatsDisplay } from "@/components/shared"
import { ShimmerButton } from "@/components/ui/shimmer-button"

interface ControlPanelProps {
  isLoading: boolean
  isFullscreen: boolean
  stats: Array<{ label: string; value: string | number }>
  onRefresh: () => void
  onToggleFullscreen: () => void
  onLoadSample: () => void
  onDownload: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isLoading,
  isFullscreen,
  stats,
  onRefresh,
  onToggleFullscreen,
  onLoadSample,
  onDownload
}) => {
  const t = useTranslations("ScreenResolutionPage.ControlPanel")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-20 space-y-6"
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-2 text-sm font-medium text-foreground">
            {t("title")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${!isLoading ? "bg-green-500" : "bg-yellow-500"}`}
            ></div>
            <span className="text-xs text-muted-foreground">
              {!isLoading ? t("status") : t("loadingStatus")}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Boshqaruv tugmalari */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t("controlPanelTitle")}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <ShimmerButton
                onClick={onRefresh}
                disabled={isLoading}
                className="w-full"
              >
                {t("refreshButton")}
              </ShimmerButton>
              <ShimmerButton
                onClick={onToggleFullscreen}
                disabled={isLoading}
                className="border-input w-full border !bg-white !text-foreground hover:!bg-zinc-50 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-300 dark:hover:!bg-zinc-700"
                variant="outline"
              >
                {isFullscreen
                  ? t("exitFullscreenButton")
                  : t("fullscreenButton")}
              </ShimmerButton>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ShimmerButton
                onClick={onLoadSample}
                className="border-input w-full border !bg-white !text-foreground hover:!bg-zinc-50 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-300 dark:hover:!bg-zinc-700"
                variant="outline"
              >
                {t("demoDataButton")}
              </ShimmerButton>
              <ShimmerButton
                onClick={onDownload}
                className="border-input w-full border !bg-white !text-foreground hover:!bg-zinc-50 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-300 dark:hover:!bg-zinc-700"
                variant="outline"
              >
                {t("downloadButton")}
              </ShimmerButton>
            </div>
          </div>

          {/* Statistika */}
          {stats.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                {t("mainIndicators")}
              </h4>
              <StatsDisplay stats={stats as any} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ControlPanel
