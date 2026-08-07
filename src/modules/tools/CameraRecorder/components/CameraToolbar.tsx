"use client"

import { Button } from "@webiston/ui/primitives/button"
import { FlipHorizontal, Mic, MicOff, Square, Zap } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  DeviceSelect,
  MediaFailureNotice
} from "@/components/shared/MediaAccessPanel"
import type { MediaAccessDevice } from "@/hooks/useMediaAccess"
import type { MediaFailure } from "@/lib/utils/media"

import type { CameraCapabilities } from "../types"

/**
 * The controls, as a row rather than a card.
 *
 * The microphone switch is here and it is honest: the camera tool used to
 * request `audio: true` unconditionally and never mention it, so the visitor's
 * microphone was live from the moment the preview was — and the recording
 * carried the room whether or not that was wanted.
 *
 * Torch and zoom render only when `getCapabilities()` reports them, which on a
 * laptop is never and on a phone is usually. A control that exists but does
 * nothing is worse than a missing one.
 */

interface CameraToolbarProps {
  devices: readonly MediaAccessDevice[]
  deviceId: string | null
  onSelect: (deviceId: string) => void
  onStop: () => void
  mirrored: boolean
  onMirrorChange: (next: boolean) => void
  withAudio: boolean
  onAudioChange: (next: boolean) => void
  capabilities: CameraCapabilities
  torch: boolean
  onTorchChange: (next: boolean) => void
  zoom: number | null
  onZoomChange: (next: number) => void
  /** Held while recording: reopening the stream would end the recording. */
  locked: boolean
  /** A switch that failed while the previous device kept working. */
  failure: MediaFailure | null
}

export function CameraToolbar({
  devices,
  deviceId,
  onSelect,
  onStop,
  mirrored,
  onMirrorChange,
  withAudio,
  onAudioChange,
  capabilities,
  torch,
  onTorchChange,
  zoom,
  onZoomChange,
  locked,
  failure
}: CameraToolbarProps) {
  const t = useTranslations("CameraRecorderPage.toolbar")

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <DeviceSelect
        devices={devices}
        value={deviceId}
        onChange={onSelect}
        kind="camera"
        disabled={locked}
      />

      <div className="flex flex-wrap items-center gap-2">
        {capabilities.zoom ? (
          <label className="flex items-center gap-2 text-muted-foreground text-sm">
            {t("zoom")}
            <input
              type="range"
              min={capabilities.zoom.min}
              max={capabilities.zoom.max}
              step={capabilities.zoom.step}
              value={zoom ?? capabilities.zoom.min}
              onChange={(event) => {
                onZoomChange(Number(event.target.value))
              }}
              className="accent-primary"
            />
          </label>
        ) : null}

        {capabilities.torch ? (
          <Button
            type="button"
            variant={torch ? "default" : "outline"}
            aria-pressed={torch}
            onClick={() => {
              onTorchChange(!torch)
            }}
            className="gap-2"
          >
            <Zap aria-hidden="true" className="size-4" />
            {t("torch")}
          </Button>
        ) : null}

        {/* Preview AND capture, together. A mirrored preview that saves an
            unmirrored file is the most common complaint about webcam tools:
            what is on screen is what lands in the file. */}
        <Button
          type="button"
          variant={mirrored ? "default" : "outline"}
          aria-pressed={mirrored}
          onClick={() => {
            onMirrorChange(!mirrored)
          }}
          className="gap-2"
        >
          <FlipHorizontal aria-hidden="true" className="size-4" />
          {t("mirror")}
        </Button>

        <Button
          type="button"
          variant={withAudio ? "default" : "outline"}
          aria-pressed={withAudio}
          disabled={locked}
          onClick={() => {
            onAudioChange(!withAudio)
          }}
          className="gap-2"
        >
          {withAudio ? (
            <Mic aria-hidden="true" className="size-4" />
          ) : (
            <MicOff aria-hidden="true" className="size-4" />
          )}
          {withAudio ? t("micOn") : t("micOff")}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onStop}
          className="gap-2"
        >
          <Square aria-hidden="true" className="size-4" />
          {t("stop")}
        </Button>
      </div>

      {failure ? <MediaFailureNotice failure={failure} kind="camera" /> : null}
    </div>
  )
}
