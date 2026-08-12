"use client"

import type { RefObject } from "react"

interface SnapshotPreviewProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** Layout size in CSS pixels. Zero until the first paint. */
  width: number
  height: number
  /** Read to assistive tech in place of the pixels. */
  label: string
}

/**
 * The preview, which is the export.
 *
 * **`aspect-ratio`, never an inline `height`.** The first version set
 * `style={{ width, height }}`, and an inline declaration beats a class — so
 * `h-auto` never applied, `max-w-full` clamped the width on its own, and the
 * height stayed put. Measured on a 100-character line in the default layout:
 * the picture rendered **31.5% narrower than its own aspect ratio**, which
 * means the preview was not what the export would be. That is the one promise
 * this tool makes.
 *
 * With the ratio declared instead, a picture too wide for the column shrinks
 * whole. The browser's downscale is preview-only; the exported bitmap is
 * always painted at full size.
 *
 * The box scrolls in its own right rather than growing the page: 300 lines
 * made the document 11.2 screens tall, and — worse — left the sticky card
 * taller than the viewport, which defeats sticky entirely and scrolls the
 * download button off the screen.
 */
export function SnapshotPreview({
  canvasRef,
  width,
  height,
  label
}: SnapshotPreviewProps) {
  return (
    <div className="flex max-h-[calc(100dvh-14rem)] min-h-[320px] items-center justify-center overflow-auto rounded-lg border border-border bg-muted/30 p-4">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        style={
          width > 0 && height > 0
            ? { width, aspectRatio: `${width} / ${height}` }
            : undefined
        }
        className="h-auto max-w-full shrink-0"
      />
    </div>
  )
}
