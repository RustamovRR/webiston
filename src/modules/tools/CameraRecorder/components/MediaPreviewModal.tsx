"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Download, X } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface CapturedMedia {
  id: string
  type: "screenshot" | "video"
  url: string
  filename: string
  timestamp: Date
  duration?: number
  size?: number
}

interface MediaPreviewModalProps {
  media: CapturedMedia | null
  onClose: () => void
}

export function MediaPreviewModal({ media, onClose }: MediaPreviewModalProps) {
  const t = useTranslations("CameraRecorderPage.MediaPreviewModal")
  const [imageError, setImageError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)

  // Reset states when media changes
  useEffect(() => {
    if (media?.type === "video") {
      setVideoLoading(true)
      setVideoError(false)

      // Small delay to ensure video element is rendered
      const timer = setTimeout(() => {
        const videoElement = document.querySelector(
          `video[src="${media.url}"]`
        ) as HTMLVideoElement
        if (videoElement) {
          videoElement.load() // Force reload to reset state
          videoElement.currentTime = 0
        }
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [media])

  if (!media) return null

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = media.url
    link.download = media.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl bg-white dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {media.type === "screenshot"
                ? t("screenshotPreview")
                : t("videoPreview")}
            </h3>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {t("download")}
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {media.type === "screenshot" ? (
              imageError ? (
                <div className="flex h-64 w-96 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <p className="text-zinc-500">{t("failedToLoad")}</p>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={media.url}
                    alt="Screenshot preview"
                    width={800}
                    height={600}
                    className="max-h-[70vh] w-auto rounded-lg"
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                </div>
              )
            ) : (
              <div className="relative">
                {videoLoading && (
                  <div className="flex h-64 w-96 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      <p className="text-zinc-500">{t("loadingVideo")}</p>
                    </div>
                  </div>
                )}
                {videoError ? (
                  <div className="flex h-64 w-96 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <p className="text-zinc-500">{t("failedToLoadVideo")}</p>
                  </div>
                ) : (
                  <video
                    key={media.id} // Force re-render for each video
                    src={media.url}
                    controls
                    className={`max-h-[70vh] w-auto rounded-lg ${videoLoading ? "hidden" : "block"}`}
                    preload="metadata"
                    autoPlay={false}
                    muted={false}
                    onLoadedMetadata={(e) => {
                      const video = e.target as HTMLVideoElement
                      // Only set currentTime if it's not already at the beginning
                      if (video.currentTime !== 0) {
                        video.currentTime = 0
                      }
                      setVideoLoading(false)
                    }}
                    onCanPlayThrough={(e) => {
                      const video = e.target as HTMLVideoElement
                      // Ensure video is at the beginning when ready to play
                      if (video.currentTime !== 0) {
                        video.currentTime = 0
                      }
                    }}
                    onError={() => {
                      setVideoLoading(false)
                      setVideoError(true)
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
