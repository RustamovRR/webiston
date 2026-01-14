import React from "react"
import { Palette, Info } from "lucide-react"
import { useTranslations } from "next-intl"

const InfoSection: React.FC = () => {
  const t = useTranslations("ColorConverterPage.Info")

  return (
    <>
      {/* Color Formats Examples */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <Palette size={20} className="text-indigo-500 dark:text-indigo-400" />
          {t("examples.title") || "Rang Format Misollari"}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
            <div className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("examples.hex") || "HEX Formatlar"}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-red-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  #FF0000
                </code>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-blue-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  #0000FF
                </code>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  #00FF00
                </code>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
            <div className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("examples.rgb") || "RGB Formatlar"}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-red-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  rgb(255, 0, 0)
                </code>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-blue-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  rgb(0, 0, 255)
                </code>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  rgb(0, 255, 0)
                </code>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
            <div className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("examples.hsl") || "HSL Formatlar"}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-red-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  hsl(0, 100%, 50%)
                </code>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-blue-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  hsl(240, 100%, 50%)
                </code>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500" />
                <code className="text-sm text-zinc-700 dark:text-zinc-300">
                  hsl(120, 100%, 50%)
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Information */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <Info size={20} className="text-indigo-500 dark:text-indigo-400" />
          {t("about.title") || "Rang formatlar haqida ma'lumot"}
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              {t("about.hex.title") || "HEX Format"}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                •{" "}
                {t("about.hex.desc1") || "Web dasturlashda eng keng tarqalgan"}
              </li>
              <li>
                • {t("about.hex.desc2") || "#RRGGBB formatida (6 ta belgi)"}
              </li>
              <li>• {t("about.hex.desc3") || "CSS da bevosita ishlatiladi"}</li>
              <li>• {t("about.hex.desc4") || "16 lik sanoq tizimida"}</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              {t("about.rgb.title") || "RGB Format"}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• {t("about.rgb.desc1") || "Red, Green, Blue qiymatlari"}</li>
              <li>
                • {t("about.rgb.desc2") || "0-255 oralig'ida har bir kanal"}
              </li>
              <li>• {t("about.rgb.desc3") || "Monitor va ekranlar uchun"}</li>
              <li>
                • {t("about.rgb.desc4") || "JavaScript da keng ishlatiladi"}
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              {t("about.hsl.title") || "HSL Format"}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• {t("about.hsl.desc1") || "Hue, Saturation, Lightness"}</li>
              <li>• {t("about.hsl.desc2") || "Inson uchun tushunarli"}</li>
              <li>
                • {t("about.hsl.desc3") || "CSS3 da qo'llab-quvvatlanadi"}
              </li>
              <li>
                • {t("about.hsl.desc4") || "Rang moslamalari uchun qulay"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfoSection
