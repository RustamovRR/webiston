"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

const InfoSection: React.FC = () => {
  const t = useTranslations("ScreenResolutionPage.InfoSection")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 rounded-xl border border-border/30 bg-card/60 p-6 backdrop-blur-sm"
    >
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-cyan-500 dark:text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        {t("title")}
      </h3>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-foreground">
            <div className="h-2 w-2 rounded-full bg-info"></div>
            {t("realTimeTitle")}
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("realTimeDesc")}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-foreground">
            <div className="h-2 w-2 rounded-full bg-success"></div>
            {t("professionalTestingTitle")}
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• {t("professionalTestingItems.responsive")}</li>
            <li>• {t("professionalTestingItems.crossDevice")}</li>
            <li>• {t("professionalTestingItems.fullscreen")}</li>
            <li>• {t("professionalTestingItems.pixelRatio")}</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-foreground">
            <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400"></div>
            {t("technicalAnalysisTitle")}
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• {t("technicalAnalysisItems.resolution")}</li>
            <li>• {t("technicalAnalysisItems.deviceType")}</li>
            <li>• {t("technicalAnalysisItems.aspectRatio")}</li>
            <li>• {t("technicalAnalysisItems.jsonExport")}</li>
          </ul>
        </div>
      </div>

      {/* Resolution Standards */}
      <div className="mt-6 rounded-lg border border-border/30 bg-muted/30 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-cyan-500 dark:text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3"
            />
          </svg>
          {t("resolutionStandardsTitle")}
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("popularResolutions")}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between rounded bg-muted/50 p-2 text-sm">
                <span className="text-foreground">4K UHD</span>
                <code className="text-info">3840×2160</code>
              </div>
              <div className="flex justify-between rounded bg-muted/50 p-2 text-sm">
                <span className="text-foreground">Full HD</span>
                <code className="text-info">1920×1080</code>
              </div>
              <div className="flex justify-between rounded bg-muted/50 p-2 text-sm">
                <span className="text-foreground">HD</span>
                <code className="text-info">1366×768</code>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("deviceCategories")}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between rounded bg-muted/50 p-2 text-sm">
                <span className="text-foreground">Mobile</span>
                <code className="text-success">≤ 768px</code>
              </div>
              <div className="flex justify-between rounded bg-muted/50 p-2 text-sm">
                <span className="text-foreground">Tablet</span>
                <code className="text-success">769px - 1024px</code>
              </div>
              <div className="flex justify-between rounded bg-muted/50 p-2 text-sm">
                <span className="text-foreground">Desktop</span>
                <code className="text-success">1025px+</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Tips */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-info"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-info">
              {t("webDevTitle")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{t("webDevDesc")}</p>
        </div>

        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-success">
              {t("qaTitle")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{t("qaDesc")}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
        <div className="text-sm text-cyan-600 dark:text-cyan-400">
          <strong>💡 {t("proTipTitle")}</strong> {t("proTipDesc")}
          <code className="mx-1 rounded bg-cyan-400/20 px-1 text-cyan-700 dark:text-cyan-300">
            &lt;meta name="viewport" content="width=device-width,
            initial-scale=1"&gt;
          </code>
          {t("proTipCode")}
        </div>
      </div>
    </motion.div>
  )
}

export default InfoSection
