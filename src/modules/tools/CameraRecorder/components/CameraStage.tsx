"use client"

import { cn } from "@webiston/ui"
import { Button } from "@webiston/ui/primitives/button"
import { Camera, Circle, Pause, Play, Square } from "lucide-react"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { formatDuration } from "@/lib/utils"

import type { CameraSettings } from "../types"

/**
 * The picture, and the two things you do with it.
 *
 * One card. The layout this replaces had a "video preview panel", a "status
 * panel" and a "control panel" as three separate boxes, so the shutter button
 * was never next to the thing it photographs — and the status panel's job was
 * to restate values the preview was already showing.
 *
 * The live readout sits ON the video rather than beside it, because it
 * describes the video: resolution and frame rate as reported by the track, not
 * as requested, so a camera that quietly negotiated 720p out of a 1080p request
 * says so where you are looking.
 */

interface CameraStageProps {
  videoRef: RefObject<HTMLVideoElement | null>
  settings: CameraSettings | null
  mirrored: boolean
  onCapture: () => void
  recorder: {
    isRecording: boolean
    isPaused: boolean
    elapsed: number
    canRecord: boolean
    start: () => void
    stop: () => void
    pause: () => void
    resume: () => void
  }
}

export function CameraStage({
  videoRef,
  settings,
  mirrored,
  onCapture,
  recorder
}: CameraStageProps) {
  const t = useTranslations("CameraRecorderPage.stage")

  const dimensions =
    settings?.width && settings?.height
      ? `${settings.width} × ${settings.height}`
      : null
  const fps = settings?.frameRate ? Math.round(settings.frameRate) : null

  return (
    <ToolCard title={t("title")} bodyClassName="p-0">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {/* biome-ignore lint/a11y/useMediaCaption: a live preview of the
            visitor's own camera on their own machine — there is no recorded
            content and no caption track that could exist for it. */}
        <video
          ref={videoRef}
          // `muted` is load-bearing, not cosmetic: an unmuted preview of a
          // stream that includes the microphone is an instant feedback loop,
          // and browsers block autoplay for anything with sound anyway.
          muted
          playsInline
          autoPlay
          className={cn("size-full object-contain", mirrored && "-scale-x-100")}
        />

        {dimensions ? (
          <div className="absolute top-3 left-3 rounded-md bg-background/80 px-2 py-1 font-mono text-foreground text-xs backdrop-blur-sm">
            {dimensions}
            {fps ? ` · ${t("fps", { value: fps })}` : ""}
          </div>
        ) : null}

        {recorder.isRecording ? (
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-md bg-background/80 px-2 py-1 backdrop-blur-sm">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full bg-destructive",
                !recorder.isPaused && "animate-pulse"
              )}
            />
            <span
              role="timer"
              // Not announced: a clock read aloud every second is unusable,
              // and the start and stop are announced by their buttons.
              aria-live="off"
              className="font-mono text-foreground text-xs tabular-nums"
            >
              {formatDuration(recorder.elapsed)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-border border-t p-4">
        <Button onClick={onCapture} className="gap-2">
          <Camera aria-hidden="true" className="size-4" />
          {t("snapshot")}
        </Button>

        {recorder.isRecording ? (
          <>
            <Button
              variant="destructive"
              onClick={recorder.stop}
              className="gap-2"
            >
              <Square aria-hidden="true" className="size-4" />
              {t("stopRecording")}
            </Button>
            <Button
              variant="outline"
              onClick={recorder.isPaused ? recorder.resume : recorder.pause}
              className="gap-2"
            >
              {recorder.isPaused ? (
                <Play aria-hidden="true" className="size-4" />
              ) : (
                <Pause aria-hidden="true" className="size-4" />
              )}
              {recorder.isPaused ? t("resume") : t("pause")}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={recorder.start}
            disabled={!recorder.canRecord}
            className="gap-2"
          >
            <Circle aria-hidden="true" className="size-4 fill-current" />
            {t("record")}
          </Button>
        )}
      </div>
    </ToolCard>
  )
}
