"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Download, Maximize, Minimize, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  BreakpointBar,
  LiveReadout,
  MeasurementsCard,
  MediaQueryCard,
  PresetList,
  WidthProbe
} from "./components"
import { DEFAULT_FRAMEWORK } from "./constants"
import { useScreenMetrics } from "./hooks/useScreenMetrics"
import type { FrameworkId, Preview } from "./types"

/**
 * What your CSS sees.
 *
 * The page is ordered by how often a question gets asked, not by how the data
 * is grouped internally: the live viewport first, the breakpoint it lands in
 * second, then the full measurements, the device comparison and the media
 * query to copy.
 *
 * The layout this replaces was a two-column "control panel / output panel"
 * split — a shape that makes sense for a converter, where the visitor supplies
 * input, and none at all here, where there is no input. Half the screen was a
 * bordered card holding four buttons, and one of those buttons loaded **fake
 * 1920×1080 data** into a tool whose entire purpose is reporting your real
 * screen.
 *
 * Two pieces of state live here rather than in the hook, because both are
 * questions the visitor asks ABOUT the measurements rather than measurements
 * themselves:
 *
 * - `framework` — whose breakpoint scale to answer in.
 * - `preview` — a width to answer for instead of the real window. The readout
 *   keeps reporting the real one; only the derived panels follow the preview,
 *   and they say so.
 */
const ScreenResolution = () => {
  const t = useTranslations("ScreenResolutionPage")
  const { metrics, json, refresh, toggleFullscreen, download } =
    useScreenMetrics()

  const [framework, setFramework] = useState<FrameworkId>(DEFAULT_FRAMEWORK)
  const [preview, setPreview] = useState<Preview | null>(null)

  // What the derived panels answer for. `null` until the first measurement,
  // which is the one frame where the page renders labels without values.
  const width = preview?.width ?? metrics?.viewportWidth ?? null
  const height = preview?.height ?? metrics?.viewportHeight ?? null

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={refresh}>
          <RefreshCw aria-hidden="true" />
          {t("controls.refresh")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
        >
          {metrics?.isFullscreen ? (
            <Minimize aria-hidden="true" />
          ) : (
            <Maximize aria-hidden="true" />
          )}
          {metrics?.isFullscreen
            ? t("controls.exitFullscreen")
            : t("controls.fullscreen")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!json}
          onClick={download}
        >
          <Download aria-hidden="true" />
          {t("controls.download")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <LiveReadout
          metrics={metrics}
          preview={preview}
          framework={framework}
        />
        <WidthProbe
          preview={preview}
          onPreview={setPreview}
          fallbackHeight={metrics?.viewportHeight ?? 0}
        />
        <BreakpointBar
          width={width}
          framework={framework}
          onFrameworkChange={setFramework}
          isPreview={preview !== null}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MeasurementsCard metrics={metrics} />
          <div className="grid grid-cols-1 gap-4">
            <PresetList width={width} height={height} onPreview={setPreview} />
            <MediaQueryCard
              width={width}
              height={height}
              pixelRatio={metrics?.pixelRatio ?? null}
              framework={framework}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScreenResolution
export { ScreenResolution }
