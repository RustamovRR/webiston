import { useTranslations } from "next-intl"
import type React from "react"
import type { UuidFormat, UuidVersion } from "../hooks/useUuidGenerator"

interface InputPanelProps {
  count: number
  version: UuidVersion
  format: UuidFormat
  getVersionInfo: (version: UuidVersion) => any
  getFormatInfo: (format: UuidFormat) => any
}

const InputPanel: React.FC<InputPanelProps> = ({
  count,
  version,
  format,
  getVersionInfo,
  getFormatInfo
}) => {
  const t = useTranslations("UuidGeneratorPage.InputPanel")

  const currentVersionInfo = getVersionInfo(version)
  const currentFormatInfo = getFormatInfo(format)

  return (
    <div className="h-[96%] overflow-auto rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-muted-foreground">{t("status")}</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {/* Settings Summary */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("settingsTitle")}
          </h3>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="font-mono text-foreground">{count}</span>
              <span>{t("countLabel")}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-foreground">
                {version.toUpperCase()}
              </span>
              <span>{t("versionLabel")}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-foreground">{format}</span>
              <span>{t("formatLabel")}</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Version Info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("versionInfoTitle")}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="text-foreground">{t("nameLabel")}</span>{" "}
                {currentVersionInfo.name}
              </div>
              <div>
                <span className="text-foreground">{t("descriptionLabel")}</span>{" "}
                {currentVersionInfo.description}
              </div>
              <div>
                <span className="text-foreground">{t("securityLabel")}</span>{" "}
                {currentVersionInfo.security}
              </div>
            </div>
          </div>

          {/* Format Info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("formatInfoTitle")}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="text-foreground">{t("nameLabel")}</span>{" "}
                {currentFormatInfo.name}
              </div>
              <div>
                <span className="text-foreground">{t("patternLabel")}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {currentFormatInfo.description}
              </div>
              <div>
                <span className="text-foreground">{t("exampleLabel")}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {currentFormatInfo.example}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InputPanel
