"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import mediumZoom from "medium-zoom"

interface ImageViewerProps {
  src: string
  alt: string
}

export default function ImageViewer({ src, alt }: ImageViewerProps) {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current) {
      const zoom = mediumZoom(imgRef.current, {
        background: "rgba(0, 0, 0, 0.9)",
        margin: 24
      })

      return () => {
        zoom.detach()
      }
    }
  }, [])

  return (
    <span className="relative block w-full overflow-hidden rounded-lg shadow-lg">
      <Image
        ref={imgRef}
        src={src}
        alt={alt || ""}
        width={0}
        height={0}
        sizes="100vw"
        className="!m-0 !mb-2 h-auto w-full cursor-zoom-in rounded-lg"
        style={{ width: "100%", height: "auto" }}
        priority={false}
      />
    </span>
  )
}
