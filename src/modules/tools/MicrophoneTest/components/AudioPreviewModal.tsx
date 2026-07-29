"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Download, Pause, Play, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { RecordedAudio } from "../hooks/useMicrophoneTest"

interface AudioPreviewModalProps {
  audio: RecordedAudio | null
  onClose: () => void
}

export function AudioPreviewModal({ audio, onClose }: AudioPreviewModalProps) {
  const t = useTranslations("MicrophoneTestPage.AudioPreviewModal")
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
        !Number.isNaN(audioElement.duration) &&
        Number.isFinite(audioElement.duration)
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
        !Number.isNaN(audioElement.duration) &&
        Number.isFinite(audioElement.duration)
      ) {
        setDuration(audioElement.duration)
      }
    }

    // Add event listeners
    audioElement.addEventListener("timeupdate", updateTime)
    audioElement.addEventListener("loadedmetadata", updateDuration)
    audioElement.addEventListener("loadeddata", handleLoadedData)
    audioElement.addEventListener("ended", handleEnded)

    // Force load metadata
    audioElement.load()

    return () => {
      audioElement.removeEventListener("timeupdate", updateTime)
      audioElement.removeEventListener("loadedmetadata", updateDuration)
      audioElement.removeEventListener("loadeddata", handleLoadedData)
      audioElement.removeEventListener("ended", handleEnded)
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
    } catch (_error) {
      setIsPlaying(false)
    }
  }

  // Keyboard equivalent of clicking the scrub bar. A progress bar you can seek
  // with is a slider, so it needs arrow/Home/End support and slider ARIA — not
  // just an onClick, which leaves it unreachable without a mouse.
  const seekTo = (time: number) => {
    if (!audioRef.current || !duration || duration <= 0) return
    const clamped = Math.max(0, Math.min(time, duration))
    try {
      audioRef.current.currentTime = clamped
      setCurrentTime(clamped)
    } catch {
      // seeking can throw while metadata is still loading; ignore
    }
  }

  const handleSeekKeys = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!duration || duration <= 0) return
    const step = duration / 20
    const map: Record<string, number> = {
      ArrowRight: currentTime + step,
      ArrowUp: currentTime + step,
      ArrowLeft: currentTime - step,
      ArrowDown: currentTime - step,
      Home: 0,
      End: duration
    }
    if (!(e.key in map)) return
    e.preventDefault()
    seekTo(map[e.key])
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || duration <= 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = Math.max(
      0,
      Math.min((clickX / rect.width) * duration, duration)
    )

    try {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    } catch (_error) {
      // Silently handle seek errors
    }
  }

  const formatTime = (time: number) => {
    if (!time || !Number.isFinite(time) || Number.isNaN(time)) return "0:00"

    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownload = () => {
    if (!audio) return

    const a = document.createElement("a")
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
          className="relative w-full max-w-md overflow-hidden rounded-xl bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t("title")}
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
          <div className="p-6">
            {/* Audio Info */}
            <div className="mb-6 text-center">
              <h4 className="text-lg font-medium text-foreground">
                {audio.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {audio.format} • {Math.round(audio.size / 1024)} KB
              </p>
            </div>

            {/* Audio Controls */}
            <div className="space-y-4">
              {/* Play/Pause Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className="h-16 w-16 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label={t("seek")}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration || 0)}
                  aria-valuenow={Math.round(currentTime || 0)}
                  className="focus-visible:ring-ring relative h-2 cursor-pointer rounded-full bg-zinc-200 focus-visible:ring-2 focus-visible:outline-none dark:bg-zinc-700"
                  onClick={handleSeek}
                  onKeyDown={handleSeekKeys}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-blue-500"
                    style={{
                      width:
                        duration && duration > 0 && Number.isFinite(duration)
                          ? `${Math.min((currentTime / duration) * 100, 100)}%`
                          : "0%"
                    }}
                  />
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Hidden Audio Element */}
            {audio && (
              // biome-ignore lint/a11y/useMediaCaption: plays audio the user just recorded in the browser; no caption track can exist for content created milliseconds ago.
              <audio
                key={audio.id}
                ref={audioRef}
                src={audio.url}
                preload="auto"
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
