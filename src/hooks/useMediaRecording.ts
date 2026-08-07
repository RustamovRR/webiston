"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  fileExtensionFor,
  pickRecorderMimeType,
  timestampedFilename
} from "@/lib/utils/media"

/**
 * Recording a stream to a file the visitor can keep.
 *
 * Shared by the camera and microphone tools: the container differs, the
 * filename prefix differs, and nothing else does. Both had written their own,
 * and both had written the same bugs into it.
 *
 * - **The container was hardcoded.** The microphone tool asked for
 *   `audio/webm;codecs=opus`, which Safari does not support, so
 *   `new MediaRecorder(...)` threw and pressing record did nothing — no file,
 *   no error, no explanation. It is negotiated here against
 *   `isTypeSupported`, and a browser that likes none of the candidates gets the
 *   browser's own default rather than a crash.
 * - **Object URLs leaked.** They were revoked when a clip was deleted by hand
 *   and never on unmount, so leaving the page left every blob alive for as long
 *   as the tab was.
 * - **The duration was wall-clock.** A `setInterval` counter that kept running
 *   through a pause, so a clip reported the time it had existed rather than the
 *   time it contained.
 * - **The size came from an HTTP header.** The camera tool fetched its own
 *   `blob:` URL and read `content-length` off the response — which is usually
 *   absent, so most recordings reported no size at all. `blob.size` is the
 *   number, and it was there the whole time.
 */

export interface Recording {
  id: string
  filename: string
  url: string
  /** Seconds of captured material, excluding time spent paused. */
  duration: number
  size: number
  /** The container the browser actually wrote. */
  mimeType: string
  at: Date
}

interface UseMediaRecordingOptions {
  stream: MediaStream | null
  /** Container preferences, best first. */
  candidates: readonly string[]
  /** Leading word in the download filename. */
  prefix: string
  /**
   * How many clips to keep.
   *
   * Each one is a blob held in memory behind an object URL; without a cap a
   * long session grows quietly until the tab is killed. The oldest is REVOKED
   * as it falls off the end, not merely dropped.
   */
  max: number
}

export function useMediaRecording({
  stream,
  candidates,
  prefix,
  max
}: UseMediaRecordingOptions) {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  /** Milliseconds captured before the current pause began. */
  const committedRef = useRef(0)
  /** When the currently running segment started. */
  const segmentStartRef = useRef(0)
  const recordingsRef = useRef<Recording[]>([])
  recordingsRef.current = recordings
  /**
   * Whether this hook is still mounted.
   *
   * `onstop` fires asynchronously, and unmounting STOPS a running recorder —
   * so without this the handler builds a recording on the way out, mints an
   * object URL that no state will hold and no cleanup will revoke, and leaks a
   * blob with no owner for the lifetime of the tab.
   */
  const mounted = useRef(true)

  const mimeTypeRef = useRef<string | null | undefined>(undefined)
  if (mimeTypeRef.current === undefined) {
    mimeTypeRef.current = pickRecorderMimeType(candidates)
  }
  const mimeType = mimeTypeRef.current

  const canRecord =
    typeof MediaRecorder !== "undefined" && stream !== null && stream.active

  const start = useCallback(() => {
    if (!stream || recorderRef.current) return

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    } catch {
      // A browser that accepted the type from `isTypeSupported` and then
      // refused it in the constructor is rare but real; its own default is
      // always something it can write.
      recorder = new MediaRecorder(stream)
    }

    chunksRef.current = []
    committedRef.current = 0
    segmentStartRef.current = performance.now()

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onstop = () => {
      // Nothing downstream of here has anywhere to put its result.
      if (!mounted.current) {
        chunksRef.current = []
        return
      }

      const duration =
        (committedRef.current + (performance.now() - segmentStartRef.current)) /
        1000
      const actualType =
        recorder.mimeType || mimeType || "application/octet-stream"
      const blob = new Blob(chunksRef.current, { type: actualType })
      chunksRef.current = []

      setIsRecording(false)
      setIsPaused(false)
      setElapsed(0)

      // A recorder stopped before any data arrived produces an empty blob. It
      // is not a recording, and listing it as one is how a gallery fills with
      // 0 B rows that play nothing.
      if (blob.size === 0) return

      const at = new Date()
      const recording: Recording = {
        id: `${at.getTime()}-${blob.size}`,
        filename: timestampedFilename(prefix, fileExtensionFor(actualType), at),
        url: URL.createObjectURL(blob),
        duration,
        size: blob.size,
        mimeType: actualType,
        at
      }

      setRecordings((current) => {
        const next = [recording, ...current]
        for (const stale of next.slice(max)) URL.revokeObjectURL(stale.url)
        return next.slice(0, max)
      })
    }

    // A timeslice, so a long recording is flushed incrementally instead of
    // held whole until stop.
    recorder.start(1000)
    recorderRef.current = recorder
    setIsRecording(true)
    setIsPaused(false)
    setElapsed(0)
  }, [stream, mimeType, prefix, max])

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) return
    if (recorder.state !== "inactive") recorder.stop()
    recorderRef.current = null
  }, [])

  const pause = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder?.state !== "recording") return
    recorder.pause()
    committedRef.current += performance.now() - segmentStartRef.current
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder?.state !== "paused") return
    segmentStartRef.current = performance.now()
    recorder.resume()
    setIsPaused(false)
  }, [])

  /** The elapsed readout. Paused time is excluded, because it is not content. */
  useEffect(() => {
    if (!isRecording || isPaused) return

    const id = setInterval(() => {
      setElapsed(
        (committedRef.current + (performance.now() - segmentStartRef.current)) /
          1000
      )
    }, 250)

    return () => {
      clearInterval(id)
    }
  }, [isRecording, isPaused])

  /**
   * The stream going away mid-recording — unplugged, or seized by another app.
   *
   * Without this the recorder holds a dead track and the UI keeps a clock
   * running over a file that stopped growing.
   */
  useEffect(() => {
    if (!stream && recorderRef.current) stop()
  }, [stream, stop])

  const remove = useCallback((id: string) => {
    setRecordings((current) => {
      const target = current.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return current.filter((item) => item.id !== id)
    })
  }, [])

  const clear = useCallback(() => {
    setRecordings((current) => {
      for (const item of current) URL.revokeObjectURL(item.url)
      return []
    })
  }, [])

  /** Everything released on unmount, which is where the old leak lived. */
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const recorder = recorderRef.current
      if (recorder && recorder.state !== "inactive") recorder.stop()
      recorderRef.current = null
      for (const item of recordingsRef.current) URL.revokeObjectURL(item.url)
    }
  }, [])

  return {
    recordings,
    isRecording,
    isPaused,
    elapsed,
    canRecord,
    mimeType,
    start,
    stop,
    pause,
    resume,
    remove,
    clear
  }
}
