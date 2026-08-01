"use client"

import { Eye, Settings } from "lucide-react"
import { useTranslations } from "next-intl"
import { GradientTabs } from "@/components/ui"

interface ConfigPanelProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  activeTab,
  onTabChange
}) => {
  const t = useTranslations("OgMetaGeneratorPage.ConfigPanel")

  const tabOptions = [
    {
      value: "form",
      label: t("form"),
      icon: <Settings size={16} />
    },
    {
      value: "preview",
      label: t("preview"),
      icon: <Eye size={16} />
    }
  ]

  return (
    <div className="mb-6 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-foreground">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-muted-foreground">{t("status")}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">{t("workMode")}</h3>
        <GradientTabs
          options={tabOptions}
          value={activeTab}
          onChange={onTabChange}
        />
      </div>
    </div>
  )
}

export default ConfigPanel
