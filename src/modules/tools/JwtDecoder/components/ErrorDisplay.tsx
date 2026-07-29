import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"

interface ErrorDisplayProps {
  error: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const t = useTranslations("JwtDecoderPage.ErrorDisplay")

  return (
    <div className="mb-6 rounded-lg border border-destructive bg-destructive p-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle size={20} />
        <span className="font-semibold">{t("title")}</span>
      </div>
      <p className="mt-2 text-sm text-destructive">{error}</p>
    </div>
  )
}

export default ErrorDisplay
