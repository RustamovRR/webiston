"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * The cameras or microphones attached right now.
 *
 * Two rules the tools that used to do this themselves both broke:
 *
 * - **Labels are empty until permission has been granted at least once.** That
 *   is a privacy rule in the spec, not a bug. The old code filled the gap with
 *   eight characters of the opaque device id — `Device a1b2c3d4` — which
 *   describes nothing, and the microphone tool went further and rewrote the
 *   real labels too, cutting them at 32 characters and shortening
 *   "Microphone" to "Mic". The name in a picker has to match the name in the
 *   system settings the visitor is about to go and change.
 * - **The list changes while the page is open.** Plugging in a USB microphone
 *   should add it without a reload, and neither tool listened for it.
 */

export type MediaKind = "audioinput" | "videoinput"

export interface MediaAccessDevice {
  deviceId: string
  label: string
}

export function useMediaDeviceList(kind: MediaKind) {
  const [devices, setDevices] = useState<MediaAccessDevice[]>([])

  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return []

    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const found = all
        .filter((device) => device.kind === kind)
        // Verbatim. See above.
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label
        }))
      setDevices(found)
      return found
    } catch {
      return []
    }
  }, [kind])

  useEffect(() => {
    // Captured, not re-read in the cleanup: the listener has to be removed
    // from the SAME object it was added to, and `navigator.mediaDevices` is
    // not guaranteed to still be the same one — or to exist at all — by the
    // time React unmounts the tree.
    const media = navigator.mediaDevices
    if (!media?.addEventListener) return

    const onChange = () => {
      void refresh()
    }

    media.addEventListener("devicechange", onChange)
    return () => {
      media.removeEventListener("devicechange", onChange)
    }
  }, [refresh])

  /**
   * An unlabelled list before the first grant is worse than no list: the ids
   * are opaque hashes, so the count is the only information in it.
   */
  const hasLabels = devices.some((device) => device.label !== "")

  return { devices, hasLabels, refresh }
}
