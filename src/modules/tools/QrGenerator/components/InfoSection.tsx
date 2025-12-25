import React from "react"
import { QrCode } from "lucide-react"
import { useTranslations } from "next-intl"

const InfoSection: React.FC = () => {
  const t = useTranslations("QrGeneratorPage.InfoSection")
  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <QrCode size={20} className="text-purple-400" />
        {t("title")}
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">
            {t("qrTypesTitle")}
          </h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <strong>{t("qrTypes.url.title")}</strong>{" "}
              {t("qrTypes.url.description")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <strong>{t("qrTypes.contact.title")}</strong>{" "}
              {t("qrTypes.contact.description")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              <strong>{t("qrTypes.wifi.title")}</strong>{" "}
              {t("qrTypes.wifi.description")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              <strong>{t("qrTypes.sms.title")}</strong>{" "}
              {t("qrTypes.sms.description")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              <strong>{t("qrTypes.text.title")}</strong>{" "}
              {t("qrTypes.text.description")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
              <strong>{t("qrTypes.email.title")}</strong>{" "}
              {t("qrTypes.email.description")}
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

          <div className="mt-4 rounded-lg bg-purple-500/10 p-3 dark:bg-purple-500/20">
            <div className="text-sm text-purple-600 dark:text-purple-400">
              <strong>{t("importantNote")}</strong> {t("importantText")}
            </div>
          </div>
        </div>
      </div>

      {/* QR Size & Error Level Info */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-500/10 p-4">
          <div className="mb-2 font-medium text-blue-400">150x150 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("sizeDescriptions.150")}
          </div>
        </div>

        <div className="rounded-lg bg-green-500/10 p-4">
          <div className="mb-2 font-medium text-green-400">200x200 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("sizeDescriptions.200")}
          </div>
        </div>

        <div className="rounded-lg bg-orange-500/10 p-4">
          <div className="mb-2 font-medium text-orange-400">300x300 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("sizeDescriptions.300")}
          </div>
        </div>

        <div className="rounded-lg bg-purple-500/10 p-4">
          <div className="mb-2 font-medium text-purple-400">400x400 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("sizeDescriptions.400")}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
