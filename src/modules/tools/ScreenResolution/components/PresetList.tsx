"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { DEVICE_PRESETS } from "../constants"
import type { Preview } from "../types"
import { matchingPresets } from "../utils/metrics"

/**
 * Common devices, in the units that matter — and every row is a button.
 *
 * These are VIEWPORT sizes, not the resolutions on the box. An iPhone 15 Pro
 * Max is sold as 1290×2796 and its media queries see 430×932, because the
 * device pixel ratio is 3 — the most common error in device-size cheat sheets,
 * including the one this tool used to ship (it listed "4K UHD 3840×2160" as a
 * *device type*, next to "Mobile").
 *
 * Clicking a row asks the rest of the page to answer for that device instead
 * of your window. A static table tells you an iPad is 1024 wide; this one
 * tells you which breakpoint that lands in and hands you the media query.
 *
 * The list scrolls inside its own box. Fourteen rows at full height would set
 * the page height and push everything below out of reach.
 */

interface PresetListProps {
  width: number | null
  height: number | null
  onPreview: (preview: Preview) => void
}

export function PresetList({ width, height, onPreview }: PresetListProps) {
  const t = useTranslations("ScreenResolutionPage.presets")

  const matches =
    width !== null && height !== null
      ? new Set(matchingPresets(width, height).map((preset) => preset.name))
      : new Set<string>()

  return (
    <ToolCard title={t("title")} bodyClassName="p-0">
      {/* Outside the scroller on purpose: a hint that scrolls away has not
          been read by the person who needed it. Clickable rows with no
          affordance is a UX gap, not a clean surface. */}
      <p className="border-border border-b px-5 py-2.5 text-muted-foreground text-xs">
        {t("hint")}
      </p>
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
                  className={cn(
                    "cursor-pointer hover:bg-muted",
                    isMatch && "bg-primary/10"
                  )}
                >
                  <td className="p-0">
                    {/* The button carries the whole row's label so the action
                        is announced as one target, not three cells. */}
                    <button
                      type="button"
                      className="w-full px-5 py-2.5 text-left text-foreground"
                      onClick={() =>
                        onPreview({
                          width: preset.width,
                          height: preset.height,
                          source: preset.name
                        })
                      }
                    >
                      {preset.name}
                      {isMatch ? (
                        <span className="ml-2 text-primary text-xs">
                          {t("youAreHere")}
                        </span>
                      ) : null}
                    </button>
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
