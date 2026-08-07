"use client"

import { useTranslations } from "next-intl"

import { MediaAccessPanel } from "@/components/shared/MediaAccessPanel"
import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"
import { useMediaRecording } from "@/hooks/useMediaRecording"
import { AUDIO_MIME_CANDIDATES } from "@/lib/utils/media"

import {
  ListenCard,
  MicToolbar,
  ProcessingCard,
  RecordingsCard,
  SpeakerTestCard
} from "./components"
import { MAX_RECORDINGS } from "./constants"
import { useMicrophone } from "./hooks/useMicrophone"

/**
 * Composition root.
 *
 * The page has two states and the layout says which one it is in. Before a
 * microphone is open there is one card, and it explains what pressing the
 * button will do; after, the same slot is the live panel and the controls
 * appear above it. Nothing is requested until the button is pressed — the
 * version this replaces fired `getUserMedia` from a mount effect, so the
 * browser's permission dialog landed on a page nobody had read yet.
 *
 * The panels the visitor cannot use yet are simply not rendered. An empty
 * recordings list beside a dead level meter is four cards of furniture around
 * a page that has not started.
 */
export function MicrophoneTest() {
  const t = useTranslations("MicrophoneTestPage")

  const mic = useMicrophone()
  const recorder = useMediaRecording({
    stream: mic.stream,
    candidates: AUDIO_MIME_CANDIDATES,
    prefix: "mikrofon",
    max: MAX_RECORDINGS
  })

  /** The device the report should name, matched to what is actually open. */
  const activeLabel =
    mic.devices.find((device) => device.deviceId === mic.deviceId)?.label ||
    null

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6">
      <ToolHeader title={t("title")} description={t("description")} />

      {mic.isLive ? (
        <div className="mt-6 space-y-4">
          <MicToolbar
            devices={mic.devices}
            deviceId={mic.deviceId}
            onSelect={mic.select}
            onStop={mic.stop}
            isMonitoring={mic.isMonitoring}
            onMonitorChange={mic.setIsMonitoring}
            locked={recorder.isRecording}
            failure={mic.failure}
          />

          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <ListenCard
              analyserRef={mic.analyserRef}
              level={mic.level}
              isLive={mic.isLive}
              isSilent={mic.isSilent}
              recorder={recorder}
            />

            <div className="grid gap-4">
              <ProcessingCard
                processing={mic.processing}
                onChange={mic.updateProcessing}
                settings={mic.settings}
                // Reopening the stream mid-recording would end the recording,
                // so the switches are held while one is running.
                disabled={recorder.isRecording}
                deviceLabel={activeLabel}
              />
              <SpeakerTestCard />
              <RecordingsCard
                recordings={recorder.recordings}
                onRemove={recorder.remove}
                onClear={recorder.clear}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start">
          <ToolCard title={t("gate.title")} bodyClassName="p-0">
            <MediaAccessPanel
              status={mic.status}
              failure={mic.failure}
              permission={mic.permission}
              kind="microphone"
              onStart={() => {
                void mic.start()
              }}
            />
          </ToolCard>
          {/* Rendered before permission too, deliberately: it needs none, so
              it is the one thing on this page that still works for somebody
              who blocked the microphone and cannot get it back — and "can I
              hear anything at all" is half of what they came to find out. */}
          <SpeakerTestCard />
        </div>
      )}
    </div>
  )
}

export default MicrophoneTest
