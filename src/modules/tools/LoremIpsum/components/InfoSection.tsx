"use client"

import { Zap } from "lucide-react"
import { useTranslations } from "next-intl"

interface InfoSectionProps {
  alternativeTexts: Record<string, { name: string }>
}

const InfoSection: React.FC<InfoSectionProps> = ({ alternativeTexts }) => {
  const t = useTranslations("LoremIpsumPage.InfoSection")
  const tTypes = useTranslations("LoremIpsumPage.TextTypes")

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <Zap size={20} className="text-blue-500 dark:text-blue-400" />
        {t("textTypesTitle")}
      </h3>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="mb-2 font-medium text-blue-600 dark:text-blue-400">
            {tTypes("cicero")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("ciceroDesc")}
          </div>
        </div>

        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="mb-2 font-medium text-orange-600 dark:text-orange-400">
            {tTypes("bacon")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("baconDesc")}
          </div>
        </div>

        <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
          <div className="mb-2 font-medium text-purple-600 dark:text-purple-400">
            {tTypes("hipster")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("hipsterDesc")}
          </div>
        </div>

        <div className="rounded-lg border border-pink-500/20 bg-pink-500/10 p-4">
          <div className="mb-2 font-medium text-pink-600 dark:text-pink-400">
            {tTypes("cupcake")}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("cupcakeDesc")}
          </div>
        </div>

        {alternativeTexts.uzbek && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 md:col-span-2 lg:col-span-2">
            <div className="mb-2 font-medium text-green-600 dark:text-green-400">
              {tTypes("uzbek")}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("uzbekDesc")}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InfoSection
