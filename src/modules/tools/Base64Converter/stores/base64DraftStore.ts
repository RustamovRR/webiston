import { create } from "zustand"

import type { ConversionMode } from "../types"

/**
 * What the visitor is currently working on, above the component tree.
 *
 * The same locale-remount fix every refactored tool carries: switching
 * language remounts the `[locale]` segment and `useState` starts over, so a
 * pasted payload — measured on latin-cyrillic, the QR generator and `/tools` —
 * simply vanished. Module scope survives that remount.
 *
 * Deliberately NOT persisted. A base64 payload is as likely to be a token or a
 * key as it is to be a greeting; storage would only buy surviving a reload,
 * which nobody asked for.
 */

interface Base64DraftState {
  input: string
  mode: ConversionMode
  urlSafe: boolean
  setInput: (input: string) => void
  setMode: (mode: ConversionMode) => void
  setUrlSafe: (urlSafe: boolean) => void
  reset: () => void
}

const initialState = () => ({
  input: "",
  mode: "encode" as ConversionMode,
  urlSafe: false
})

export const useBase64DraftStore = create<Base64DraftState>()((set) => ({
  ...initialState(),
  setInput: (input) => set({ input }),
  setMode: (mode) => set({ mode }),
  setUrlSafe: (urlSafe) => set({ urlSafe }),
  reset: () => set(initialState())
}))
