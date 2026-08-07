"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useMediaAccess } from "@/hooks/useMediaAccess"

import {
  DEFAULT_PRESET_ID,
  IDEAL_FRAME_RATE,
  QUALITY_PRESETS
} from "../constants"
import type { CameraCapabilities, CameraSettings } from "../types"

/**
 * Opening a camera and knowing what came back.
 *
 * Permission, devices and stream lifetime belong to `useMediaAccess`; this hook
 * adds the parts that are specific to video. What it fixed:
 *
 * - **It prompted on mount.** The old hook called `getUserMedia({video:true})`
 *   from a `useEffect` to enumerate devices, so simply opening the page turned
 *   the camera light on. Its "run only once" comment was wrong too — the
 *   dependency array held `selectedCamera` and two callbacks, so it re-ran and
 *   re-prompted whenever any of them changed.
 * - **It reported the request, not the result.** `videoQuality` was whatever
 *   the visitor had picked, and the panel printed it as the resolution — over a
 *   stream the camera may well have negotiated down to something else. What is
 *   shown here comes from `getSettings()`.
 * - **Switching camera or quality was a race.** `stopCamera()` then
 *   `setTimeout(startCamera, 500)`: half a second of black on a fast machine,
 *   and a failure on a slow one. `useMediaAccess` opens the new stream before
 *   releasing the old.
 * - **Audio was always on.** `audio: true`, unconditionally, with nothing in
 *   the interface saying so — the microphone was live from the moment the
 *   camera was.
 */

export function useCamera() {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID)
  const [withAudio, setWithAudio] = useState(true)
  const [settings, setSettings] = useState<CameraSettings | null>(null)
  const [capabilities, setCapabilities] = useState<CameraCapabilities>({
    torch: false,
    zoom: null
  })
  const [torch, setTorch] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)

  const preset = useMemo(
    () =>
      QUALITY_PRESETS.find((item) => item.id === presetId) ??
      QUALITY_PRESETS[1],
    [presetId]
  )

  /**
   * Constraints.
   *
   * Everything is `ideal`. A camera that cannot produce the requested size
   * returns its closest match, which is a usable stream; `exact` would reject
   * the call outright over a number the visitor picked from a menu, and
   * `exact` on `deviceId` fails the moment a device is unplugged between the
   * list being drawn and the button being pressed.
   */
  const buildConstraints = useCallback(
    (deviceId: string | null): MediaStreamConstraints => ({
      video: {
        ...(deviceId ? { deviceId: { ideal: deviceId } } : {}),
        width: { ideal: preset.width },
        height: { ideal: preset.height },
        frameRate: { ideal: IDEAL_FRAME_RATE }
      },
      audio: withAudio
    }),
    [preset, withAudio]
  )

  const access = useMediaAccess({ kind: "videoinput", buildConstraints })
  const { stream, isLive, start } = access

  /** What the camera actually produced, plus what this one can be told to do. */
  useEffect(() => {
    if (!stream) {
      setSettings(null)
      setCapabilities({ torch: false, zoom: null })
      setTorch(false)
      setZoom(null)
      return
    }

    const track = stream.getVideoTracks()[0]
    if (!track) return

    const actual = track.getSettings()
    setSettings({
      width: actual.width ?? null,
      height: actual.height ?? null,
      frameRate: actual.frameRate ?? null,
      facingMode: actual.facingMode ?? null
    })

    // `getCapabilities` is absent in Firefox, and `torch`/`zoom` are absent on
    // essentially every laptop webcam — so every control built on them is
    // rendered from this, never assumed.
    const caps = track.getCapabilities?.() as
      | (MediaTrackCapabilities & {
          torch?: boolean
          zoom?: { min: number; max: number; step?: number }
        })
      | undefined

    setCapabilities({
      torch: Boolean(caps?.torch),
      zoom: caps?.zoom
        ? {
            min: caps.zoom.min,
            max: caps.zoom.max,
            step: caps.zoom.step ?? 0.1
          }
        : null
    })
    setZoom(
      typeof (actual as { zoom?: number }).zoom === "number"
        ? (actual as { zoom?: number }).zoom!
        : null
    )
  }, [stream])

  /**
   * Reopen when quality or the microphone setting changes.
   *
   * Compared against the previous value rather than run on every render: the
   * old hook restarted the camera from inside its setter, which meant a second
   * click while the first restart was still in flight left two streams open.
   */
  const settingsKey = `${presetId}:${withAudio}`
  const settingsKeyRef = useRef(settingsKey)
  useEffect(() => {
    const changed = settingsKeyRef.current !== settingsKey
    settingsKeyRef.current = settingsKey
    if (changed && isLive) void start()
  }, [settingsKey, isLive, start])

  /**
   * Torch and zoom are applied to the LIVE track.
   *
   * `applyConstraints` is the right call here, unlike the audio processing in
   * the microphone tool: these are hardware controls the spec expects to change
   * on a running track, and reopening the stream to turn a flash on would be
   * a visible black frame for no reason.
   */
  const applyTorch = useCallback(
    async (next: boolean) => {
      const track = stream?.getVideoTracks()[0]
      if (!track) return
      try {
        await track.applyConstraints({
          advanced: [{ torch: next } as MediaTrackConstraintSet]
        })
        setTorch(next)
      } catch {
        // A camera that advertised the capability and then refused it is not
        // worth an error panel; the control simply does not take.
      }
    },
    [stream]
  )

  const applyZoom = useCallback(
    async (next: number) => {
      const track = stream?.getVideoTracks()[0]
      if (!track) return
      setZoom(next)
      try {
        await track.applyConstraints({
          advanced: [{ zoom: next } as MediaTrackConstraintSet]
        })
      } catch {
        // Same: the slider moves, the lens may not.
      }
    },
    [stream]
  )

  const stop = useCallback(() => {
    setTorch(false)
    access.stop()
  }, [access])

  return {
    ...access,
    stop,
    presetId,
    setPresetId,
    preset,
    withAudio,
    setWithAudio,
    settings,
    capabilities,
    torch,
    applyTorch,
    zoom,
    applyZoom
  }
}
