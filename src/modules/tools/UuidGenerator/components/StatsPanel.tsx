import { useTranslations } from "next-intl"
import type React from "react"
import { NumberTicker } from "@/components/ui/number-ticker"

interface StatsData {
  total: number
  unique: number
  duplicates: number
  bytes: number
}

interface StatsPanelProps {
  stats: StatsData
  isVisible: boolean
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, isVisible }) => {
  const t = useTranslations("UuidGeneratorPage.ResultsPanel")
  const tPanel = useTranslations("UuidGeneratorPage.StatsPanel")

  if (!isVisible) return null

  return (
    <div className="mt-6 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {tPanel("title")}
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">
            <NumberTicker value={stats.total} />
          </div>
          <div className="text-sm text-muted-foreground">{t("totalLabel")}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">
            <NumberTicker value={stats.unique} />
          </div>
          <div className="text-sm text-muted-foreground">
            {t("uniqueLabel")}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">
            <NumberTicker value={stats.duplicates} />
          </div>
          <div className="text-sm text-muted-foreground">
            {t("duplicatesLabel")}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">
            <NumberTicker value={stats.bytes} />
          </div>
          <div className="text-sm text-muted-foreground">{t("bytesLabel")}</div>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
