import { Clock, Key, Shield } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"

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
    <div className="animate-in slide-in-from-top-1 fade-in mb-4 rounded-lg border border-border bg-card/80 p-4 backdrop-blur-sm transition-all duration-200 duration-300 hover:shadow-md">
      <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Token Status
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div
          className={`rounded-lg border p-3 ${
            tokenInfo.isExpired
              ? "border-destructive/50 bg-destructive/50"
              : "border-success/50 bg-success/50"
          }`}
        >
          <div className="mb-1 flex items-center gap-2">
            <Clock
              size={14}
              className={
                tokenInfo.isExpired ? "text-destructive" : "text-success"
              }
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("expiration")}
            </span>
          </div>
          <p
            className={`text-sm font-medium ${tokenInfo.isExpired ? "text-destructive" : "text-success"}`}
          >
            {tokenInfo.isExpired ? t("expired") : t("valid")}
          </p>
          {tokenInfo.expiresAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              {tokenInfo.expiresAt.toLocaleString()}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-info/50 bg-info/50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Shield size={14} className="text-info" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("algorithm")}
            </span>
          </div>
          <p className="text-sm font-medium text-info">
            {tokenInfo.algorithm || t("unknown")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("type")}: {tokenInfo.tokenType || "JWT"}
          </p>
        </div>

        <div className="rounded-lg border border-warning/50 bg-warning/50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Key size={14} className="text-warning" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("issued")}
            </span>
          </div>
          {tokenInfo.issuedAt ? (
            <p className="text-sm font-medium text-warning">
              {tokenInfo.issuedAt.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noData")}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TokenInfoCards
