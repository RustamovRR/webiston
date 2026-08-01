import { Database, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"

const InfoSection: React.FC = () => {
  const t = useTranslations("Base64ConverterPage.Info")

  return (
    <>
      {/* Examples Section */}
      <div className="mt-8 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
          <FileText size={20} className="text-indigo-400" />
          {t("formatExample.title")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("formatExample.plainText")}
            </p>
            <code className="block rounded bg-zinc-300/50 p-2 font-mono text-sm text-foreground">
              {t("formatExample.exampleText")}
            </code>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("formatExample.base64Encoded")}
            </p>
            <code className="block rounded bg-zinc-300/50 p-2 font-mono text-sm break-all text-foreground">
              {t("formatExample.exampleEncoded")}
            </code>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
          <Database size={20} className="text-indigo-400" />
          {t("title")}
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              {t("whatIsBase64.title")}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("whatIsBase64.description")}
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              {t("features.title")}
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>{t("features.feature1")}</li>
              <li>{t("features.feature2")}</li>
              <li>{t("features.feature3")}</li>
              <li>{t("features.feature4")}</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              {t("usage.title")}
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>{t("usage.usage1")}</li>
              <li>{t("usage.usage2")}</li>
              <li>{t("usage.usage3")}</li>
              <li>{t("usage.usage4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfoSection
