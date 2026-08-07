"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  describeMediaFailure,
  type MediaFailure,
  mediaSupport
} from "@/lib/utils/media"

import { type MediaKind, useMediaDeviceList } from "./useMediaDeviceList"
import { usePermissionState } from "./usePermissionState"

/**
 * Getting hold of a camera or a microphone, once, correctly.
 *
 * Both media tools had their own copy of this and both copies had the same
 * three defects — which is the argument for one owner rather than two nearly
 * identical hooks:
 *
 * 1. **They prompted on mount.** Opening `/tools/microphone-test` fired
 *    `getUserMedia` from a `useEffect` before the visitor had read a word, so
 *    the browser's permission dialog appeared over a page nobody had agreed to
 *    use yet. A refusal is also sticky: the browser remembers the block for the
 *    origin, so an accidental "no" broke the tool until the visitor went
 *    digging in site settings. Nothing here opens a device without a click.
 * 2. **Every failure was one message.** "You clicked Block", "no camera is
 *    attached" and "another app has it open" all rendered as *access error*,
 *    and only the first is fixed by clicking Allow.
 * 3. **The mount effect re-ran.** Its dependency array held callbacks that were
 *    rebuilt whenever recording state changed, so its cleanup fired mid-session
 *    and tore down the live stream — in `useMicrophoneTest` that happened the
 *    moment you pressed record.
 *
 * The two questions that can be answered without asking for anything — what
 * the browser has already decided, and which devices exist — live in
 * `usePermissionState` and `useMediaDeviceList`. What is left here is the
 * stream itself.
 */

export type { MediaAccessDevice, MediaKind } from "./useMediaDeviceList"
export type { PermissionState } from "./usePermissionState"

export type MediaAccessStatus =
  /** Nothing asked, nothing prompted. Every visit begins here. */
  | "idle"
  /** `getUserMedia` is open — the browser's own dialog may be on screen. */
  | "starting"
  /** A stream is running and its tracks are live. */
  | "live"
  /** The attempt failed; `failure` says which way. */
  | "blocked"

interface UseMediaAccessOptions {
  kind: MediaKind
  /**
   * Constraints for a given device.
   *
   * Read through a ref, so a page can change quality settings between renders
   * without this hook's callbacks changing identity — the churn that made the
   * old mount effect tear its own stream down.
   */
  buildConstraints: (deviceId: string | null) => MediaStreamConstraints
}

