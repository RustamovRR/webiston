'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AudioVisualizerProps {
  audioStats: {
    level: number
    peak: number
    rms: number
    frequency: Uint8Array
    waveform: Uint8Array
  }
  isActive: boolean
  width?: number
  height?: number
  className?: string
}

export function AudioVisualizer({
  audioStats,
  isActive,
  width = 800,
  height = 200,
  className = '',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      if (!ctx || !isActive) return

      // Clear canvas with dark background
      ctx.fillStyle = '#0f172a' // zinc-900
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw waveform
      if (audioStats.waveform.length > 0) {
        drawWaveform(ctx, canvas, audioStats.waveform, audioStats.level)
      }

      // Draw frequency bars (equalizer)
      if (audioStats.frequency.length > 0) {
        drawFrequencyBars(ctx, canvas, audioStats.frequency)
      }

      // Draw level indicator
      drawLevelIndicator(ctx, canvas, audioStats.level, audioStats.peak)

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioStats, isActive])

  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    waveform: Uint8Array,
    level: number,
  ) => {
    ctx.lineWidth = 2
    ctx.strokeStyle = level > 30 ? '#10b981' : level > 10 ? '#f59e0b' : '#64748b'
    ctx.beginPath()

    const sliceWidth = canvas.width / waveform.length
    let x = 0

    for (let i = 0; i < waveform.length; i++) {
      const v = waveform[i] / 128.0
      const y = (v * canvas.height) / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.stroke()
  }

  const drawFrequencyBars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frequency: Uint8Array) => {
    const barCount = 32 // Show fewer bars for cleaner look
    const barWidth = canvas.width / barCount
    const dataStep = Math.floor(frequency.length / barCount)

    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * dataStep
      const barHeight = (frequency[dataIndex] / 255) * (canvas.height * 0.4)
      const x = i * barWidth

      // Create gradient for bars
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)

      if (frequency[dataIndex] > 150) {
        gradient.addColorStop(0, '#ef4444') // red-500
        gradient.addColorStop(0.5, '#f59e0b') // amber-500
        gradient.addColorStop(1, '#10b981') // green-500
      } else if (frequency[dataIndex] > 80) {
        gradient.addColorStop(0, '#f59e0b') // amber-500
        gradient.addColorStop(1, '#10b981') // green-500
      } else if (frequency[dataIndex] > 30) {
        gradient.addColorStop(0, '#10b981') // green-500
        gradient.addColorStop(1, '#3b82f6') // blue-500
      } else {
        gradient.addColorStop(0, '#64748b') // slate-500
        gradient.addColorStop(1, '#475569') // slate-600
      }

      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight)
    }
  }

  const drawLevelIndicator = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    level: number,
    peak: number,
  ) => {
    const indicatorHeight = 8
    const margin = 20
    const y = canvas.height - indicatorHeight - 10

    // Background
    ctx.fillStyle = '#374151' // gray-700
    ctx.fillRect(margin, y, canvas.width - margin * 2, indicatorHeight)

    // Level bar
    const levelWidth = ((canvas.width - margin * 2) * level) / 100
    const levelGradient = ctx.createLinearGradient(margin, 0, margin + levelWidth, 0)

    if (level > 70) {
      levelGradient.addColorStop(0, '#10b981') // green-500
      levelGradient.addColorStop(0.7, '#f59e0b') // amber-500
      levelGradient.addColorStop(1, '#ef4444') // red-500
    } else if (level > 40) {
      levelGradient.addColorStop(0, '#10b981') // green-500
      levelGradient.addColorStop(1, '#f59e0b') // amber-500
    } else {
      levelGradient.addColorStop(0, '#10b981') // green-500
      levelGradient.addColorStop(1, '#3b82f6') // blue-500
    }

    ctx.fillStyle = levelGradient
    ctx.fillRect(margin, y, levelWidth, indicatorHeight)

    // Peak indicator
    if (peak > 0) {
      const peakX = margin + ((canvas.width - margin * 2) * peak) / 100
      ctx.fillStyle = peak > 80 ? '#ef4444' : '#f59e0b'
      ctx.fillRect(peakX - 1, y - 2, 2, indicatorHeight + 4)
    }

    // Level text
    ctx.fillStyle = '#e2e8f0' // slate-200
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(level)}%`, canvas.width - margin, y - 5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 ${className}`}
    >
      <canvas ref={canvasRef} width={width} height={height} className="h-full w-full" />

      {/* Overlay with audio level info */}
      <div className="absolute top-4 left-4 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                audioStats.level > 30 ? 'bg-green-400' : audioStats.level > 10 ? 'bg-yellow-400' : 'bg-red-400'
              } ${isActive ? 'animate-pulse' : ''}`}
            />
            <span className="text-zinc-200">{Math.round(audioStats.level)}%</span>
          </div>

          <div className="h-4 w-px bg-zinc-600" />

          <div className="text-zinc-400">Peak: {Math.round(audioStats.peak)}%</div>
        </div>
      </div>

      {/* Recording indicator */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
          <div className="text-center text-zinc-500">
            <div className="mb-2 text-4xl">🎤</div>
            <p>Mikrofonni yoqing</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
