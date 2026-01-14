"use client"

import { Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import { CopyButton } from "@/components/shared"

interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelRatio: number
  orientation: string
}

interface ScreenInfoPanelProps {
  screenInfo: ScreenInfo
}

const ScreenInfoPanel: React.FC<ScreenInfoPanelProps> = ({ screenInfo }) => {
  const t = useTranslations("DeviceInfoPage.ScreenInfo")

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <Smartphone className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            text={JSON.stringify(screenInfo, null, 2)}
            size="sm"
            variant="ghost"
          />
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("status")}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("screenSize")}
            </div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">
              {screenInfo.width} × {screenInfo.height} px
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("availableSize")}
            </div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">
              {screenInfo.availWidth} × {screenInfo.availHeight} px
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("colorDepth")}
            </div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">
              {screenInfo.colorDepth} bit
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("pixelRatio")}
            </div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">
              {screenInfo.pixelRatio}x
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("orientation")}
            </div>
            <div className="mt-1 text-zinc-900 capitalize dark:text-zinc-100">
              {screenInfo.orientation}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScreenInfoPanel
