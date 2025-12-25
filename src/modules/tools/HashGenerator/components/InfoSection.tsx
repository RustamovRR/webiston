import React from "react"
import { useTranslations } from "next-intl"
import { Shield, Zap, Hash } from "lucide-react"

const InfoSection: React.FC = () => {
  const t = useTranslations("HashGeneratorPage.Info")

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Security Levels */}
      <div className="rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-500 dark:text-blue-400" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {t("securityLevels.title") || "Xavfsizlik Darajalari"}
          </h3>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span className="text-red-600 dark:text-red-400">MD5</span>
            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {t("recommendations.deprecated") || "Ishlatmang"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-yellow-600 dark:text-yellow-400">SHA1</span>
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              {t("recommendations.weak") || "Legacy uchun"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-blue-600 dark:text-blue-400">SHA256</span>
            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {t("recommendations.secure") || "Tavsiya etiladi"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-green-600 dark:text-green-400">SHA512</span>
            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-600 dark:bg-green-900/30 dark:text-green-400">
              {t("recommendations.recommended") || "Eng yaxshi"}
            </span>
          </li>
        </ul>
      </div>

      {/* Use Cases */}
      <div className="rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mb-4 flex items-center gap-2">
          <Zap size={20} className="text-purple-500 dark:text-purple-400" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {t("useCases.title") || "Foydalanish Sohalari"}
          </h3>
        </div>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            {t("useCases.passwords") || "Parol hashing"}
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            {t("useCases.integrity") || "Fayl yaxlitligi"}
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
            {t("useCases.signatures") || "Raqamli imzolar"}
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
            {t("useCases.blockchain") || "Blokcheyn"}
          </li>
        </ul>
      </div>

      {/* Important Notes */}
      <div className="rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mb-4 flex items-center gap-2">
          <Hash size={20} className="text-green-500 dark:text-green-400" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {t("notes.title") || "Muhim Eslatmalar"}
          </h3>
        </div>
        <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• {t("notes.irreversible") || "Hash funksiyalar qaytarilmas"}</li>
          <li>
            • {t("notes.deterministic") || "Bir xil input → bir xil hash"}
          </li>
          <li>
            •{" "}
            {t("notes.avalanche") || "Kichik o'zgarish → butunlay boshqa hash"}
          </li>
          <li>
            • {t("notes.recommendation") || "SHA256+ algoritmlarni ishlating"}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default InfoSection
