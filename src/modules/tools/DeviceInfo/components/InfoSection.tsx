"use client"

import { Shield } from "lucide-react"
import { useTranslations } from "next-intl"

const InfoSection: React.FC = () => {
  const t = useTranslations("DeviceInfoPage.InfoSection")

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <Shield className="h-5 w-5 text-pink-500 dark:text-pink-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-pink-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("status")}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">
              {t("usagePlacesTitle")}
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                <strong>{t("usagePlaces.webDev.title")}</strong>{" "}
                {t("usagePlaces.webDev.desc")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                <strong>{t("usagePlaces.browserTesting.title")}</strong>{" "}
                {t("usagePlaces.browserTesting.desc")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>{t("usagePlaces.performance.title")}</strong>{" "}
                {t("usagePlaces.performance.desc")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                <strong>{t("usagePlaces.analytics.title")}</strong>{" "}
                {t("usagePlaces.analytics.desc")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>{t("usagePlaces.support.title")}</strong>{" "}
                {t("usagePlaces.support.desc")}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">
              {t("professionalTipsTitle")}
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                {t("tips.tip1")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                {t("tips.tip2")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                {t("tips.tip3")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                {t("tips.tip4")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                {t("tips.tip5")}
              </li>
            </ul>

            <div className="mt-4 rounded-lg border border-pink-500/20 bg-pink-500/10 p-3">
              <div className="text-sm text-pink-600 dark:text-pink-400">
                <strong>{t("noteTitle")}</strong> {t("noteText")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
