"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { MediaAccessPanel } from "@/components/shared/MediaAccessPanel"
import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"
import { useMediaRecording } from "@/hooks/useMediaRecording"
import { VIDEO_MIME_CANDIDATES } from "@/lib/utils/media"

import {
  CameraStage,
  CameraToolbar,
  CaptureGallery,
  QualityCard
} from "./components"
import { MAX_CAPTURES } from "./constants"
import { useCamera } from "./hooks/useCamera"
import { useSnapshots } from "./hooks/useSnapshots"

/**
 * Composition root.
 *
 * Two states, and the layout says which one it is in: before a camera is open
 * there is one card explaining what the button will do, and after it the same
 * slot is the live stage. Nothing is requested until the button is pressed —
 * the version this replaces called `getUserMedia` from a mount effect, so
 * opening the page turned the camera light on before the visitor had read a
 * word.
 */
export function CameraRecorder() {
  const t = useTranslations("CameraRecorderPage")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mirrored, setMirrored] = useState(true)

  const camera = useCamera()
  const recorder = useMediaRecording({
    stream: camera.stream,
    candidates: VIDEO_MIME_CANDIDATES,
    prefix: "kamera",
    max: MAX_CAPTURES
  })
  const snapshots = useSnapshots(videoRef, mirrored)

  /**
   * Binding the stream to the element.
   *
   * `srcObject` is not a prop React can set, so it is an effect — and the
   * cleanup matters: leaving a stopped stream attached is what left a frozen
   * last frame on screen looking like a live picture.
   */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.srcObject = camera.stream
    if (camera.stream) {
      // Autoplay can still be refused; there is nothing to report if it is,
      // because the controls to start it are already on screen.
      void video.play().catch(() => {})
    }

    return () => {
      video.srcObject = null
    }
  }, [camera.stream])

  /** The device the report should name, matched to what is actually open. */
  const activeLabel =
    camera.devices.find((device) => device.deviceId === camera.deviceId)
      ?.label || null

  const clearAll = () => {
    snapshots.clear()
    recorder.clear()
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6">
      <ToolHeader title={t("title")} description={t("description")} />

      {camera.isLive ? (
        <div className="mt-6 space-y-4">
          <CameraToolbar
            devices={camera.devices}
            deviceId={camera.deviceId}
            onSelect={camera.select}
            onStop={camera.stop}
            mirrored={mirrored}
            onMirrorChange={setMirrored}
            withAudio={camera.withAudio}
            onAudioChange={camera.setWithAudio}
            capabilities={camera.capabilities}
            torch={camera.torch}
            onTorchChange={(next) => {
              void camera.applyTorch(next)
            }}
            zoom={camera.zoom}
            onZoomChange={(next) => {
              void camera.applyZoom(next)
            }}
            // Reopening the stream mid-recording would end the recording, so
            // the settings that reopen it are held while one is running.
            locked={recorder.isRecording}
            failure={camera.failure}
          />

          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            {/* `self-stretch`, then `sticky` on the child — the same pairing
                the QR tool uses. A grid cell collapses to its content height,
                and an element with no travel inside its container never
                sticks. The preview is what you watch WHILE reading the panels
                beside it, so it is the one that should follow. */}
            <div className="lg:self-stretch">
              {/* The max-height guard the suite's other sticky panels carry: on a
                  short laptop window a sticky panel taller than the viewport
                  can never be scrolled to its own bottom. */}
              <div className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
                <CameraStage
                  videoRef={videoRef}
                  settings={camera.settings}
                  mirrored={mirrored}
                  onCapture={snapshots.capture}
                  recorder={recorder}
                  isBusy={camera.isBusy}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <QualityCard
                presetId={camera.presetId}
                onPresetChange={camera.setPresetId}
                requested={camera.preset}
                actual={camera.settings}
                locked={recorder.isRecording || camera.isBusy}
                deviceLabel={activeLabel}
                isBusy={camera.isBusy}
              />
              <CaptureGallery
                snapshots={snapshots.snapshots}
                recordings={recorder.recordings}
                onRemoveSnapshot={snapshots.remove}
                onRemoveRecording={recorder.remove}
                onClear={clearAll}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <ToolCard title={t("gate.title")} bodyClassName="p-0">
            <MediaAccessPanel
              status={camera.status}
              failure={camera.failure}
              permission={camera.permission}
              kind="camera"
              onStart={() => {
                void camera.start()
              }}
            />
          </ToolCard>
        </div>
      )}
    </div>
  )
}

export default CameraRecorder
