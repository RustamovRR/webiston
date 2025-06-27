'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Download, Trash2, Volume2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RecordedAudio {
  id: string
  name: string
  url: string
  blob: Blob
  duration: number
  timestamp: Date
  size: number
  format: string
}

interface AudioGridItemProps {
  audio: RecordedAudio
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
}

export function AudioGridItem({ audio, onPreview, onDownload, onDelete }: AudioGridItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const handlePlayPause = () => {
    if (!audioElement) {
      const newAudio = new Audio(audio.url)
      newAudio.onended = () => setIsPlaying(false)
      newAudio.onplay = () => setIsPlaying(true)
      newAudio.onpause = () => setIsPlaying(false)
      setAudioElement(newAudio)
      newAudio.play()
    } else {
      if (isPlaying) {
        audioElement.pause()
      } else {
        audioElement.play()
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm transition-all hover:border-zinc-600 hover:bg-zinc-800/70"
    >
      {/* Audio Info Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
            <Volume2 className="h-5 w-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-medium text-zinc-200" title={audio.name}>
              {audio.name.replace('.webm', '')}
            </h4>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(audio.duration)}</span>
              <span>•</span>
              <span>{formatFileSize(audio.size)}</span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-3 text-xs text-zinc-500">
          {audio.timestamp.toLocaleDateString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* Audio Waveform Visualization (Static) */}
      <div className="px-4 pb-4">
        <div className="flex h-8 items-end justify-center gap-1 rounded bg-zinc-900/50 px-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={`w-1 rounded-sm transition-all duration-200 ${
                isPlaying ? 'bg-gradient-to-t from-blue-500 to-cyan-400' : 'bg-gradient-to-t from-zinc-600 to-zinc-500'
              }`}
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-zinc-700/50 bg-zinc-800/30 p-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-green-400"
              title="Yuklab olish"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
              title="O'chirish"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Format badge */}
      <div className="absolute top-2 right-2">
        <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">{audio.format}</span>
      </div>

      {/* Playing indicator */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 rounded-lg border-2 border-blue-500/50"
        />
      )}
    </motion.div>
  )
}
