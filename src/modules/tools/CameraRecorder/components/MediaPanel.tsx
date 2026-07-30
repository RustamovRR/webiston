"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import type { CapturedMedia } from "../hooks/useCameraRecorder"
import { MediaGridItem } from "./MediaGridItem"

interface CameraStats {
  screenshotCount: number
  videoCount: number
}

interface MediaPanelProps {
  capturedMedia: CapturedMedia[]
  cameraStats: CameraStats
  onPreview: (media: CapturedMedia) => void
  onDownload: (media: CapturedMedia) => void
  onDelete: (id: string) => void
}

export function MediaPanel({
  capturedMedia,
  cameraStats,
  onPreview,
  onDownload,
  onDelete
}: MediaPanelProps) {
  const t = useTranslations("CameraRecorderPage.MediaPanel")

  return (
    <div className="flex h-[600px] max-h-[600px] flex-col rounded-xl border border-border bg-card/80 backdrop-blur-sm">
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
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {capturedMedia.length} {t("fileCount")}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="max-h-[450px] flex-1 overflow-y-auto pr-2">
          <AnimatePresence>
            {capturedMedia.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-64 items-center justify-center text-muted-foreground"
              >
                <div className="text-center">
                  <Clock className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p className="text-lg font-medium">{t("empty.title")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("empty.subtitle")}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {capturedMedia.map((media) => (
                  <MediaGridItem
                    key={media.id}
                    media={media}
                    onPreview={() => onPreview(media)}
                    onDownload={() => onDownload(media)}
                    onDelete={() => onDelete(media.id)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats - Always at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg bg-muted/50 p-3"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">
                {t("stats.screenshots")}
              </span>
              <span className="ml-2 text-info">
                {cameraStats.screenshotCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("stats.videos")}</span>
              <span className="ml-2 text-success">
                {cameraStats.videoCount}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
