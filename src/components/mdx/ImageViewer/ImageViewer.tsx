"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"
import Zoom from "react-medium-image-zoom"
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

/**
 * A book figure, click-to-zoom.
 *
 * ── Why this is `react-medium-image-zoom` and not `medium-zoom` ──────────────
 * `medium-zoom` was last published in **November 2023** and is driven
 * imperatively: `mediumZoom(el)` on mount, `zoom.detach()` on unmount. That
 * shape produced the bug this replaced — `detach()` does **not** close an open
 * zoom, so unmounting while zoomed (a client navigation, an HMR update) left a
 * full-screen `z-index: 9999` overlay orphaned in the DOM with no way to
 * dismiss it. Reported on mobile, reproducible on desktop.
 *
 * The replacement is a React component, so there is no attach/detach pair to
 * get wrong: unmounting takes the zoom with it. It is maintained (June 2026),
 * has **zero runtime dependencies**, and lists React 19 in its peers.
 *
 * It is also better on the merits: it renders into a native `<dialog>`, which
 * brings Escape, a real focus trap, top-layer stacking and inertness for free —
 * all things the old `<div>` overlay faked or skipped — plus swipe-to-dismiss
 * on touch, which is what a phone reader reaches for first.
 *
 * Rejected alternatives, for the record: `framer-motion`'s `layoutId` gives the
 * same animation for no new dependency, but framer-motion is **not currently in
 * the book route's bundle**, so 226 chapters would start paying ~40 KB for 94
 * figures. The View Transitions API is Baseline now and the repo already uses
 * it in `ThemeToggle`, but it only animates BETWEEN two states — the dialog
 * semantics above would still have to be hand-written and hand-tested.
 *
 * `wrapElement="span"`: MDX renders `![alt](src)` inside a `<p>`, and a `<div>`
 * inside a `<p>` is invalid HTML that the browser silently reparents — which
 * shows up later as a hydration mismatch, not as a layout bug.
 */
export default function ImageViewer({
  src,
  alt,
  width,
  height
}: ImageViewerProps) {
  const t = useTranslations("Common")
  const imgRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  // A figure served from cache paints before React attaches `onLoad`, so the
  // event never fires and the skeleton would sit there forever over a picture
  // that is already on screen. `complete` is the synchronous truth.
  const onMount = (node: HTMLImageElement | null) => {
    imgRef.current = node
    if (node?.complete) setLoaded(true)
  }

  return (
    <span className="relative block w-full overflow-hidden rounded-lg shadow-lg">
      {/* The loading state the figures never had.
          The box was already the right SIZE — `getPublicImageSize` measures the
          file on the server, so layout has been stable (CLS 0) — but until the
          bytes arrived it was an empty hole in the prose. On a slow connection
          that is most of the reading experience: `public/` holds 26 MB of
          figures and one chapter alone pulls 1,549 KB of PNG.

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
      <Zoom
        wrapElement="span"
        canSwipeToUnzoom
        zoomMargin={24}
        a11yNameButtonZoom={t("zoomIn")}
        a11yNameButtonUnzoom={t("zoomOut")}
        classDialog="webiston-zoom"
      >
        <Image
          ref={onMount}
          src={src}
          alt={alt || ""}
          width={width ?? UNKNOWN}
          height={height ?? UNKNOWN}
          sizes="100vw"
          onLoad={() => setLoaded(true)}
          // A figure that 404s must not leave a shimmer running forever.
          onError={() => setLoaded(true)}
          className={cn(
            "!m-0 !mb-2 h-auto w-full rounded-lg",
            "transition-opacity duration-500 ease-out",
            loaded ? "opacity-100" : "opacity-0"
          )}
          style={{ width: "100%", height: "auto" }}
          priority={false}
        />
      </Zoom>
    </span>
  )
}
