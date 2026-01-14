"use client"

import { useTranslations } from "next-intl"

interface CurrentIpPanelProps {
  currentIP: string | null
}

export default function CurrentIpPanel({ currentIP }: CurrentIpPanelProps) {
  const t = useTranslations("IpInfoPage.ControlPanel")

  if (!currentIP) return null

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="border-b border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("yourIpTitle")}
        </h3>
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-3 dark:border-zinc-700/50 dark:bg-zinc-800/30">
          <div className="font-mono text-lg text-zinc-900 dark:text-zinc-100">
            {currentIP}
          </div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t("currentIpDesc")}
          </div>
        </div>
      </div>
    </div>
  )
}
