"use client"

import { useEffect, useState } from "react"

/**
 * What the browser will answer BEFORE anything is asked.
 *
 * The Permissions API never prompts, so this is free to run on mount — and it
 * is what lets a page say "already allowed" or "blocked in your settings"
 * before the visitor commits to a click, rather than offering a button whose
 * only possible outcome is nothing happening.
 *
 * `unknown` is not a failure. Firefox and Safari do not implement the camera
 * and microphone descriptors, so a large share of the web lands there and the
 * honest thing is to say we cannot tell in advance.
 */

export type PermissionState = "granted" | "denied" | "prompt" | "unknown"

export function usePermissionState(name: "camera" | "microphone") {
  const [state, setState] = useState<PermissionState>("unknown")

  useEffect(() => {
    if (!navigator.permissions?.query) return

    let cancelled = false
    let subscription: PermissionStatus | null = null

    const sync = (next: PermissionState) => {
      if (!cancelled) setState(next)
    }

    navigator.permissions
      // The typed union of descriptor names is narrower than what browsers
      // accept, and there is no way to express "camera" without widening it.
      .query({ name: name as PermissionName })
      .then((result) => {
        if (cancelled) return
        subscription = result
        sync(result.state)
        // Fires when the visitor changes the setting in the browser's own UI —
        // exactly the moment a "blocked" panel should stop being true.
        result.onchange = () => {
          sync(result.state)
        }
      })
      .catch(() => {
        sync("unknown")
      })

    return () => {
      cancelled = true
      if (subscription) subscription.onchange = null
    }
  }, [name])

  return [state, setState] as const
}
