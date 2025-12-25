import React from "react"
import { Shield, Key } from "lucide-react"
import { useTranslations } from "next-intl"

const InfoSection: React.FC = () => {
  const t = useTranslations("JwtDecoderPage.InfoSection")

  // JSON examples as constants to avoid translation issues
  const headerExample = `{
  "alg": "HS256",
  "typ": "JWT"
}`

  const payloadExample = `{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}`

  return (
    <>
      {/* JWT Examples Section */}
      <div className="animate-in slide-in-from-bottom-2 fade-in mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm transition-all duration-200 dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <Key
            size={20}
            className="text-indigo-400 transition-transform duration-200"
          />
          {t("structure")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-300/30 bg-zinc-100/50 p-4 dark:border-zinc-700/30 dark:bg-zinc-800/30">
            <div className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("format")}
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-zinc-500">
                  {t("structureDescription")}:
                </div>
                <code className="block rounded bg-zinc-200/50 p-2 font-mono text-sm break-all text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
                  header.payload.signature
                </code>
              </div>
              <div>
                <div className="mb-1 text-xs text-zinc-500">
                  {t("example")}:
                </div>
                <code className="block rounded bg-zinc-200/50 p-2 font-mono text-sm break-all text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                </code>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-300/30 bg-zinc-100/50 p-4 dark:border-zinc-700/30 dark:bg-zinc-800/30">
            <div className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("parts")}
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-zinc-500">Header:</div>
                <code className="block rounded bg-zinc-200/50 p-2 font-mono text-sm text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
                  {headerExample}
                </code>
              </div>
              <div>
                <div className="mb-1 text-xs text-zinc-500">Payload:</div>
                <code className="block rounded bg-zinc-200/50 p-2 font-mono text-sm text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
                  {payloadExample}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JWT About Section */}
      <div className="animate-in slide-in-from-bottom-3 fade-in mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm transition-all duration-700 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <Shield size={20} className="text-indigo-400" />
          {t("about")}
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              {t("whatIsJwt")}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>{t("whatIsJwtDescription1")}</li>
              <li>{t("whatIsJwtDescription2")}</li>
              <li>{t("whatIsJwtDescription3")}</li>
              <li>{t("whatIsJwtDescription4")}</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              {t("standardFields")}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>{t("issuer")}</li>
              <li>{t("subject")}</li>
              <li>{t("expiration")}</li>
              <li>{t("issuedAt")}</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              {t("security")}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>{t("securityDescription1")}</li>
              <li>{t("securityDescription2")}</li>
              <li>{t("securityDescription3")}</li>
              <li>{t("securityDescription4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfoSection
