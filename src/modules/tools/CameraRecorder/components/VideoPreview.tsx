'use client'

import { Camera } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface VideoPreviewProps {
  stream: MediaStream | null
}

export const VideoPreview = ({ stream }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(console.error)
    }
  }, [stream])

  if (!stream) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        <div className="text-center">
          <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
          <p className="text-lg">Kamerani yoqish uchun yuqoridagi tugmani bosing</p>
          <p className="mt-2 text-sm text-zinc-500">Avval ruxsat berishingiz kerak</p>
        </div>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className="h-full w-full rounded-lg object-cover"
      autoPlay
      muted
      playsInline
      controls={false}
    />
  )
}
