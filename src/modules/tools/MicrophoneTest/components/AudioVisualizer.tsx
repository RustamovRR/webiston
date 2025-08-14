'use client'

import { useEffect, useRef } from 'react'
import { AudioStats } from '@/hooks/tools/useMicrophoneTest'

interface AudioVisualizerProps {
  audioStats: AudioStats
  isActive: boolean
  width?: number
  height?: number
  className?: string
}

export function AudioVisualizer({
  audioStats,
  isActive,
  width = 500,
  height = 200,
  className = '',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (!isActive || audioStats.frequency.length === 0) {
      // Draw inactive state
      ctx.fillStyle = 'rgb(63, 63, 70)' // zinc-600
      ctx.fillRect(0, height - 2, width, 2)
      return
    }

    // Draw frequency bars
    const barWidth = width / audioStats.frequency.length
    const barMaxHeight = height - 20

    for (let i = 0; i < audioStats.frequency.length; i++) {
      const barHeight = (audioStats.frequency[i] / 255) * barMaxHeight
      const x = i * barWidth
      const y = height - barHeight

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0)
      gradient.addColorStop(0, 'rgb(34, 197, 94)') // green-500
      gradient.addColorStop(0.5, 'rgb(59, 130, 246)') // blue-500
      gradient.addColorStop(1, 'rgb(168, 85, 247)') // purple-500

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    }

    // Draw level indicator
    const levelWidth = (audioStats.level / 100) * width
    ctx.fillStyle = audioStats.level > 70 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)' // red-500 or green-500
    ctx.fillRect(0, height - 10, levelWidth, 4)
  }, [audioStats, isActive, width, height])

  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
    >
      <canvas ref={canvasRef} className="w-full rounded" style={{ maxWidth: '100%', height: 'auto' }} />

      {/* Audio level display */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Level: {Math.round(audioStats.level)}%</span>
        <span className="text-zinc-600 dark:text-zinc-400">Peak: {Math.round(audioStats.peak)}%</span>
      </div>
    </div>
  )
}
