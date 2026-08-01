import { Hash } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"

const InfoPanel: React.FC = () => {
  const t = useTranslations("UuidGeneratorPage.InfoPanel")
  const tUseCases = useTranslations("UuidGeneratorPage.UseCases")
  const tVersionInfo = useTranslations("UuidGeneratorPage.VersionInfo")
  const tFormatInfo = useTranslations("UuidGeneratorPage.FormatInfo")

  return (
    <div className="mt-8 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
        <Hash size={20} className="text-info" />
        {t("title")}
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-medium text-foreground">
            {t("versionsTitle")}
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <strong>UUID v4 (Random):</strong> {tVersionInfo("v4.details")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <strong>UUID v1 (Timestamp):</strong> {tVersionInfo("v1.details")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
              <strong>NIL UUID:</strong> {tVersionInfo("nil.details")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              <strong>UUID v3/v5:</strong> Namespace va nom asosida,
              deterministic
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              <strong>UUID v6/v7/v8:</strong> Yangi standartlar, kelajakda
              qo'llab-quvvatlanadi
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-foreground">
            {t("useCasesTitle")}
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <strong>Database Primary Keys:</strong> {tUseCases("database")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <strong>Microservices:</strong> {tUseCases("microservices")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              <strong>File naming:</strong> {tUseCases("fileNaming")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              <strong>Session IDs:</strong> {tUseCases("sessionIds")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              <strong>API Keys:</strong> {tUseCases("apiKeys")}
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-blue-500/10 p-3 dark:bg-blue-500/20">
            <div className="text-sm text-info">
              <strong>{t("importantNote")}</strong> {t("collisionNote")}
            </div>
          </div>
        </div>
      </div>

      {/* Format Types Info */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-500/10 p-4">
          <div className="mb-2 font-medium text-info">
            {tFormatInfo("standard.name")}
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            {tFormatInfo("standard.description")}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            550e8400-e29b-41d4-a716-446655440000
          </div>
        </div>

        <div className="rounded-lg bg-green-500/10 p-4">
          <div className="mb-2 font-medium text-success">
            {tFormatInfo("compact.name")}
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            {tFormatInfo("compact.description")}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            550e8400e29b41d4a716446655440000
          </div>
        </div>

        <div className="rounded-lg bg-purple-500/10 p-4">
          <div className="mb-2 font-medium text-purple-400">
            {tFormatInfo("brackets.name")}
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            {tFormatInfo("brackets.description")}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            550e8400-e29b-41d4-a716-446655440000
          </div>
        </div>

        <div className="rounded-lg bg-orange-500/10 p-4">
          <div className="mb-2 font-medium text-warning">
            {tFormatInfo("uppercase.name")}
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            {tFormatInfo("uppercase.description")}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            550E8400-E29B-41D4-A716-446655440000
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
