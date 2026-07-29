"use client"

import mediumZoom from "medium-zoom"
import Image from "next/image"
import { useEffect, useRef } from "react"

interface ImageViewerProps {
  src: string
  alt: string
  /** Intrinsic pixel size, measured on the server by `getPublicImageSize`.
   *  Absent for remote or unreadable images — then we fall back to the old
   *  no-reservation behaviour rather than inventing a ratio. */
  width?: number
  height?: number
}

// Fallback only. Real dimensions arrive as props; `width={0} height={0}` with
// `sizes="100vw"` is Next's escape hatch for "unknown intrinsic size", and it
// reserves NO aspect ratio — which is why every book figure used to shift the
// page as it decoded.
const UNKNOWN = 0

export default function ImageViewer({
  src,
  alt,
  width,
  height
}: ImageViewerProps) {
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
        width={width ?? UNKNOWN}
        height={height ?? UNKNOWN}
        sizes="100vw"
        className="!m-0 !mb-2 h-auto w-full cursor-zoom-in rounded-lg"
        style={{ width: "100%", height: "auto" }}
        priority={false}
      />
    </span>
  )
}
