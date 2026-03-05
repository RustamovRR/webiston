"use client"

import { Globe } from "lucide-react"
import { useTranslations } from "next-intl"
import { CopyButton } from "@/components/shared"

interface ConnectionInfo {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

interface ConnectionInfoPanelProps {
  connectionInfo: ConnectionInfo | null
}

const ConnectionInfoPanel: React.FC<ConnectionInfoPanelProps> = ({
  connectionInfo
}) => {
  const t = useTranslations("DeviceInfoPage.ConnectionInfo")

  if (!connectionInfo) return null

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <Globe className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            text={JSON.stringify(connectionInfo, null, 2)}
            size="sm"
            variant="ghost"
          />
          <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("status")}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("connectionType")}
            </div>
            <div className="mt-1 text-zinc-900 capitalize dark:text-zinc-100">
              {connectionInfo.effectiveType}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("speed")}
            </div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">
              {connectionInfo.downlink}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("latency")}
            </div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-100">
              {connectionInfo.rtt}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("dataSaver")}
            </div>
            <div
              className={`mt-1 flex items-center gap-2 ${
                connectionInfo.saveData
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${connectionInfo.saveData ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              {connectionInfo.saveData ? t("enabled") : t("disabled")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionInfoPanel
