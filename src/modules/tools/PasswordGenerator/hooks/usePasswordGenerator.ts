"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { usePasswordStore } from "../stores/passwordStore"
import { assessStrength } from "../utils/strength"

/**
 * Thin wiring between the store, the strength maths and the clipboard.
 *
 * The version this replaces took the TRANSLATOR as `t: any` (twice), carried
 * hardcoded Uzbek strings for its toasts, and computed strength colours —
 * `text-red-400` and friends — inside the hook, which is exactly the logic/
 * presentation split this repo's rules exist to prevent.
 */

/** How long the copy button says "copied". */
const COPIED_FEEDBACK_MS = 2000

export function usePasswordGenerator() {
  const settings = usePasswordStore((state) => state.settings)
  const password = usePasswordStore((state) => state.password)
  const error = usePasswordStore((state) => state.error)
  const show = usePasswordStore((state) => state.show)
  const regenerate = usePasswordStore((state) => state.regenerate)
  const updateSettings = usePasswordStore((state) => state.updateSettings)
  const toggleShow = usePasswordStore((state) => state.toggleShow)

  const [copied, setCopied] = useState(false)

  // First arrival in this tab: draw one. A locale switch remounts this hook
  // but the store still holds the password, so the guard keeps it.
  useEffect(() => {
    if (!usePasswordStore.getState().password) {
      usePasswordStore.getState().regenerate()
    }
  }, [])

  // The acknowledgement must not outlive the password: regenerate inside the
  // two-second window and the button kept saying "copied" about a password
  // that was no longer on screen.
  // (One comment line, because Biome ignores a `biome-ignore` with other
  // comments between it and the diagnostic — the two-line version here had no
  // effect at all.)
  // biome-ignore lint/correctness/useExhaustiveDependencies: password is the reset signal, not state this effect reads
  useEffect(() => {
    setCopied(false)
  }, [password])

  const strength = useMemo(() => assessStrength(settings), [settings])

  const copy = useCallback(async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
    } catch {
      // Clipboard refused (permissions, insecure context): no acknowledgement
      // is the honest signal — saying "copied" about a failed write is worse.
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
  }, [password])

  return {
    settings,
    password,
    error,
    show,
    copied,
    strength,
    /** Distinct characters actually in this draw, for the readout. */
    uniqueCharacters: new Set(password).size,
    regenerate,
    updateSettings,
    toggleShow,
    copy
  }
}
