"use client"

import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { ScreenMetrics } from "../types"
import { activeBreakpoint, describeAspectRatio } from "../utils/metrics"

/**
 * The number this page exists to show, at the size it deserves.
 *
 * The VIEWPORT leads, not the screen. Every practical reason to open a screen
 * tool — a media query that will not fire, a layout that breaks at some width,
 * a bug report that needs a size in it — is answered by the viewport. The
 * monitor's resolution is trivia by comparison, so it sits underneath as
 * context rather than competing for the same visual weight.
 *
 * It also updates as you drag the window edge, which is the whole trick: a
 * static readout of `screen.width` is what every competing page shows, and it
 * cannot answer the question anyone actually has.
 */

interface LiveReadoutProps {
  metrics: ScreenMetrics
}

export function LiveReadout({ metrics }: LiveReadoutProps) {
  const t = useTranslations("ScreenResolutionPage.readout")
  const tValues = useTranslations("ScreenResolutionPage.values")

  const breakpoint = activeBreakpoint(metrics.viewportWidth)
  const ratio = describeAspectRatio(
    metrics.viewportWidth,
    metrics.viewportHeight
  )

  return (
    <ToolCard title={t("title")}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-4xl text-foreground tabular-nums sm:text-5xl">
          {metrics.viewportWidth}
          <span className="px-2 text-muted-foreground">×</span>
          {metrics.viewportHeight}
        </span>
        <span className="text-muted-foreground text-sm">{t("cssPixels")}</span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Fact label={t("breakpoint")} value={breakpoint} />
        <Fact label={t("aspectRatio")} value={ratio.label} />
        <Fact label={t("pixelRatio")} value={`${metrics.pixelRatio}×`} />
        <Fact label={t("orientation")} value={tValues(metrics.orientation)} />
      </dl>
    </ToolCard>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 break-words font-mono text-foreground text-sm">
        {value}
      </dd>
    </div>
  )
}
