import { Hash, Shield, Zap } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"

const InfoSection: React.FC = () => {
  const t = useTranslations("HashGeneratorPage.Info")

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Security Levels */}
      <div className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Shield size={20} className="text-info" />
          <h3 className="font-semibold text-foreground">
            {t("securityLevels.title") || "Xavfsizlik Darajalari"}
          </h3>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span className="text-destructive">MD5</span>
            <span className="rounded bg-destructive px-2 py-1 text-xs text-destructive">
              {t("recommendations.deprecated") || "Ishlatmang"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-warning">SHA1</span>
            <span className="rounded bg-warning px-2 py-1 text-xs text-warning">
              {t("recommendations.weak") || "Legacy uchun"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-info">SHA256</span>
            <span className="rounded bg-info px-2 py-1 text-xs text-info">
              {t("recommendations.secure") || "Tavsiya etiladi"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-success">SHA512</span>
            <span className="rounded bg-success px-2 py-1 text-xs text-success">
              {t("recommendations.recommended") || "Eng yaxshi"}
            </span>
          </li>
        </ul>
      </div>

      {/* Use Cases */}
      <div className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Zap size={20} className="text-purple-500 dark:text-purple-400" />
          <h3 className="font-semibold text-foreground">
            {t("useCases.title") || "Foydalanish Sohalari"}
          </h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
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
      <div className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Hash size={20} className="text-success" />
          <h3 className="font-semibold text-foreground">
            {t("notes.title") || "Muhim Eslatmalar"}
          </h3>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
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
