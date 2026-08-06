"use client"

import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { FRAMEWORKS } from "../constants"
import type { FrameworkId, Preview, ScreenMetrics } from "../types"
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
 * It renders BEFORE the first measurement, with em dashes where the numbers
 * go. Gating the whole card on `metrics` meant the server sent an empty page
 * body and ~700px of cards appeared at hydration, shoving the reference table
 * and the FAQ down the page. Reserving the layout costs nothing and is not a
 * skeleton — the labels are real, only the values are pending, and they arrive
 * on the first client tick.
 */

const PENDING = "—"

interface LiveReadoutProps {
  metrics: ScreenMetrics | null
  preview: Preview | null
  framework: FrameworkId
}

export function LiveReadout({ metrics, preview, framework }: LiveReadoutProps) {
  const t = useTranslations("ScreenResolutionPage.readout")
  const tValues = useTranslations("ScreenResolutionPage.values")

  const scale =
    FRAMEWORKS.find((entry) => entry.id === framework) ?? FRAMEWORKS[0]

  // The headline always reports the REAL window. A preview changes what the
  // derived panels answer for; it must never change what this claims to see.
  const width = metrics?.viewportWidth
  const height = metrics?.viewportHeight

  const breakpoint = preview
    ? activeBreakpoint(preview.width, scale.breakpoints)
    : width !== undefined
      ? activeBreakpoint(width, scale.breakpoints)
      : null

  const ratio =
    width !== undefined && height !== undefined
      ? describeAspectRatio(width, height)
      : null

  return (
    <ToolCard title={t("title")}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-4xl text-foreground tabular-nums sm:text-5xl">
          {width ?? PENDING}
          <span className="px-2 text-muted-foreground">×</span>
          {height ?? PENDING}
        </span>
        <span className="text-muted-foreground text-sm">{t("cssPixels")}</span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Fact
          label={preview ? t("breakpointPreview") : t("breakpoint")}
          value={breakpoint ?? PENDING}
        />
        <Fact label={t("aspectRatio")} value={ratio?.label ?? PENDING} />
        <Fact
          label={t("pixelRatio")}
          value={metrics ? `${metrics.pixelRatio}×` : PENDING}
        />
        <Fact
          label={t("orientation")}
          value={metrics ? tValues(metrics.orientation) : PENDING}
        />
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
