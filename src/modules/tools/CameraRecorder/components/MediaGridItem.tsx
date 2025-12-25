"use client"

import { Download, Eye, Trash2, Video, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useState } from "react"

interface CapturedMedia {
  id: string
  type: "screenshot" | "video"
  url: string
  filename: string
  timestamp: Date
  duration?: number
  size?: number
}

interface MediaGridItemProps {
  media: CapturedMedia
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
}

export function MediaGridItem({
  media,
  onPreview,
  onDownload,
  onDelete
}: MediaGridItemProps) {
  const t = useTranslations("CameraRecorderPage.MediaPanel")
  const [imageError, setImageError] = useState(false)

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderThumbnail = () => {
    if (media.type === "screenshot") {
      if (imageError) {
        return (
          <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <ImageIcon className="h-8 w-8 text-zinc-400" />
          </div>
        )
      }

      return (
        <div className="relative h-full w-full">
          <Image
            src={media.url}
            alt="Screenshot thumbnail"
            fill
            className="rounded-lg object-cover"
            onError={() => setImageError(true)}
            unoptimized // For blob URLs
          />
        </div>
      )
    }

    // Video thumbnail
    return (
      <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <Video className="h-8 w-8 text-green-500" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden">
        {renderThumbnail()}
      </div>

      {/* Overlay with actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="sm"
          variant="secondary"
          onClick={onPreview}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onDownload}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Info */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="text-xs text-white">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              {media.type === "screenshot" ? (
                <ImageIcon className="h-3 w-3" />
              ) : (
                <Video className="h-3 w-3" />
              )}
              {media.type === "screenshot" ? t("screenshot") : t("video")}
            </span>
            <span>{formatFileSize(media.size)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
