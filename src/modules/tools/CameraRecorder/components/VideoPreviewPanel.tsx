'use client'

import { Camera, Image, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { VideoPreview } from './VideoPreview'

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
  onStopRecording,
}: VideoPreviewPanelProps) {
  const t = useTranslations('CameraRecorderPage.VideoPreview')

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
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
          {isRecording && (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs text-red-400">
                {t('status.recording')} {recordingInfo.formattedDuration}
              </span>
            </>
          )}
          {!isRecording && (
            <>
              <div
                className={`h-2 w-2 rounded-full ${isCameraActive ? 'bg-green-500' : 'bg-zinc-400 dark:bg-zinc-500'}`}
              ></div>
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                {isCameraActive ? t('status.live') : t('status.off')}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="aspect-video overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
          {isCameraActive ? (
            <VideoPreview stream={cameraStream} />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-500 dark:text-zinc-400">
              <div className="text-center">
                <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
                <p className="text-lg">{t('placeholder.title')}</p>
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{t('placeholder.subtitle')}</p>
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
              className="border-zinc-300 dark:border-zinc-700"
              disabled={!isCameraActive}
            >
              <Image className="mr-2 h-4 w-4" />
              {t('controls.screenshot')}
            </Button>

            {!isRecording ? (
              <ShimmerButton
                onClick={onStartRecording}
                disabled={!isCameraActive}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="mr-2 h-4 w-4" />
                {t('controls.startRecording')}
              </ShimmerButton>
            ) : (
              <Button onClick={onStopRecording} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                {t('controls.stopRecording')}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
