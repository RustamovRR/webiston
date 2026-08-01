"use client"

import { motion } from "framer-motion"
import { Mic } from "lucide-react"
import { useTranslations } from "next-intl"
import { StatsDisplay, ToolHeader } from "@/components/shared"
import {
  AudioPreviewModal,
  AudioPreviewPanel,
  ControlPanel,
  InfoSection,
  RecordedAudioPanel
} from "./components"
import { useMicrophoneTest } from "./hooks/useMicrophoneTest"

export default function MicrophoneTest() {
  const t = useTranslations("MicrophoneTestPage.ToolHeader")
  const tSample = useTranslations("MicrophoneTestPage.SampleMicrophones")

  const {
    audioDevices,
    selectedDevice,
    isListening,
    isRecording,
    error,
    audioInfo,
    recordedAudios,
    recordingDuration,
    previewAudio,
    audioStats,
    sampleMicrophones,
    getAudioDevices,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    switchMicrophone,
    downloadAudio,
    deleteAudio,
    clearAllRecordings,
    openPreview,
    closePreview,
    getAudioQuality,
    getStats
  } = useMicrophoneTest({})

  const audioQuality = getAudioQuality(audioStats.level)

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6">
      <ToolHeader title={t("title")} description={t("description")} />

      <div className="mb-8">
        <StatsDisplay stats={getStats()} />
      </div>

      {/* Control Panel */}
      <div className="mb-6">
        <ControlPanel
          audioDevices={audioDevices}
          selectedDevice={selectedDevice}
          isListening={isListening}
          audioQuality={audioQuality}
          onStartListening={startListening}
          onStopListening={stopListening}
          onRefreshDevices={getAudioDevices}
          onSwitchMicrophone={switchMicrophone}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Audio Preview Panel */}
        <div className="sticky top-20 h-fit">
          <AudioPreviewPanel
            isListening={isListening}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            audioStats={audioStats}
            audioInfo={audioInfo}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />
        </div>

        {/* Recorded Audio Panel */}
        <div className="h-[600px]">
          <RecordedAudioPanel
            recordedAudios={recordedAudios}
            onPreview={openPreview}
            onDownload={downloadAudio}
            onDelete={deleteAudio}
            onClearAll={clearAllRecordings}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/80 p-4 backdrop-blur-sm"
        >
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Sample Microphones - Show when no devices */}
      {!isListening && audioDevices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-xl border border-border bg-card/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-foreground">
              {tSample("title")}
            </span>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 transition-all hover:border-border hover:bg-muted/50">
                <div className="mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-info" />
                  <span className="font-medium text-foreground">
                    {tSample("standard.name")}
                  </span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  {tSample("standard.description")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tSample("standard.tip")}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 transition-all hover:border-border hover:bg-muted/50">
                <div className="mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-success" />
                  <span className="font-medium text-foreground">
                    {tSample("usb.name")}
                  </span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  {tSample("usb.description")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tSample("usb.tip")}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 transition-all hover:border-border hover:bg-muted/50">
                <div className="mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-foreground">
                    {tSample("bluetooth.name")}
                  </span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  {tSample("bluetooth.description")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tSample("bluetooth.tip")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <InfoSection />

      {/* Audio Preview Modal */}
      <AudioPreviewModal audio={previewAudio} onClose={closePreview} />
    </div>
  )
}
