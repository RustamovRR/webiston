"use client"

import { Shield } from "lucide-react"
import { useTranslations } from "next-intl"

const InfoSection: React.FC = () => {
  const t = useTranslations("PasswordGeneratorPage.InfoSection")

  return (
    <div className="mt-8 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
        <Shield size={20} className="text-green-400" />
        {t("title")}
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-medium text-foreground">
            {t("securityRulesTitle")}
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></div>
              <div>
                <strong>{t("rule1Title")}</strong> {t("rule1Desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500"></div>
              <div>
                <strong>{t("rule2Title")}</strong> {t("rule2Desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"></div>
              <div>
                <strong>{t("rule3Title")}</strong> {t("rule3Desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500"></div>
              <div>
                <strong>{t("rule4Title")}</strong> {t("rule4Desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500"></div>
              <div>
                <strong>{t("rule5Title")}</strong> {t("rule5Desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-500"></div>
              <div>
                <strong>{t("rule6Title")}</strong> {t("rule6Desc")}
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-foreground">
            {t("professionalTipsTitle")}
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              {t("tip1")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              {t("tip2")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              {t("tip3")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              {t("tip4")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              {t("tip5")}
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-green-500/10 p-3">
            <div className="text-sm text-success">
              <strong>{t("recommendation")}</strong> {t("recommendationText")}
            </div>
          </div>
        </div>
      </div>

      {/* Password Type Info */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-blue-500/10 p-4">
          <div className="mb-2 font-medium text-info">{t("randomTitle")}</div>
          <div className="text-sm text-muted-foreground">{t("randomDesc")}</div>
        </div>

        <div className="rounded-lg bg-purple-500/10 p-4">
          <div className="mb-2 font-medium text-purple-600 dark:text-purple-400">
            {t("memorableTitle")}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("memorableDesc")}
          </div>
        </div>

        <div className="rounded-lg bg-green-500/10 p-4">
          <div className="mb-2 font-medium text-success">
            {t("strongTitle")}
          </div>
          <div className="text-sm text-muted-foreground">{t("strongDesc")}</div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
