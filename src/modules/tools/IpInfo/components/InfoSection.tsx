"use client"

import { useTranslations } from "next-intl"

export default function InfoSection() {
  const t = useTranslations("IpInfoPage.InfoSection")

  // Debug: console.log('Translation test:', t('geolocationItems.country'))

  return (
    <div className="mt-12 space-y-8">
      <div className="flex flex-col items-center text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Geolocation Features */}
        <div className="rounded-xl border border-border bg-card/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-foreground">
            {t("geolocationTitle")}
          </h3>
          <p className="mb-6 text-muted-foreground">{t("geolocationDesc")}</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <code className="rounded bg-blue-500/20 px-2 py-1 text-info">
                Mamlakat
              </code>
              <span>{t("geolocationItems.country")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-green-500/20 px-2 py-1 text-success">
                Mintaqa
              </code>
              <span>{t("geolocationItems.region")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-purple-500/20 px-2 py-1 text-purple-600 dark:text-purple-300">
                Koordinatalar
              </code>
              <span>{t("geolocationItems.coordinates")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-orange-500/20 px-2 py-1 text-orange-600 dark:text-orange-300">
                Vaqt Zonasi
              </code>
              <span>{t("geolocationItems.timezone")}</span>
            </li>
          </ul>
        </div>

        {/* Network Analysis */}
        <div className="rounded-xl border border-border bg-card/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-foreground">
            {t("networkAnalysisTitle")}
          </h3>
          <p className="mb-6 text-muted-foreground">
            {t("networkAnalysisDesc")}
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <code className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-600 dark:text-cyan-300">
                ISP
              </code>
              <span>{t("networkItems.isp")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-yellow-500/20 px-2 py-1 text-warning">
                ASN
              </code>
              <span>{t("networkItems.asn")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-red-500/20 px-2 py-1 text-destructive">
                IP Turi
              </code>
              <span>{t("networkItems.ipType")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-indigo-500/20 px-2 py-1 text-indigo-600 dark:text-indigo-300">
                Ulanish
              </code>
              <span>{t("networkItems.connection")}</span>
            </li>
          </ul>
        </div>

        {/* Country Information */}
        <div className="rounded-xl border border-border bg-card/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-foreground">
            {t("countryInfoTitle")}
          </h3>
          <p className="mb-6 text-muted-foreground">{t("countryInfoDesc")}</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <code className="rounded bg-pink-500/20 px-2 py-1 text-pink-600 dark:text-pink-300">
                Valyuta
              </code>
              <span>{t("countryItems.currency")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-teal-500/20 px-2 py-1 text-teal-600 dark:text-teal-300">
                Poytaxt
              </code>
              <span>{t("countryItems.capital")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-violet-500/20 px-2 py-1 text-violet-600 dark:text-violet-300">
                Telefon Kodi
              </code>
              <span>{t("countryItems.phoneCode")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-emerald-500/20 px-2 py-1 text-success">
                EU Holati
              </code>
              <span>{t("countryItems.euStatus")}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* API Information */}
      <div className="rounded-xl border border-border bg-card/50 p-8">
        <h3 className="mb-6 text-xl font-semibold text-foreground">
          {t("apiIntegrationTitle")}
        </h3>
        <p className="mb-8 text-muted-foreground">{t("apiIntegrationDesc")}</p>

        <div className="mt-2 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
            <h4 className="mb-3 font-semibold text-foreground">
              {t("realTimeDataTitle")}
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("realTimeDataDesc")}
            </p>
            <code className="text-xs text-success">
              {t("realTimeDataCode")}
            </code>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
            <h4 className="mb-3 font-semibold text-foreground">
              {t("dataAccuracyTitle")}
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("dataAccuracyDesc")}
            </p>
            <code className="text-xs text-info">{t("dataAccuracyCode")}</code>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
            <h4 className="mb-3 font-semibold text-foreground">
              {t("ipSupportTitle")}
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("ipSupportDesc")}
            </p>
            <code className="text-xs text-purple-600 dark:text-purple-300">
              {t("ipSupportCode")}
            </code>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
            <h4 className="mb-3 font-semibold text-foreground">
              {t("jsonExportTitle")}
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("jsonExportDesc")}
            </p>
            <code className="text-xs text-orange-600 dark:text-orange-300">
              {t("jsonExportCode")}
            </code>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="rounded-xl border border-border bg-card/50 p-8">
        <h3 className="mb-6 text-xl font-semibold text-foreground">
          {t("useCasesTitle")}
        </h3>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              {t("webDevTitle")}
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• {t("webDevItems.geoTargeting")}</li>
              <li>• {t("webDevItems.fraudDetection")}</li>
              <li>• {t("webDevItems.personalization")}</li>
              <li>• {t("webDevItems.troubleshooting")}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              {t("analyticsTitle")}
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• {t("analyticsItems.trafficAnalysis")}</li>
              <li>• {t("analyticsItems.marketResearch")}</li>
              <li>• {t("analyticsItems.cdnOptimization")}</li>
              <li>• {t("analyticsItems.compliance")}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Final Tips */}
      <div className="rounded-xl border border-info/20 bg-info/5 p-8">
        <h4 className="mb-4 font-semibold text-info">
          {t("professionalTipsTitle")}
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-info">
              <strong>{t("privacyNoticeTitle")}</strong>{" "}
              {t("privacyNoticeDesc")}
            </p>
          </div>
          <div>
            <p className="text-sm text-info">
              <strong>{t("accuracyNoticeTitle")}</strong>{" "}
              {t("accuracyNoticeDesc")}
              <code className="mx-1 rounded bg-blue-500/20 px-1 text-info">
                {t("accuracyNoticeCode")}
              </code>
              {t("accuracyNoticeDesc2")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
