"use client"

import { cn } from "@webiston/ui/utils"
import { useTranslations } from "next-intl"

import type { StrengthReport } from "../utils/strength"

/**
 * Strength as measured facts: the meter, the bits, the crack time, the
 * alphabet — the same "premium is precision" move as the QR page's
 * "29×29 modul" and contrast ratio.
 *
 * Colours per level come from the semantic state tokens, in one map. The old
 * panel carried its red-to-emerald palette classes INSIDE THE HOOK, so the
 * strength logic owned presentation and neither could be tested.
 */

const LEVEL_CLASS: Record<
  StrengthReport["level"],
  { bar: string; text: string }
> = {
  1: { bar: "bg-destructive", text: "text-destructive" },
  2: { bar: "bg-warning", text: "text-warning" },
  3: { bar: "bg-chart-1", text: "text-chart-1" },
  4: { bar: "bg-success", text: "text-success" },
  5: { bar: "bg-success", text: "text-success" }
}

const LEVEL_KEY: Record<StrengthReport["level"], string> = {
  1: "weak",
  2: "fair",
  3: "good",
  4: "strong",
  5: "veryStrong"
}

interface StrengthMeterProps {
  strength: StrengthReport | null
  passwordLength: number
  uniqueCharacters: number
}

export function StrengthMeter({
  strength,
  passwordLength,
  uniqueCharacters
}: StrengthMeterProps) {
  const t = useTranslations("PasswordGeneratorPage.StrengthPanel")
  const tLevels = useTranslations("PasswordGeneratorPage.StrengthLevels")

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-border border-b px-5 py-3">
        <span
          aria-hidden="true"
          className="size-[6px] shrink-0 rounded-[2px] bg-border-strong"
        />
        <h2 className="font-medium text-base text-foreground">{t("title")}</h2>
        {strength && (
          <span
            className={cn(
              "ml-auto font-medium text-sm",
              LEVEL_CLASS[strength.level].text
            )}
          >
            {tLevels(LEVEL_KEY[strength.level])}
          </span>
        )}
      </div>

      <div className="space-y-5 px-5 py-5">
        {/* Five segments, filled to the level. Not a gradient bar: discrete
            steps say "category", which is what the thresholds are. */}
        <div
          role="meter"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={strength?.level ?? 1}
          aria-label={t("title")}
          className="flex gap-1.5"
        >
          {([1, 2, 3, 4, 5] as const).map((segment) => (
            <span
              key={segment}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                strength && segment <= strength.level
                  ? LEVEL_CLASS[strength.level].bar
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {strength && (
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t("entropy")}</dt>
              <dd className="font-mono text-foreground tabular-nums">
                {t("bits", { bits: strength.bits })}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t("crackTime")}</dt>
              <dd className="font-mono text-foreground tabular-nums">
                {t(`crack.${strength.crack.unit}`, {
                  value: strength.crack.value ?? 0
                })}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t("alphabet")}</dt>
              <dd className="font-mono text-foreground tabular-nums">
                {strength.alphabetSize}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t("unique")}</dt>
              <dd className="font-mono text-foreground tabular-nums">
                {uniqueCharacters}/{passwordLength}
              </dd>
            </div>
          </dl>
        )}

        {/* The honest caveat that makes the numbers mean something. */}
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t("assumption")}
        </p>
      </div>
    </div>
  )
}
