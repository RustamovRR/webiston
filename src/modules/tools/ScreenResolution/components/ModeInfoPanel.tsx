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
    <div className="rounded-lg border border-border bg-card/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("title")}
      </h3>
      <div className="space-y-4">
        <div
          className={`flex items-center justify-between rounded-lg p-3 ${
            isFullscreen
              ? "border border-purple-500/30 bg-purple-500/20 dark:border-purple-400/30 dark:bg-purple-400/20"
              : "bg-muted/50"
          }`}
        >
          <span className="text-foreground">{t("fullscreenMode")}</span>
          <div
            className={`h-2 w-2 rounded-full ${isFullscreen ? "bg-purple-500 dark:bg-purple-400" : "bg-zinc-500"}`}
          ></div>
        </div>

        {analysis && (
          <div
            className={`flex items-center justify-between rounded-lg p-3 ${
              analysis.isRetina
                ? "border border-warning/30 bg-warning/20"
                : "bg-muted/50"
            }`}
          >
            <span className="text-foreground">{t("retinaDisplay")}</span>
            <div
              className={`h-2 w-2 rounded-full ${analysis.isRetina ? "bg-warning" : "bg-zinc-500"}`}
            ></div>
          </div>
        )}

        {analysis && (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="mb-1 text-sm text-muted-foreground">
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
