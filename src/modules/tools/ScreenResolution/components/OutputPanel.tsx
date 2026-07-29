"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

interface ScreenInfo {
  width: number
  height: number
  innerWidth: number
  innerHeight: number
  outerWidth: number
  outerHeight: number
  pixelRatio: number
  orientation: string
  colorDepth: number
  scrollX: number
  scrollY: number
}

interface Analysis {
  resolutionCategory: string
  aspectRatio: string
  deviceType: string
  isRetina: boolean
}

interface OutputPanelProps {
  screenInfo: ScreenInfo | null
  analysis: Analysis | null
}

const OutputPanel: React.FC<OutputPanelProps> = ({ screenInfo, analysis }) => {
  const t = useTranslations("ScreenResolutionPage.OutputPanel")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
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
              className={`h-2 w-2 rounded-full ${screenInfo ? "bg-green-500" : "bg-zinc-500"}`}
            ></div>
            <span className="text-xs text-muted-foreground">
              {screenInfo ? t("dataAvailable") : t("noData")}
            </span>
          </div>
        </div>

        <div className="p-6">
          {!screenInfo ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-lg bg-muted p-4">
                <svg
                  aria-hidden="true"
                  className="h-12 w-12 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                {t("waitingTitle")}
              </h3>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-500">
                {t("waitingDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Asosiy ma'lumotlar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("screenInfoTitle")}
                </h3>

                {/* Ekran o'lchami */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-2xl font-bold text-info">
                        {screenInfo.width} × {screenInfo.height}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("screenSize")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success">
                        {analysis?.resolutionCategory}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("resolutionType")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viewport ma'lumotlari */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t("viewportInfoTitle")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {screenInfo.innerWidth} × {screenInfo.innerHeight}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">
                        {t("innerSize")}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {screenInfo.outerWidth} × {screenInfo.outerHeight}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">
                        {t("outerSize")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qo'shimcha ma'lumotlar */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t("technicalInfoTitle")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("pixelRatio")}:
                      </span>
                      <span className="text-foreground">
                        {screenInfo.pixelRatio}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("aspectRatio")}:
                      </span>
                      <span className="text-foreground">
                        {analysis?.aspectRatio}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("orientation")}:
                      </span>
                      <span className="text-foreground">
                        {screenInfo.orientation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("colorDepth")}:
                      </span>
                      <span className="text-foreground">
                        {screenInfo.colorDepth} bit
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("deviceType")}:
                      </span>
                      <span className="text-foreground">
                        {analysis?.deviceType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("retinaDisplay")}:
                      </span>
                      <span className="text-foreground">
                        {analysis?.isRetina ? t("yes") : t("no")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scroll pozitsiyasi */}
                {(screenInfo.scrollX > 0 || screenInfo.scrollY > 0) && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {t("scrollPositionTitle")}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                          {screenInfo.scrollX}px
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          {t("horizontalScroll")}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-semibold text-pink-600 dark:text-pink-400">
                          {screenInfo.scrollY}px
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          {t("verticalScroll")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default OutputPanel
