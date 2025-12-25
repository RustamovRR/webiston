import React from "react"
import { Clock, Shield, Key } from "lucide-react"
import { useTranslations } from "next-intl"

interface TokenInfoProps {
  tokenInfo: {
    isExpired: boolean
    expiresAt: Date | null
    algorithm?: string
    tokenType?: string
    issuedAt: Date | null
    isNotYetValid?: boolean
    notBefore?: Date | null
  }
}

const TokenInfoCards: React.FC<TokenInfoProps> = ({ tokenInfo }) => {
  const t = useTranslations("JwtDecoderPage.TokenInfo")

  return (
    <div className="animate-in slide-in-from-top-1 fade-in mb-4 rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 duration-300 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Token Status
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div
          className={`rounded-lg border p-3 ${
            tokenInfo.isExpired
              ? "border-red-200/50 bg-red-50/50 dark:border-red-800/20 dark:bg-red-900/10"
              : "border-green-200/50 bg-green-50/50 dark:border-green-800/20 dark:bg-green-900/10"
          }`}
        >
          <div className="mb-1 flex items-center gap-2">
            <Clock
              size={14}
              className={
                tokenInfo.isExpired
                  ? "text-red-500 dark:text-red-400"
                  : "text-green-500 dark:text-green-400"
              }
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("expiration")}
            </span>
          </div>
          <p
            className={`text-sm font-medium ${tokenInfo.isExpired ? "text-red-600 dark:text-red-300" : "text-green-600 dark:text-green-300"}`}
          >
            {tokenInfo.isExpired ? t("expired") : t("valid")}
          </p>
          {tokenInfo.expiresAt && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {tokenInfo.expiresAt.toLocaleString()}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-blue-200/50 bg-blue-50/50 p-3 dark:border-blue-800/20 dark:bg-blue-900/10">
          <div className="mb-1 flex items-center gap-2">
            <Shield size={14} className="text-blue-500 dark:text-blue-400" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("algorithm")}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
            {tokenInfo.algorithm || t("unknown")}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("type")}: {tokenInfo.tokenType || "JWT"}
          </p>
        </div>

        <div className="rounded-lg border border-amber-200/50 bg-amber-50/50 p-3 dark:border-amber-800/20 dark:bg-amber-900/10">
          <div className="mb-1 flex items-center gap-2">
            <Key size={14} className="text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("issued")}
            </span>
          </div>
          {tokenInfo.issuedAt ? (
            <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
              {tokenInfo.issuedAt.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("noData")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TokenInfoCards
