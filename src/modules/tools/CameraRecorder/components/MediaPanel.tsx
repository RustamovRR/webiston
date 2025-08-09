'use client'

import { Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { MediaGridItem } from './MediaGridItem'

interface CapturedMedia {
  id: string
  type: 'screenshot' | 'video'
  url: string
  filename: string
  timestamp: Date
  duration?: number
  size?: number
}

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

export function MediaPanel({ capturedMedia, cameraStats, onPreview, onDownload, onDelete }: MediaPanelProps) {
  const t = useTranslations('CameraRecorderPage.MediaPanel')

  return (
    <div className="flex h-[600px] max-h-[600px] flex-col rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {capturedMedia.length} {t('fileCount')}
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
                className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400"
              >
                <div className="text-center">
                  <Clock className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p className="text-lg font-medium">{t('empty.title')}</p>
                  <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{t('empty.subtitle')}</p>
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
          className="mt-4 rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/50"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">{t('stats.screenshots')}</span>
              <span className="ml-2 text-blue-600 dark:text-blue-400">{cameraStats.screenshotCount}</span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">{t('stats.videos')}</span>
              <span className="ml-2 text-green-600 dark:text-green-400">{cameraStats.videoCount}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
