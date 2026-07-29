"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

interface Camera {
  deviceId: string
  label: string
}

interface StatusPanelProps {
  isCameraActive: boolean
  isRecording: boolean
  status: string
  videoInfo?: {
    width: number
    height: number
    frameRate: number
  }
  recordingInfo: {
    duration: number
    formattedDuration: string
    qualityLabel: string
  }
  selectedCamera: string
  cameras: Camera[]
}

export function StatusPanel({
  isCameraActive,
  isRecording,
  status,
  videoInfo,
  recordingInfo,
  selectedCamera,
  cameras
}: StatusPanelProps) {
  const t = useTranslations("CameraRecorderPage.StatusPanel")

  const formatRecordingStatus = (status: string) => {
    switch (status) {
      case "recording":
        return t("status.recording")
      case "stopping":
        return t("status.stopping")
      case "stopped":
        return t("status.stopped")
      case "idle":
        return t("status.idle")
      case "acquiring_media":
        return t("status.acquiring_media")
      default:
        return status
    }
  }

  if (!isCameraActive) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 rounded-lg border border-border bg-muted/50 p-4 backdrop-blur-sm transition-all hover:border-zinc-400 hover:bg-muted/70 dark:hover:border-zinc-600"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`h-3 w-3 flex-shrink-0 rounded-full ${isRecording ? "animate-pulse bg-red-500" : "bg-green-500"}`}
          ></div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-muted-foreground">
              {t("status.label")}
            </div>
            <div className="text-sm text-foreground">
              {formatRecordingStatus(status)}
            </div>
          </div>
        </div>

        {videoInfo && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-3 w-3 flex-shrink-0 rounded-full bg-blue-500"></div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                {t("quality.label")}
              </div>
              <div className="text-sm text-foreground">
                {videoInfo.width}×{videoInfo.height} @ {videoInfo.frameRate}fps
              </div>
            </div>
          </div>
        )}

        {isRecording && recordingInfo.duration > 0 && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-3 w-3 flex-shrink-0 animate-pulse rounded-full bg-red-500"></div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                {t("duration.label")}
              </div>
              <div className="font-mono text-sm text-destructive">
                {recordingInfo.formattedDuration}
              </div>
            </div>
          </div>
        )}

        {!isRecording && selectedCamera && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-3 w-3 flex-shrink-0 rounded-full bg-purple-500"></div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                {t("camera.label")}
              </div>
              <div
                className="truncate text-sm text-foreground"
                title={
                  cameras.find((c) => c.deviceId === selectedCamera)?.label ||
                  t("camera.selected")
                }
              >
                {cameras.find((c) => c.deviceId === selectedCamera)?.label ||
                  t("camera.selected")}
              </div>
            </div>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{t("recording.format")}</span>
            <span>
              {t("recording.quality")} {recordingInfo.qualityLabel}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
