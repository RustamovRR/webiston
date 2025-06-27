'use client'

import { Image, Video, Eye, Download, Trash2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { CapturedMedia } from '@/hooks/tools/useCameraRecorder'

interface MediaGridItemProps {
  media: CapturedMedia
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
}

export const MediaGridItem = ({ media, onPreview, onDownload, onDelete }: MediaGridItemProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')

  useEffect(() => {
    if (media.type === 'screenshot') {
      setThumbnailUrl(media.url)
    } else if (media.type === 'video') {
      // Create video thumbnail
      const video = document.createElement('video')
      video.src = media.url
      video.crossOrigin = 'anonymous'
      video.currentTime = 1 // Capture frame at 1 second

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7)
          setThumbnailUrl(thumbnailDataUrl)
        }
      }
    }
  }, [media])

  const renderThumbnail = () => {
    if (media.type === 'screenshot') {
      return thumbnailUrl ? (
        <img src={thumbnailUrl} alt="Screenshot thumbnail" className="h-full w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Image className="h-8 w-8 text-blue-400" />
        </div>
      )
    }

    // Video thumbnail
    return (
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-zinc-800">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Video thumbnail" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Video className="h-8 w-8 text-zinc-400" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="h-6 w-6 text-white" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="group relative aspect-square rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 backdrop-blur-sm transition-all duration-200 hover:border-zinc-600"
    >
      {/* Thumbnail */}
      <div className="h-full w-full overflow-hidden rounded-md">{renderThumbnail()}</div>

      {/* Overlay with actions */}
      <div className="absolute inset-0 flex flex-col justify-between rounded-lg bg-black/60 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {/* File info */}
        <div className="text-white">
          <div className="mb-1 flex items-center gap-1">
            {media.type === 'screenshot' ? (
              <Image className="h-3 w-3 text-blue-400" />
            ) : (
              <Video className="h-3 w-3 text-green-400" />
            )}
            <span className="truncate text-xs font-medium">{media.type}</span>
          </div>
          <p className="truncate text-xs text-zinc-300">{media.filename}</p>
          <p className="text-xs text-zinc-400">{media.timestamp.toLocaleTimeString('uz-UZ')}</p>
          {media.size && <p className="text-xs text-zinc-400">{(media.size / 1024 / 1024).toFixed(1)} MB</p>}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white hover:bg-blue-400/20 hover:text-blue-400"
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white hover:bg-green-400/20 hover:text-green-400"
            onClick={(e) => {
              e.stopPropagation()
              onDownload()
            }}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white hover:bg-red-400/20 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
