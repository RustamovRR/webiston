"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib"

interface PasswordStrength {
  level: number
  text: string
  color: string
}

interface PasswordStats {
  characters: number
  unique: number
  entropy: number
}

interface StrengthPanelProps {
  password: string
  passwordStrength: PasswordStrength
  stats: PasswordStats
}

const StrengthPanel: React.FC<StrengthPanelProps> = ({
  password,
  passwordStrength,
  stats
}) => {
  const t = useTranslations("PasswordGeneratorPage.StrengthPanel")

  if (!password) return null

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              passwordStrength.level <= 2
                ? "bg-red-500"
                : passwordStrength.level <= 3
                  ? "bg-yellow-500"
                  : passwordStrength.level <= 4
                    ? "bg-blue-500"
                    : "bg-green-500"
            )}
          ></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {passwordStrength.text}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-100/30 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            {stats.characters}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("characters")}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-100/30 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
          <div className="text-2xl font-bold text-green-500 dark:text-green-400">
            {stats.unique}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("unique")}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-100/30 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
          <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">
            {stats.entropy}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("entropy")}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-100/30 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
          <div className={cn("text-2xl font-bold", passwordStrength.color)}>
            {passwordStrength.level}/5
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("strength")}
          </div>
        </div>
      </div>

      {/* Strength Bar */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {t("strengthLevel")}
          </span>
          <span className={cn("text-sm font-medium", passwordStrength.color)}>
            {passwordStrength.text}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              passwordStrength.level <= 1
                ? "bg-red-500"
                : passwordStrength.level <= 2
                  ? "bg-red-400"
                  : passwordStrength.level <= 3
                    ? "bg-yellow-400"
                    : passwordStrength.level <= 4
                      ? "bg-blue-400"
                      : "bg-green-400"
            )}
            style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default StrengthPanel
