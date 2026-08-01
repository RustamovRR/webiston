"use client"

import { motion } from "framer-motion"
import { Play, Square } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { formatDuration } from "@/lib/utils/format"
import type { AudioInfo, AudioStats } from "../hooks/useMicrophoneTest"
import { AudioVisualizer } from "./AudioVisualizer"

interface AudioPreviewPanelProps {
  isListening: boolean
  isRecording: boolean
  recordingDuration: number
  audioStats: AudioStats
  audioInfo: AudioInfo | null
  onStartRecording: () => void
  onStopRecording: () => void
}

export function AudioPreviewPanel({
  isListening,
  isRecording,
  recordingDuration,
  audioStats,
  audioInfo,
  onStartRecording,
  onStopRecording
}: AudioPreviewPanelProps) {
  const t = useTranslations("MicrophoneTestPage.AudioPreviewPanel")

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-foreground">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs text-destructive">
                REC {formatDuration(recordingDuration)}
              </span>
            </>
          )}
          {!isRecording && (
            <>
              <div
                className={`h-2 w-2 rounded-full ${isListening ? "bg-green-500" : "bg-zinc-500"}`}
              ></div>
              <span className="text-xs text-muted-foreground">
                {isListening ? t("status.live") : t("status.off")}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <AudioVisualizer
            audioStats={audioStats}
            isActive={isListening}
            width={500}
            height={200}
            className="w-full"
          />
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex justify-center gap-3"
          >
            {!isRecording ? (
              <ShimmerButton
                onClick={onStartRecording}
                disabled={!isListening}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="mr-2 h-4 w-4" />
                {t("buttons.startRecording")}
              </ShimmerButton>
            ) : (
              <Button onClick={onStopRecording} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                {t("buttons.stopRecording")}
              </Button>
            )}
          </motion.div>
        )}

        {isListening && audioInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-border bg-muted/50 p-4"
          >
            <h4 className="mb-3 font-semibold text-foreground">
              {t("audioInfo.title")}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t("audioInfo.sampleRate")}:
                </span>
                <span className="ml-2 text-foreground">
                  {audioInfo.sampleRate} Hz
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("audioInfo.channels")}:
                </span>
                <span className="ml-2 text-foreground">
                  {audioInfo.channelCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("audioInfo.echoCancellation")}:
                </span>
                <span
                  className={`ml-2 ${audioInfo.echoCancellation ? "text-success" : "text-destructive"}`}
                >
                  {audioInfo.echoCancellation
                    ? t("audioInfo.enabled")
                    : t("audioInfo.disabled")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("audioInfo.noiseSuppression")}:
                </span>
                <span
                  className={`ml-2 ${audioInfo.noiseSuppression ? "text-success" : "text-destructive"}`}
                >
                  {audioInfo.noiseSuppression
                    ? t("audioInfo.enabled")
                    : t("audioInfo.disabled")}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
