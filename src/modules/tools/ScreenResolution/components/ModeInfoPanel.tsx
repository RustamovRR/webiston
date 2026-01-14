"use client"

import { useTranslations } from "next-intl"

interface Analysis {
  isRetina: boolean
  viewportRatio: string
}

interface ModeInfoPanelProps {
  isFullscreen: boolean
  analysis: Analysis | null
}

const ModeInfoPanel: React.FC<ModeInfoPanelProps> = ({
  isFullscreen,
  analysis
}) => {
  const t = useTranslations("ScreenResolutionPage.ModeInfo")

  return (
    <div className="rounded-lg border border-zinc-200 bg-white/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {t("title")}
      </h3>
      <div className="space-y-4">
        <div
          className={`flex items-center justify-between rounded-lg p-3 ${
            isFullscreen
              ? "border border-purple-500/30 bg-purple-500/20 dark:border-purple-400/30 dark:bg-purple-400/20"
              : "bg-zinc-100/50 dark:bg-zinc-800/30"
          }`}
        >
          <span className="text-zinc-700 dark:text-zinc-300">
            {t("fullscreenMode")}
          </span>
          <div
            className={`h-2 w-2 rounded-full ${isFullscreen ? "bg-purple-500 dark:bg-purple-400" : "bg-zinc-500"}`}
          ></div>
        </div>

        {analysis && (
          <div
            className={`flex items-center justify-between rounded-lg p-3 ${
              analysis.isRetina
                ? "border border-yellow-500/30 bg-yellow-500/20 dark:border-yellow-400/30 dark:bg-yellow-400/20"
                : "bg-zinc-100/50 dark:bg-zinc-800/30"
            }`}
          >
            <span className="text-zinc-700 dark:text-zinc-300">
              {t("retinaDisplay")}
            </span>
            <div
              className={`h-2 w-2 rounded-full ${analysis.isRetina ? "bg-yellow-500 dark:bg-yellow-400" : "bg-zinc-500"}`}
            ></div>
          </div>
        )}

        {analysis && (
          <div className="rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/30">
            <div className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t("viewportRatio")}
            </div>
            <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
              {analysis.viewportRatio}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModeInfoPanel
