'use client'

import { X, Download, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { RecordedAudio } from '../hooks/useMicrophoneTest'

interface AudioPreviewModalProps {
  audio: RecordedAudio | null
  onClose: () => void
}

export function AudioPreviewModal({ audio, onClose }: AudioPreviewModalProps) {
  const t = useTranslations('MicrophoneTestPage.AudioPreviewModal')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!audio) {
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
    }
  }, [audio])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement || !audio) return

    // Reset states when audio changes
    setCurrentTime(0)
    setIsPlaying(false)

    // Use recorded duration from audio object if available, otherwise try to get from element
    if (audio.duration && audio.duration > 0) {
      setDuration(audio.duration)
    } else {
      setDuration(0)
    }

    const updateTime = () => {
      setCurrentTime(audioElement.currentTime)
    }

    const updateDuration = () => {
      // Only update if we don't have duration from recording and element has valid duration
      if (
        !audio.duration &&
        audioElement.duration &&
        !isNaN(audioElement.duration) &&
        isFinite(audioElement.duration)
      ) {
        setDuration(audioElement.duration)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleLoadedData = () => {
      // Only update if we don't have duration from recording
      if (
        !audio.duration &&
        audioElement.duration &&
        !isNaN(audioElement.duration) &&
        isFinite(audioElement.duration)
      ) {
        setDuration(audioElement.duration)
      }
    }

    // Add event listeners
    audioElement.addEventListener('timeupdate', updateTime)
    audioElement.addEventListener('loadedmetadata', updateDuration)
    audioElement.addEventListener('loadeddata', handleLoadedData)
    audioElement.addEventListener('ended', handleEnded)

    // Force load metadata
    audioElement.load()

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime)
      audioElement.removeEventListener('loadedmetadata', updateDuration)
      audioElement.removeEventListener('loadeddata', handleLoadedData)
      audioElement.removeEventListener('ended', handleEnded)
    }
  }, [audio])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || duration <= 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = Math.max(0, Math.min((clickX / rect.width) * duration, duration))

    try {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    } catch (error) {
      // Silently handle seek errors
    }
  }

  const formatTime = (time: number) => {
    if (!time || !isFinite(time) || isNaN(time)) return '0:00'

    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    if (!audio) return

    const a = document.createElement('a')
    a.href = audio.url
    a.download = audio.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!audio) return null

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
          className="relative w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('title')}</h3>
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
          <div className="p-6">
            {/* Audio Info */}
            <div className="mb-6 text-center">
              <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{audio.name}</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {audio.format} • {Math.round(audio.size / 1024)} KB
              </p>
            </div>

            {/* Audio Controls */}
            <div className="space-y-4">
              {/* Play/Pause Button */}
              <div className="flex justify-center">
                <Button size="lg" onClick={togglePlay} className="h-16 w-16 rounded-full">
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div
                  className="relative h-2 cursor-pointer rounded-full bg-zinc-200 dark:bg-zinc-700"
                  onClick={handleSeek}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-blue-500"
                    style={{
                      width:
                        duration && duration > 0 && isFinite(duration)
                          ? `${Math.min((currentTime / duration) * 100, 100)}%`
                          : '0%',
                    }}
                  />
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Hidden Audio Element */}
            {audio && <audio key={audio.id} ref={audioRef} src={audio.url} preload="auto" />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
