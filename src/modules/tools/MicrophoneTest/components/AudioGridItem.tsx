'use client'

import { Play, Download, Trash2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { RecordedAudio } from '../hooks/useMicrophoneTest'

interface AudioGridItemProps {
  audio: RecordedAudio
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
}

export function AudioGridItem({ audio, onPreview, onDownload, onDelete }: AudioGridItemProps) {
  const t = useTranslations('MicrophoneTestPage.RecordedAudioPanel')

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
    >
      {/* Audio Info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
            <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{audio.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDuration(audio.duration)} • {formatFileSize(audio.size)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPreview}
            className="flex-1 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
          >
            <Play className="mr-1 h-3 w-3" />
            {t('actions.preview')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDownload}
            className="border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Format badge */}
      <div className="absolute top-2 right-2">
        <span className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
          {audio.format}
        </span>
      </div>
    </motion.div>
  )
}
