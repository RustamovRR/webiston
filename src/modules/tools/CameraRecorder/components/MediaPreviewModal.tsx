'use client'

import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface CapturedMedia {
  id: string
  type: 'screenshot' | 'video'
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
  const t = useTranslations('CameraRecorderPage.MediaPreviewModal')
  const [imageError, setImageError] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0)

  if (!media) return null

  const handleDownload = () => {
    const link = document.createElement('a')
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
              {media.type === 'screenshot' ? t('screenshotPreview') : t('videoPreview')}
            </h3>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {t('download')}
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {media.type === 'screenshot' ? (
              imageError ? (
                <div className="flex h-64 w-96 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <p className="text-zinc-500">{t('failedToLoad')}</p>
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
              <div className="space-y-2">
                <video
                  src={media.url}
                  controls
                  className="max-h-[70vh] w-auto rounded-lg"
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement
                    setVideoDuration(video.duration)
                    video.currentTime = 0.1 // Set to small value to show first frame
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement
                    setVideoCurrentTime(video.currentTime)
                  }}
                  onLoadedData={(e) => {
                    const video = e.target as HTMLVideoElement
                    setVideoDuration(video.duration)
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
