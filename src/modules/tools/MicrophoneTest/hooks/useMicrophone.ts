"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useMediaAccess } from "@/hooks/useMediaAccess"
import { CLIPPING_DBFS, levelInDbfs, peakInDbfs } from "@/lib/utils/media"

import {
  FFT_SIZE,
  PEAK_HOLD_MS,
  READOUT_INTERVAL_MS,
  SILENCE_HINT_DBFS,
  SILENCE_HINT_MS,
  SPECTRUM_SMOOTHING
} from "../constants"
import type { LevelReading, ProcessingOptions } from "../types"

/**
 * Listening to the microphone and measuring what comes back.
 *
 * Permission, devices and stream lifetime are `useMediaAccess`'s job; this hook
 * is only the audio graph on top of it. What that split fixed, beyond the
 * duplication: the old hook's mount effect listed `stopListening` as a
 * dependency, `stopListening` was rebuilt whenever `isRecording` changed, and
 * so the effect's cleanup ran the moment you pressed record — stopping the very
 * microphone it was recording.
 *
 * **The measurement is different too.** The old loop read
 * `getByteFrequencyData` and computed an RMS from it. Those bytes are per-bin
 * magnitudes the analyser has already converted to decibels, scaled and
 * smoothed; the root-mean-square of them is not a level. It moved when you
 * spoke, so it looked like it worked, and the 0–100 "quality" rating built on
 * it was a rating of nothing. This reads the time domain and reports dBFS.
 */

const SILENT: LevelReading = {
  rms: -Infinity,
  peak: -Infinity,
  hold: -Infinity,
  clipping: false
}

export function useMicrophone() {
  const [processing, setProcessing] = useState<ProcessingOptions>({
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  })
  const [level, setLevel] = useState<LevelReading>(SILENT)
  const [settings, setSettings] = useState<MediaTrackSettings | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isSilent, setIsSilent] = useState(false)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const monitorRef = useRef<GainNode | null>(null)
  const frameRef = useRef<number | null>(null)

  /**
   * Constraints. `deviceId` is `ideal`, not `exact`, on purpose: an `exact`
   * device that has just been unplugged rejects the whole call, and falling
   * back to the default microphone is a better answer than an error panel.
   */
  const buildConstraints = useCallback(
    (deviceId: string | null): MediaStreamConstraints => ({
      audio: {
        ...(deviceId ? { deviceId: { ideal: deviceId } } : {}),
        echoCancellation: processing.echoCancellation,
        noiseSuppression: processing.noiseSuppression,
        autoGainControl: processing.autoGainControl
      },
      video: false
    }),
    [processing]
  )

  const access = useMediaAccess({
    kind: "audioinput",
    buildConstraints
  })

  const { stream, isLive, start } = access

  /**
   * The audio graph.
   *
   * Two branches off one source: the analyser, which only measures, and a gain
   * node to the speakers, which is the monitor. They are separate so that
   * measuring never makes a sound — connecting an analyser to the destination
   * is the classic way to turn a level meter into a feedback loop.
   */
  useEffect(() => {
    if (!stream) return

    const context = new AudioContext()
    contextRef.current = context

    const analyser = context.createAnalyser()
    analyser.fftSize = FFT_SIZE
    analyser.smoothingTimeConstant = SPECTRUM_SMOOTHING
    analyserRef.current = analyser

    const source = context.createMediaStreamSource(stream)
    source.connect(analyser)

    const monitor = context.createGain()
    // Muted until asked. A page that plays your own microphone back at you the
    // instant it opens, through laptop speakers, produces howling feedback.
    monitor.gain.value = 0
    monitorRef.current = monitor
    source.connect(monitor)
    monitor.connect(context.destination)

    // Chrome starts a context created outside a gesture in `suspended`; the
    // click that opened the microphone counts, but resuming is free either way.
    void context.resume()

    setSettings(stream.getAudioTracks()[0]?.getSettings() ?? null)

    return () => {
      source.disconnect()
      monitor.disconnect()
      analyser.disconnect()
      analyserRef.current = null
      monitorRef.current = null
      contextRef.current = null
      void context.close()
      setSettings(null)
      setLevel(SILENT)
      setIsSilent(false)
    }
  }, [stream])

  /** The monitor is a gain change, not a graph change — no clicks, no rebuild. */
  useEffect(() => {
    const monitor = monitorRef.current
    if (!monitor) return
    monitor.gain.value = isMonitoring ? 1 : 0
  }, [isMonitoring])

  /**
   * The measurement loop.
   *
   * Runs every animation frame because the canvas reads the analyser directly
   * from its own loop; the numbers here are throttled, because a dBFS reading
   * refreshed sixty times a second is a blur and sixty re-renders a second is
   * a cost paid for that blur.
   */
  useEffect(() => {
    if (!isLive) return

    const buffer = new Uint8Array(FFT_SIZE)
    let lastReadout = 0
    let holdValue = -Infinity
    let holdSetAt = 0
    let loudAt = performance.now()

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick)

      const analyser = analyserRef.current
      if (!analyser) return

      analyser.getByteTimeDomainData(buffer)
      const rms = levelInDbfs(buffer)
      const peak = peakInDbfs(buffer)
      const now = performance.now()

      // Peak hold: a transient lasts a few milliseconds and is the thing that
      // clips a recording, so it has to stay on screen long enough to read.
      if (peak >= holdValue || now - holdSetAt > PEAK_HOLD_MS) {
        holdValue = peak
        holdSetAt = now
      }

      if (rms > SILENCE_HINT_DBFS) loudAt = now

      if (now - lastReadout >= READOUT_INTERVAL_MS) {
        lastReadout = now
        setLevel({
          rms,
          peak,
          hold: holdValue,
          clipping: peak >= CLIPPING_DBFS
        })
        setIsSilent(now - loudAt > SILENCE_HINT_MS)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [isLive])

  /**
   * Changing what the browser does to the signal.
   *
   * `applyConstraints` on the live track would be the cheap path, but browsers
   * disagree about which of the three it will honour without a new stream — so
   * the stream is reopened, which is the one behaviour that is the same
   * everywhere. It is also the only way `getSettings()` afterwards is the truth
   * rather than the request.
   */
  const updateProcessing = useCallback((next: Partial<ProcessingOptions>) => {
    setProcessing((current) => ({ ...current, ...next }))
  }, [])

  const processingRef = useRef(processing)
  useEffect(() => {
    const changed = processingRef.current !== processing
    processingRef.current = processing
    if (changed && isLive) void start()
  }, [processing, isLive, start])

  const stop = useCallback(() => {
    setIsMonitoring(false)
    access.stop()
  }, [access])

  return {
    ...access,
    stop,
    analyserRef,
    level,
    settings,
    processing,
    updateProcessing,
    isMonitoring,
    setIsMonitoring,
    isSilent
  }
}
