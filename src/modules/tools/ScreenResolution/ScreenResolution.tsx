"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Download, Maximize, Minimize, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  BreakpointBar,
  LiveReadout,
  MeasurementsCard,
  MediaQueryCard,
  PresetList
} from "./components"
import { useScreenMetrics } from "./hooks/useScreenMetrics"

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
 * No loading state: reading `window.screen` takes microseconds, so the only
 * frame without data is the server-rendered one.
 */
const ScreenResolution = () => {
  const t = useTranslations("ScreenResolutionPage")
  const { metrics, json, refresh, toggleFullscreen, download } =
    useScreenMetrics()

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

      {metrics ? (
        <div className="grid grid-cols-1 gap-4">
          <LiveReadout metrics={metrics} />
          <BreakpointBar viewportWidth={metrics.viewportWidth} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MeasurementsCard metrics={metrics} />
            <div className="grid grid-cols-1 gap-4">
              <PresetList
                viewportWidth={metrics.viewportWidth}
                viewportHeight={metrics.viewportHeight}
              />
              <MediaQueryCard metrics={metrics} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ScreenResolution
export { ScreenResolution }
