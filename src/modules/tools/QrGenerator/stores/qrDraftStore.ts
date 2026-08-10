import { create } from "zustand"

import { DEFAULT_STYLE } from "../constants"
import type { QrStyle } from "../types"
import { DEFAULT_WIFI, type WifiConfig } from "../utils/wifi"

/**
 * The code being built, held above the component tree.
 *
 * This exists for one measured reason. Switching language calls
 * `router.push(pathname, { locale })`, which changes the `[locale]` segment —
 * so the tool UNMOUNTS and remounts, and `useState("")` starts over. Verified
 * in the browser: after the switch the JS context marker survived
 * (`ctx-781836`, a soft navigation) while the textarea was empty and the code
 * was gone. A visitor who typed a vCard and then switched to English lost all
 * of it, which reads as the tool crashing.
 *
 * Deliberately NOT persisted, and that is the whole trade:
 *
 * - The payload can be a WiFi password or a phone number. The page promises
 *   nothing leaves the browser; writing it to disk would weaken that for a
 *   convenience nobody asked for.
 * - The remount happens inside one JS context, so plain module state is
 *   already enough to survive it. Storage would only add surviving a RELOAD,
 *   which was never the complaint.
 * - `LatinCyrillic`'s store records the opposite lesson — text at module scope
 *   there bought nothing, because it did not survive a reload either and no
 *   navigation needed it. Here it buys the exact bug above.
 *
 * The cost is that the draft outlives navigating away within the tab. The
 * Clear button empties it, and it dies with the tab.
 */

/** What the input panel is editing: the free-text box, or the WiFi fields. */
export type QrInputMode = "text" | "wifi"

interface QrDraftState {
  value: string
  mode: QrInputMode
  /** The WiFi form's fields — a payload COMPILER, see `utils/wifi.ts`. The
   *  password lives only here, in memory, like everything else in this store. */
  wifi: WifiConfig
  style: QrStyle
  setValue: (value: string) => void
  setMode: (mode: QrInputMode) => void
  updateWifi: (patch: Partial<WifiConfig>) => void
  updateStyle: (patch: Partial<QrStyle>) => void
  /**
   * Put the look back to defaults WITHOUT touching the payload.
   *
   * Separate from `reset` because the two are different intentions and the
   * tool only offered the destructive one: the single Clear button emptied the
   * text, the WiFi fields and the style together, and it lived in the input
   * panel's header — so a visitor who had spent a minute on colours had no way
   * back that did not also delete what they had typed.
   */
  resetStyle: () => void
  reset: () => void
}

export const useQrDraftStore = create<QrDraftState>()((set) => ({
  value: "",
  mode: "text",
  wifi: DEFAULT_WIFI,
  style: DEFAULT_STYLE,
  setValue: (value) => set({ value }),
  setMode: (mode) => set({ mode }),
  updateWifi: (patch) =>
    set((state) => ({ wifi: { ...state.wifi, ...patch } })),
  updateStyle: (patch) =>
    set((state) => ({ style: { ...state.style, ...patch } })),
  resetStyle: () => set({ style: DEFAULT_STYLE }),
  reset: () =>
    set({ value: "", mode: "text", wifi: DEFAULT_WIFI, style: DEFAULT_STYLE })
}))

/**
 * Has the visitor changed the look at all?
 *
 * A shallow compare is exactly right: `QrStyle` is flat and every field is a
 * string, a number or `undefined`. It drives whether the reset control is
 * offered, so it must be false on a fresh tool or the control is permanent
 * furniture that does nothing.
 *
 * The key set is the UNION of both objects, not `DEFAULT_STYLE`'s. The two
 * fields a visitor is most likely to change — `logo` and `gradientColor` — are
 * OPTIONAL and therefore absent from the default, so iterating the default
 * alone would report "unchanged" for the one who had just uploaded a logo.
 */
export function isStyleDirty(style: QrStyle): boolean {
  const keys = new Set<keyof QrStyle>([
    ...(Object.keys(DEFAULT_STYLE) as (keyof QrStyle)[]),
    ...(Object.keys(style) as (keyof QrStyle)[])
  ])

  return [...keys].some((key) => style[key] !== DEFAULT_STYLE[key])
}
