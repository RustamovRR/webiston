"use client"

import { Settings } from "lucide-react"
import { useTranslations } from "next-intl"

const HelpSection: React.FC = () => {
  const t = useTranslations("LoremIpsumPage.HelpSection")

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <Settings size={20} className="text-green-400" />
        {t("title")}
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">
            {t("usagePlacesTitle")}
          </h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></div>
              <div>
                <strong>{t("usagePlaces.webDesign.title")}</strong>{" "}
                {t("usagePlaces.webDesign.desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500"></div>
              <div>
                <strong>{t("usagePlaces.graphicDesign.title")}</strong>{" "}
                {t("usagePlaces.graphicDesign.desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"></div>
              <div>
                <strong>{t("usagePlaces.typography.title")}</strong>{" "}
                {t("usagePlaces.typography.desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500"></div>
              <div>
                <strong>{t("usagePlaces.prototyping.title")}</strong>{" "}
                {t("usagePlaces.prototyping.desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500"></div>
              <div>
                <strong>{t("usagePlaces.testing.title")}</strong>{" "}
                {t("usagePlaces.testing.desc")}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-500"></div>
              <div>
                <strong>{t("usagePlaces.placeholder.title")}</strong>{" "}
                {t("usagePlaces.placeholder.desc")}
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">
            {t("professionalTipsTitle")}
          </h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              {t("tips.tip1")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              {t("tips.tip2")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              {t("tips.tip3")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              {t("tips.tip4")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              {t("tips.tip5")}
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
            <div className="text-sm text-blue-400">
              <strong>{t("noteTitle")}</strong> {t("noteText")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpSection
