import { Key } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"

const SignatureInfo: React.FC = () => {
  const t = useTranslations("JwtDecoderPage.SignatureInfo")

  return (
    <div className="mt-6 rounded-lg border border-warning/30 bg-warning/50 p-4">
      <div className="flex items-start gap-3">
        <Key size={20} className="mt-0.5 flex-shrink-0 text-warning" />
        <div>
          <h4 className="mb-2 font-medium text-warning">{t("title")}</h4>
          <div className="space-y-1 text-sm text-warning/90">
            <p>{t("description1")}</p>
            <p>{t("description2")}</p>
            <p>{t("description3")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignatureInfo
