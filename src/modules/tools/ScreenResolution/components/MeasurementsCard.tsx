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
 *
 * Rows are rendered before the first measurement with an em dash in place of
 * the value: the labels are the half of this table that never changes, and
 * holding the whole card back until hydration was what made the page jump.
 */

const PENDING = "—"

interface MeasurementsCardProps {
  metrics: ScreenMetrics | null
}

export function MeasurementsCard({ metrics }: MeasurementsCardProps) {
  const t = useTranslations("ScreenResolutionPage.measurements")
  const tValues = useTranslations("ScreenResolutionPage.values")

  const rows = buildRows(metrics, t, tValues)

  const asText = metrics
    ? rows.map((row) => `${t(`rows.${row.key}`)}: ${row.value}`).join("\n")
    : ""

  return (
    <ToolCard
      title={t("title")}
      actions={
        <CopyButton text={asText} disabled={!asText} label={t("copy")} />
      }
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

type Translator = ReturnType<typeof useTranslations>

function buildRows(
  metrics: ScreenMetrics | null,
  t: Translator,
  tValues: Translator
): { key: string; value: string; hint?: string }[] {
  const keys = [
    "viewport",
    "window",
    "screen",
    "screenDevice",
    "available",
    "aspectRatio",
    "megapixels",
    "colorDepth",
    "fullscreen"
  ] as const

  const hints: Partial<Record<(typeof keys)[number], string>> = {
    viewport: t("hints.viewport"),
    window: t("hints.window"),
    screen: t("hints.screen"),
    screenDevice: t("hints.screenDevice"),
    available: t("hints.available")
  }

  if (!metrics) {
    return keys.map((key) => ({ key, value: PENDING, hint: hints[key] }))
  }

  const px = (w: number, h: number) => `${w} × ${h}`
  const deviceWidth = toDevicePixels(metrics.screenWidth, metrics.pixelRatio)
  const deviceHeight = toDevicePixels(metrics.screenHeight, metrics.pixelRatio)

  const values: Record<(typeof keys)[number], string> = {
    viewport: px(metrics.viewportWidth, metrics.viewportHeight),
    window: px(metrics.outerWidth, metrics.outerHeight),
    screen: px(metrics.screenWidth, metrics.screenHeight),
    screenDevice: px(deviceWidth, deviceHeight),
    available: px(metrics.availWidth, metrics.availHeight),
    aspectRatio: describeAspectRatio(metrics.screenWidth, metrics.screenHeight)
      .label,
    // Device pixels, matching the JSON export. The two disagreed until this
    // was pulled into one place.
    megapixels: `${megapixels(deviceWidth, deviceHeight)} MP`,
    colorDepth: `${metrics.colorDepth} bit`,
    fullscreen: tValues(metrics.isFullscreen ? "yes" : "no")
  }

  return keys.map((key) => ({ key, value: values[key], hint: hints[key] }))
}
