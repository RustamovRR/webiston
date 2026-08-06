"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { DEVICE_PRESETS } from "../constants"
import { matchingPresets } from "../utils/metrics"

/**
 * Common devices, in the units that matter.
 *
 * These are VIEWPORT sizes, not the resolutions on the box. An iPhone 15 Pro
 * Max is sold as 1290×2796 and its media queries see 430×932, because the
 * device pixel ratio is 3 — and getting that backwards is the most common
 * error in device-size cheat sheets, including the one this tool used to ship
 * (it listed "4K UHD 3840×2160" as a *device type* alongside "Mobile").
 *
 * The list scrolls inside its own box. Fourteen rows at full height would set
 * the page height and push everything below it out of reach — long output
 * never gets to do that here.
 */

interface PresetListProps {
  viewportWidth: number
  viewportHeight: number
}

export function PresetList({ viewportWidth, viewportHeight }: PresetListProps) {
  const t = useTranslations("ScreenResolutionPage.presets")

  const matches = new Set(
    matchingPresets(viewportWidth, viewportHeight).map((preset) => preset.name)
  )

  return (
    <ToolCard title={t("title")} tone="muted" bodyClassName="p-0">
      <div className="max-h-[22rem] overflow-y-auto overscroll-contain">
        <table className="w-full text-sm">
          <caption className="sr-only">{t("caption")}</caption>
          <thead className="sticky top-0 bg-card">
            <tr className="border-border border-b text-left">
              <th className="px-5 py-2.5 font-medium text-muted-foreground text-xs">
                {t("columns.device")}
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-muted-foreground text-xs">
                {t("columns.viewport")}
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-muted-foreground text-xs">
                {t("columns.dpr")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DEVICE_PRESETS.map((preset) => {
              const isMatch = matches.has(preset.name)
              return (
                <tr
                  key={preset.name}
                  className={cn(isMatch && "bg-primary/10")}
                >
                  <td className="px-5 py-2.5 text-foreground">
                    {preset.name}
                    {isMatch ? (
                      <span className="ml-2 text-primary text-xs">
                        {t("youAreHere")}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-foreground tabular-nums">
                    {preset.width} × {preset.height}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-muted-foreground tabular-nums">
                    {preset.pixelRatio}×
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ToolCard>
  )
}
