"use client"

import { useTranslations } from "next-intl"

interface CurrentIpPanelProps {
  currentIP: string | null
}

export default function CurrentIpPanel({ currentIP }: CurrentIpPanelProps) {
  const t = useTranslations("IpInfoPage.ControlPanel")

  if (!currentIP) return null

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-medium text-foreground">
          {t("yourIpTitle")}
        </h3>
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <div className="font-mono text-lg text-foreground">{currentIP}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {t("currentIpDesc")}
          </div>
        </div>
      </div>
    </div>
  )
}
