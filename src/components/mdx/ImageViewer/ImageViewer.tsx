"use client"

import mediumZoom from "medium-zoom"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib"

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
  const [loaded, setLoaded] = useState(false)

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

  // A figure served from cache paints before React attaches `onLoad`, so the
  // event never fires and the skeleton would sit there forever over a picture
  // that is already on screen. `complete` is the synchronous truth.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  return (
    <span className="relative block w-full overflow-hidden rounded-lg shadow-lg">
      {/* The loading state the figures never had.
          The box was already the right SIZE — `getPublicImageSize` measures the
          file on the server, so layout has been stable (CLS 0) — but until the
          bytes arrived it was an empty hole in the prose. On a slow connection
          that is most of the reading experience: `public/` holds 26 MB of
          figures and one chapter alone pulls 1,549 KB of PNG.

          This is a CSS skeleton, deliberately, NOT `placeholder="blur"`.
          `next/image` THROWS for a string `src` with `placeholder="blur"` and
          no `blurDataURL` (verified in `get-img-props.js`), and generating 106
          real LQIPs needs `sharp` plus a build step — worth doing, but it is a
          decision with a dependency attached, so it is in the roadmap rather
          than smuggled in here. This costs zero bytes and zero dependencies.

          `aria-hidden` + `pointer-events-none`: it is decoration sitting on top
          of the real image, and it must never intercept the zoom click. */}
      {!loaded && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block rounded-lg bg-muted"
        >
          <span className="animate-shimmer block h-full w-full bg-[length:200%_100%] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        </span>
      )}
      <Image
        ref={imgRef}
        src={src}
        alt={alt || ""}
        width={width ?? UNKNOWN}
        height={height ?? UNKNOWN}
        sizes="100vw"
        onLoad={() => setLoaded(true)}
        // A figure that 404s must not leave a shimmer running forever.
        onError={() => setLoaded(true)}
        className={cn(
          "!m-0 !mb-2 h-auto w-full cursor-zoom-in rounded-lg",
          "transition-opacity duration-500 ease-out",
          loaded ? "opacity-100" : "opacity-0"
        )}
        style={{ width: "100%", height: "auto" }}
        priority={false}
      />
    </span>
  )
}
