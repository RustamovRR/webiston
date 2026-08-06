"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { ScreenMetrics } from "../types"
import {
  describeAspectRatio,
  megapixels,
  toDevicePixels
} from "../utils/metrics"

/**
 * Every measurement, with its units stated.
 *
 * The panel this replaces printed "1920 × 1080" for the screen and
 * "1512 × 982" for the window and left the reader to work out that only one of
 * them is what CSS sees — and it printed `colorDepth` and `pixelDepth` as two
 * separate rows, which no shipping browser has ever reported differently.
 *
 * A definition list, so a screen reader ties each value to its label. The old
 * markup used `<div>` pairs, which associate nothing.
 */

interface MeasurementsCardProps {
  metrics: ScreenMetrics
}

export function MeasurementsCard({ metrics }: MeasurementsCardProps) {
  const t = useTranslations("ScreenResolutionPage.measurements")
  const tValues = useTranslations("ScreenResolutionPage.values")

  const px = (w: number, h: number) => `${w} × ${h}`
  const device = (w: number, h: number) =>
    px(
      toDevicePixels(w, metrics.pixelRatio),
      toDevicePixels(h, metrics.pixelRatio)
    )

  const rows: { key: string; value: string; hint?: string }[] = [
    {
      key: "viewport",
      value: px(metrics.viewportWidth, metrics.viewportHeight),
      hint: t("hints.viewport")
    },
    {
      key: "window",
      value: px(metrics.outerWidth, metrics.outerHeight),
      hint: t("hints.window")
    },
    {
      key: "screen",
      value: px(metrics.screenWidth, metrics.screenHeight),
      hint: t("hints.screen")
    },
    {
      key: "screenDevice",
      value: device(metrics.screenWidth, metrics.screenHeight),
      hint: t("hints.screenDevice")
    },
    {
      key: "available",
      value: px(metrics.availWidth, metrics.availHeight),
      hint: t("hints.available")
    },
    {
      key: "aspectRatio",
      value: describeAspectRatio(metrics.screenWidth, metrics.screenHeight)
        .label
    },
    {
      key: "megapixels",
      value: `${megapixels(
        toDevicePixels(metrics.screenWidth, metrics.pixelRatio),
        toDevicePixels(metrics.screenHeight, metrics.pixelRatio)
      )} MP`
    },
    { key: "colorDepth", value: `${metrics.colorDepth} bit` },
    {
      key: "fullscreen",
      value: tValues(metrics.isFullscreen ? "yes" : "no")
    }
  ]

  const asText = rows
    .map((row) => `${t(`rows.${row.key}`)}: ${row.value}`)
    .join("\n")

  return (
    <ToolCard
      title={t("title")}
      actions={<CopyButton text={asText} label={t("copy")} />}
      bodyClassName="p-0"
    >
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-baseline justify-between gap-4 px-5 py-3"
          >
            <dt className="min-w-0 text-sm">
              <span className="text-muted-foreground">
                {t(`rows.${row.key}`)}
              </span>
              {row.hint ? (
                <span className="mt-0.5 block text-muted-foreground text-xs">
                  {row.hint}
                </span>
              ) : null}
            </dt>
            <dd className="shrink-0 font-mono text-foreground text-sm tabular-nums">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </ToolCard>
  )
}
