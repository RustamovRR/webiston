"use client"

import { useTranslations } from "next-intl"

export default function InfoSection() {
  const t = useTranslations("IpInfoPage.InfoSection")

  // Debug: console.log('Translation test:', t('geolocationItems.country'))

  return (
    <div className="mt-12 space-y-8">
      <div className="flex flex-col items-center text-center">
        <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Geolocation Features */}
        <div className="rounded-xl border border-zinc-200 bg-white/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {t("geolocationTitle")}
          </h3>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            {t("geolocationDesc")}
          </p>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-3">
              <code className="rounded bg-blue-500/20 px-2 py-1 text-blue-600 dark:text-blue-300">
                Mamlakat
              </code>
              <span>{t("geolocationItems.country")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-green-500/20 px-2 py-1 text-green-600 dark:text-green-300">
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
        <div className="rounded-xl border border-zinc-200 bg-white/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {t("networkAnalysisTitle")}
          </h3>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            {t("networkAnalysisDesc")}
          </p>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-3">
              <code className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-600 dark:text-cyan-300">
                ISP
              </code>
              <span>{t("networkItems.isp")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-yellow-500/20 px-2 py-1 text-yellow-600 dark:text-yellow-300">
                ASN
              </code>
              <span>{t("networkItems.asn")}</span>
            </li>
            <li className="flex items-center gap-3">
              <code className="rounded bg-red-500/20 px-2 py-1 text-red-600 dark:text-red-300">
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
        <div className="rounded-xl border border-zinc-200 bg-white/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {t("countryInfoTitle")}
          </h3>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            {t("countryInfoDesc")}
          </p>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
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
              <code className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-600 dark:text-emerald-300">
                EU Holati
              </code>
              <span>{t("countryItems.euStatus")}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* API Information */}
      <div className="rounded-xl border border-zinc-200 bg-white/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {t("apiIntegrationTitle")}
        </h3>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          {t("apiIntegrationDesc")}
        </p>

        <div className="mt-2 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-6 dark:border-zinc-700/50 dark:bg-zinc-800/30">
            <h4 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">
              {t("realTimeDataTitle")}
            </h4>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              {t("realTimeDataDesc")}
            </p>
            <code className="text-xs text-green-600 dark:text-green-300">
              {t("realTimeDataCode")}
            </code>
          </div>

          <div className="rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-6 dark:border-zinc-700/50 dark:bg-zinc-800/30">
            <h4 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">
              {t("dataAccuracyTitle")}
            </h4>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              {t("dataAccuracyDesc")}
            </p>
            <code className="text-xs text-blue-600 dark:text-blue-300">
              {t("dataAccuracyCode")}
            </code>
          </div>

          <div className="rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-6 dark:border-zinc-700/50 dark:bg-zinc-800/30">
            <h4 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">
              {t("ipSupportTitle")}
            </h4>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              {t("ipSupportDesc")}
            </p>
            <code className="text-xs text-purple-600 dark:text-purple-300">
              {t("ipSupportCode")}
            </code>
          </div>

          <div className="rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-6 dark:border-zinc-700/50 dark:bg-zinc-800/30">
            <h4 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">
              {t("jsonExportTitle")}
            </h4>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              {t("jsonExportDesc")}
            </p>
            <code className="text-xs text-orange-600 dark:text-orange-300">
              {t("jsonExportCode")}
            </code>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="rounded-xl border border-zinc-200 bg-white/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {t("useCasesTitle")}
        </h3>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="mb-4 font-semibold text-zinc-800 dark:text-zinc-200">
              {t("webDevTitle")}
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• {t("webDevItems.geoTargeting")}</li>
              <li>• {t("webDevItems.fraudDetection")}</li>
              <li>• {t("webDevItems.personalization")}</li>
              <li>• {t("webDevItems.troubleshooting")}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-zinc-800 dark:text-zinc-200">
              {t("analyticsTitle")}
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• {t("analyticsItems.trafficAnalysis")}</li>
              <li>• {t("analyticsItems.marketResearch")}</li>
              <li>• {t("analyticsItems.cdnOptimization")}</li>
              <li>• {t("analyticsItems.compliance")}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Final Tips */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 dark:border-blue-400/20 dark:bg-blue-400/5">
        <h4 className="mb-4 font-semibold text-blue-800 dark:text-blue-200">
          {t("professionalTipsTitle")}
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-100">
              <strong>{t("privacyNoticeTitle")}</strong>{" "}
              {t("privacyNoticeDesc")}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-100">
              <strong>{t("accuracyNoticeTitle")}</strong>{" "}
              {t("accuracyNoticeDesc")}
              <code className="mx-1 rounded bg-blue-500/20 px-1 text-blue-600 dark:text-blue-300">
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
