"use client"

import { type RefObject, useCallback, useEffect, useRef, useState } from "react"

import { timestampedFilename } from "@/lib/utils/media"

import { MAX_CAPTURES } from "../constants"
import type { Snapshot } from "../types"

/**
 * Taking a still frame off the preview.
 *
 * Drawn from the `<video>` element to an offscreen canvas, which is the only
 * way to get a frame out of a stream without a server. Two details the version
 * this replaces got wrong:
 *
 * - **It sized the canvas from the video element's LAYOUT.** The frame was
 *   captured at whatever CSS had made the preview, so a 1080p camera in a
 *   600px-wide card produced a 600px screenshot. `videoWidth`/`videoHeight` are
 *   the frame's real dimensions and that is what is used here.
 * - **Object URLs were never revoked on unmount**, so every screenshot taken in
 *   a session stayed in memory for the lifetime of the tab.
 *
 * The mirror is honoured. A mirrored preview that saves an unmirrored file is
 * the single most common complaint about webcam tools — what you see is what
 * the file contains.
 */

export function useSnapshots(
  videoRef: RefObject<HTMLVideoElement | null>,
  mirrored: boolean
) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const snapshotsRef = useRef<Snapshot[]>([])
  snapshotsRef.current = snapshots

  const capture = useCallback(() => {
    const video = videoRef.current
    // `videoWidth` is 0 until the first frame has arrived; drawing then
    // produces a zero-sized canvas and `toBlob` yields null.
    if (!video?.videoWidth || !video.videoHeight) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext("2d")
    if (!context) return

    if (mirrored) {
      // Flip the drawing surface rather than the image afterwards: one
      // transform, no second copy of a 4K frame in memory.
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) return
      const at = new Date()
      const snapshot: Snapshot = {
        id: `${at.getTime()}-${blob.size}`,
        filename: timestampedFilename("kadr", "png", at),
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
        size: blob.size,
        at
      }

      setSnapshots((current) => {
        const next = [snapshot, ...current]
        for (const stale of next.slice(MAX_CAPTURES)) {
          URL.revokeObjectURL(stale.url)
        }
        return next.slice(0, MAX_CAPTURES)
      })
      // PNG, not JPEG: a screenshot of a UI or a QR code on screen is exactly
      // the case where JPEG artefacts matter, and this is a developer tool.
    }, "image/png")
  }, [videoRef, mirrored])

  const remove = useCallback((id: string) => {
    setSnapshots((current) => {
      const target = current.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return current.filter((item) => item.id !== id)
    })
  }, [])

  const clear = useCallback(() => {
    setSnapshots((current) => {
      for (const item of current) URL.revokeObjectURL(item.url)
      return []
    })
  }, [])

  useEffect(() => {
    return () => {
      for (const item of snapshotsRef.current) URL.revokeObjectURL(item.url)
    }
  }, [])

  return { snapshots, capture, remove, clear }
}
