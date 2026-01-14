"use client"

import { useEffect, useRef, useState } from "react"

interface VideoEmbedProps {
  url: string
  title?: string
}

export default function VideoEmbed({ url, title = "Video" }: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Determine if it's a YouTube video
  const isYouTube = url.includes("youtu.be") || url.includes("youtube.com")

  let youtubeId = ""
  if (isYouTube) {
    if (url.includes("youtu.be/")) {
      youtubeId = url.split("youtu.be/")[1]?.split("?")[0]
    } else if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url)
      youtubeId = urlObj.searchParams.get("v") || ""
    } else if (url.includes("youtube.com/embed/")) {
      youtubeId = url.split("youtube.com/embed/")[1]?.split("?")[0]
    }
  }

  // Loading and error handlers for regular videos
  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      const video = videoRef.current

      const handleLoaded = () => setIsLoading(false)
      const handleError = () => {
        console.error("Video failed to load:", url)
        setError(true)
        setIsLoading(false)
      }

      video.addEventListener("loadeddata", handleLoaded)
      video.addEventListener("error", handleError)

      return () => {
        video.removeEventListener("loadeddata", handleLoaded)
        video.removeEventListener("error", handleError)
      }
    }
  }, [isYouTube, url])

  // If error occurred
  if (error) {
    return (
      <div className="relative my-6 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-gray-800 text-white">
        <div className="p-4 text-center">
          <p className="font-medium">Videoni yuklab bo‘lmadi</p>
          <p className="mt-2 text-sm text-gray-300">{url}</p>
        </div>
      </div>
    )
  }

  // YouTube videos
  if (isYouTube && youtubeId) {
    return (
      <div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    )
  }

  // Direct video files
  return (
    <div className="relative -mt-6 mb-12 aspect-video w-full rounded-lg shadow-lg">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
      <video
        ref={videoRef}
        src={url}
        controls
        preload="metadata"
        className="absolute inset-0 h-full w-full"
        controlsList="nodownload"
        playsInline
        onLoadedData={() => setIsLoading(false)}
        onError={() => setError(true)}
      >
        {title}
      </video>
    </div>
  )
}
