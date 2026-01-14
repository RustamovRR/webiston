import React from "react"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface ErrorDisplayProps {
  error: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const t = useTranslations("JwtDecoderPage.ErrorDisplay")

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <AlertCircle size={20} />
        <span className="font-semibold">{t("title")}</span>
      </div>
      <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
    </div>
  )
}

export default ErrorDisplay
