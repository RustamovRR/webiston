"use client"

import { motion } from "framer-motion"
import { Camera, Image, Play, Square } from "lucide-react"
import { useTranslations } from "next-intl"
import { ShimmerButton } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { VideoPreview } from "./VideoPreview"

interface VideoPreviewPanelProps {
  isCameraActive: boolean
  isRecording: boolean
  cameraStream: MediaStream | null
  recordingInfo: {
    duration: number
    formattedDuration: string
    qualityLabel: string
  }
  onTakeScreenshot: () => void
  onStartRecording: () => void
  onStopRecording: () => void
}

export function VideoPreviewPanel({
  isCameraActive,
  isRecording,
  cameraStream,
  recordingInfo,
  onTakeScreenshot,
  onStartRecording,
  onStopRecording
}: VideoPreviewPanelProps) {
  const t = useTranslations("CameraRecorderPage.VideoPreview")

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
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
                {t("status.recording")} {recordingInfo.formattedDuration}
              </span>
            </>
          )}
          {!isRecording && (
            <>
              <div
                className={`h-2 w-2 rounded-full ${isCameraActive ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-500"}`}
              ></div>
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                {isCameraActive ? t("status.live") : t("status.off")}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          {isCameraActive ? (
            <VideoPreview stream={cameraStream} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
                <p className="text-lg">{t("placeholder.title")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("placeholder.subtitle")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        {isCameraActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex justify-center gap-2"
          >
            <Button
              onClick={onTakeScreenshot}
              variant="outline"
              className="border-border"
              disabled={!isCameraActive}
            >
              <Image className="mr-2 h-4 w-4" />
              {t("controls.screenshot")}
            </Button>

            {!isRecording ? (
              <ShimmerButton
                onClick={onStartRecording}
                disabled={!isCameraActive}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="mr-2 h-4 w-4" />
                {t("controls.startRecording")}
              </ShimmerButton>
            ) : (
              <Button onClick={onStopRecording} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                {t("controls.stopRecording")}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
