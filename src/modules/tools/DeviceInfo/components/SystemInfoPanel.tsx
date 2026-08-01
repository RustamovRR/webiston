"use client"

import { Cpu } from "lucide-react"
import { useTranslations } from "next-intl"
import { CopyButton } from "@/components/shared"

interface SystemInfo {
  platform: string
  language: string
  timezone: string
  onlineStatus: boolean
  cookieEnabled: boolean
  languages: string[]
}

interface SystemInfoPanelProps {
  systemInfo: SystemInfo
}

const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({ systemInfo }) => {
  const t = useTranslations("DeviceInfoPage.SystemInfo")

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <Cpu className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-foreground">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            text={JSON.stringify(systemInfo, null, 2)}
            size="sm"
            variant="ghost"
          />
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-muted-foreground">{t("status")}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">{t("platform")}</div>
            <div className="mt-1 text-foreground">{systemInfo.platform}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t("language")}</div>
            <div className="mt-1 text-foreground">{systemInfo.language}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t("timezone")}</div>
            <div className="mt-1 text-foreground">{systemInfo.timezone}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {t("onlineStatus")}
            </div>
            <div
              className={`mt-1 flex items-center gap-2 ${
                systemInfo.onlineStatus ? "text-success" : "text-destructive"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${systemInfo.onlineStatus ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              {systemInfo.onlineStatus ? t("online") : t("offline")}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {t("cookieEnabled")}
            </div>
            <div
              className={`mt-1 flex items-center gap-2 ${
                systemInfo.cookieEnabled ? "text-success" : "text-destructive"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${systemInfo.cookieEnabled ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              {systemInfo.cookieEnabled ? t("yes") : t("no")}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {t("supportedLanguages")}
            </div>
            <div className="mt-1 text-foreground">
              {systemInfo.languages.slice(0, 3).join(", ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemInfoPanel
