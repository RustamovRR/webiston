"use client"

import { Zap } from "lucide-react"
import { useTranslations } from "next-intl"

const InfoSection: React.FC = () => {
  const t = useTranslations("OgMetaGeneratorPage.InfoSection")

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <Zap size={20} className="text-blue-400" />
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
                <strong>{t("usagePlaces.social").split(":")[0]}:</strong>{" "}
                {t("usagePlaces.social").split(":")[1]}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500"></div>
              <div>
                <strong>{t("usagePlaces.twitter").split(":")[0]}:</strong>{" "}
                {t("usagePlaces.twitter").split(":")[1]}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"></div>
              <div>
                <strong>{t("usagePlaces.seo").split(":")[0]}:</strong>{" "}
                {t("usagePlaces.seo").split(":")[1]}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500"></div>
              <div>
                <strong>{t("usagePlaces.ctr").split(":")[0]}:</strong>{" "}
                {t("usagePlaces.ctr").split(":")[1]}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500"></div>
              <div>
                <strong>{t("usagePlaces.brand").split(":")[0]}:</strong>{" "}
                {t("usagePlaces.brand").split(":")[1]}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-500"></div>
              <div>
                <strong>{t("usagePlaces.impression").split(":")[0]}:</strong>{" "}
                {t("usagePlaces.impression").split(":")[1]}
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
            <div className="text-sm text-blue-600 dark:text-blue-400">
              <strong>{t("noteTitle")}</strong> {t("noteText")}
            </div>
          </div>
        </div>
      </div>

      {/* Meta Tag Types Info */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-500/10 p-4">
          <div className="mb-2 font-medium text-blue-600 dark:text-blue-400">
            {t("metaTypes.openGraphTitle")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("metaTypes.openGraphDesc")}
          </div>
        </div>

        <div className="rounded-lg bg-purple-500/10 p-4">
          <div className="mb-2 font-medium text-purple-600 dark:text-purple-400">
            {t("metaTypes.twitterTitle")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("metaTypes.twitterDesc")}
          </div>
        </div>

        <div className="rounded-lg bg-green-500/10 p-4">
          <div className="mb-2 font-medium text-green-600 dark:text-green-400">
            {t("metaTypes.seoTitle")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("metaTypes.seoDesc")}
          </div>
        </div>

        <div className="rounded-lg bg-orange-500/10 p-4">
          <div className="mb-2 font-medium text-orange-600 dark:text-orange-400">
            {t("metaTypes.schemaTitle")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("metaTypes.schemaDesc")}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
