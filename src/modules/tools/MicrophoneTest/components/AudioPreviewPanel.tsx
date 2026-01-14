"use client"

import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { AudioVisualizer } from "./AudioVisualizer"
import { AudioStats, AudioInfo } from "../hooks/useMicrophoneTest"

interface AudioPreviewPanelProps {
  isListening: boolean
  isRecording: boolean
  recordingDuration: number
  audioStats: AudioStats
  audioInfo: AudioInfo | null
  onStartRecording: () => void
  onStopRecording: () => void
  formatDuration: (seconds: number) => string
}

export function AudioPreviewPanel({
  isListening,
  isRecording,
  recordingDuration,
  audioStats,
  audioInfo,
  onStartRecording,
  onStopRecording,
  formatDuration
}: AudioPreviewPanelProps) {
  const t = useTranslations("MicrophoneTestPage.AudioPreviewPanel")

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs text-red-400">
                REC {formatDuration(recordingDuration)}
              </span>
            </>
          )}
          {!isRecording && (
            <>
              <div
                className={`h-2 w-2 rounded-full ${isListening ? "bg-green-500" : "bg-zinc-500"}`}
              ></div>
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
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
            className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            <h4 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">
              {t("audioInfo.title")}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {t("audioInfo.sampleRate")}:
                </span>
                <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                  {audioInfo.sampleRate} Hz
                </span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {t("audioInfo.channels")}:
                </span>
                <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                  {audioInfo.channelCount}
                </span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {t("audioInfo.echoCancellation")}:
                </span>
                <span
                  className={`ml-2 ${audioInfo.echoCancellation ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {audioInfo.echoCancellation
                    ? t("audioInfo.enabled")
                    : t("audioInfo.disabled")}
                </span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {t("audioInfo.noiseSuppression")}:
                </span>
                <span
                  className={`ml-2 ${audioInfo.noiseSuppression ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
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