export function useMediaAccess({
  kind,
  buildConstraints
}: UseMediaAccessOptions) {
  const [status, setStatus] = useState<MediaAccessStatus>("idle")
  const [failure, setFailure] = useState<MediaFailure | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  /**
   * A request is in flight.
   *
   * Separate from `status` on purpose. `status` is what the PAGE is — gate or
   * live — and reopening a stream must not change that, or the whole live
   * branch unmounts and rebuilds. This is what the CONTROLS are, so a reopen
   * can dim a card and disable a switch without moving anything.
   */
  const [isBusy, setBusy] = useState(false)

  const [permission, setPermission] = usePermissionState(
    kind === "videoinput" ? "camera" : "microphone"
  )
  const { devices, hasLabels, refresh } = useMediaDeviceList(kind)

  const streamRef = useRef<MediaStream | null>(null)
  const constraintsRef = useRef(buildConstraints)
  constraintsRef.current = buildConstraints
  /** Guards every `setState` that can land after an unmount. */
  const mounted = useRef(true)

  /**
   * Stops and forgets a stream. Safe on one already stopped.
   *
   * One of the two things in this file still wrapped by hand. React Compiler
   * is on, so `useCallback` around a plain function is normally redundant —
   * but this and `start` are read by `useEffect` dependency arrays (here and
   * in the two consuming hooks), where identity is part of the contract rather
   * than an optimisation. Everything else is a plain function.
   */
  const releaseStream = useCallback((target: MediaStream | null) => {
    target?.getTracks().forEach((track) => {
      track.stop()
    })
  }, [])

  const stop = () => {
    releaseStream(streamRef.current)
    streamRef.current = null
    if (!mounted.current) return
    setStream(null)
    setStatus("idle")
    setFailure(null)
    setBusy(false)
  }

  /**
   * Open a device.
   *
   * When one is already live this acquires the NEW stream before stopping the
   * old one, so a failed switch leaves the visitor where they were rather than
   * with a dead preview. The version this replaces called `stop()` and then
   * `start()` behind a `setTimeout(500)` — a guess at how long teardown takes,
   * which is a race on a slow machine and half a second of black on a fast one.
   */
  const start = useCallback(
    async (requested?: string | null) => {
      const unsupported = mediaSupport()
      if (unsupported) {
        setFailure(unsupported)
        setStatus("blocked")
        return false
      }

      const target = requested !== undefined ? requested : deviceId
      const previous = streamRef.current

      /**
       * **A reopen never leaves `live`.**
       *
       * Reported as "the cards flicker and look like they re-render" when a
       * processing switch was pressed — and they did, completely. Changing a
       * setting reopens the stream, this set `starting`, `isLive` went false,
       * and the page's whole live branch unmounted back to the permission gate
       * for as long as `getUserMedia` took. Every card was destroyed and
       * rebuilt, the canvas lost its backing store, and the scroll position
       * jumped. Only a FIRST open has nothing to show yet, so only a first open
       * changes the page's state; a reopen reports itself through `isBusy` and
       * the layout stays exactly where it is.
       */
      setBusy(true)
      if (!previous?.active) setStatus("starting")
      setFailure(null)

      /**
       * A failed attempt, resolved against what was already running.
       *
       * This is the case that matters most, because the failure lands while
       * hardware is ON: switching to a camera another application has open
       * fails, and the stream you were already using is still live. Dropping
       * to `blocked` would hide the whole toolbar — including the stop button —
       * over a device that is still recording you.
       *
       * So a switch that fails leaves you exactly where you were and says why,
       * and only a FIRST attempt with nothing to fall back on blocks the page.
       */
      const fail = (error: unknown) => {
        if (!mounted.current) return false
        setBusy(false)
        setFailure(describeMediaFailure(error))
        setStatus(previous?.active ? "live" : "blocked")
        return false
      }

      let opened: MediaStream
      try {
        opened = await navigator.mediaDevices.getUserMedia(
          constraintsRef.current(target)
        )
      } catch (error) {
        // An exact device the browser will not satisfy is worth one retry
        // without it: it was almost certainly unplugged between the list being
        // drawn and the button being pressed, and the default device is a
        // better answer than an error panel.
        if (describeMediaFailure(error) !== "constraints" || !target) {
          return fail(error)
        }

        try {
          opened = await navigator.mediaDevices.getUserMedia(
            constraintsRef.current(null)
          )
        } catch (retryError) {
          return fail(retryError)
        }
      }

      if (!mounted.current) {
        // Unmounted while the dialog was open. Releasing here is what keeps the
        // camera light from staying on after the visitor navigated away.
        releaseStream(opened)
        return false
      }

      releaseStream(previous)
      streamRef.current = opened
      setStream(opened)
      setStatus("live")
      setBusy(false)
      setPermission("granted")

      // The device that actually opened, which is not always the one asked
      // for — an `ideal` constraint is a preference, and the retry above drops
      // the request entirely.
      const settings = opened.getTracks()[0]?.getSettings()
      setDeviceId(settings?.deviceId ?? target ?? null)

      // Labels exist now, so this is the first enumeration worth showing.
      void refresh()
      return true
    },
    [deviceId, refresh, releaseStream, setPermission]
  )

  /** Switch device, restarting the stream only if one is already running. */
  const select = async (next: string) => {
    setDeviceId(next)
    if (streamRef.current) await start(next)
  }

  /**
   * The OS taking the device away.
   *
   * A track ends when the hardware is unplugged, when the browser revokes
   * access, or when another application seizes it. Without this the page keeps
   * rendering a live badge over a stream that stopped producing frames.
   */
  useEffect(() => {
    if (!stream) return

    const tracks = stream.getTracks()
    const onEnded = () => {
      if (!mounted.current) return
      streamRef.current = null
      setStream(null)
      setStatus("blocked")
      setFailure("inUse")
      void refresh()
    }

    tracks.forEach((track) => {
      track.addEventListener("ended", onEnded)
    })
    return () => {
      tracks.forEach((track) => {
        track.removeEventListener("ended", onEnded)
      })
    }
  }, [stream, refresh])

  /**
   * Teardown.
   *
   * Its own effect with an empty dependency array, so it runs exactly once on
   * unmount. Folding it into an effect that also starts things is what made the
   * old hook stop its own microphone mid-recording.
   */
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      releaseStream(streamRef.current)
      streamRef.current = null
    }
  }, [releaseStream])

  return {
    status,
    failure,
    permission,
    devices,
    hasDeviceLabels: hasLabels,
    deviceId,
    stream,
    isBusy,
    isLive: status === "live",
    start,
    stop,
    select,
    refreshDevices: refresh
  }
}
