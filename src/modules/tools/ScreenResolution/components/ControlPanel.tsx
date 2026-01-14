"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { StatsDisplay } from "@/components/shared"

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
      <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${!isLoading ? "bg-green-500" : "bg-yellow-500"}`}
            ></div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {!isLoading ? t("status") : t("loadingStatus")}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Boshqaruv tugmalari */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
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
                className="border-input w-full border !bg-white !text-zinc-700 hover:!bg-zinc-50 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-300 dark:hover:!bg-zinc-700"
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
                className="border-input w-full border !bg-white !text-zinc-700 hover:!bg-zinc-50 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-300 dark:hover:!bg-zinc-700"
                variant="outline"
              >
                {t("demoDataButton")}
              </ShimmerButton>
              <ShimmerButton
                onClick={onDownload}
                className="border-input w-full border !bg-white !text-zinc-700 hover:!bg-zinc-50 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-300 dark:hover:!bg-zinc-700"
                variant="outline"
              >
                {t("downloadButton")}
              </ShimmerButton>
            </div>
          </div>

          {/* Statistika */}
          {stats.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
