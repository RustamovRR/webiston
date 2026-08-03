import { create } from "zustand"

import type { ConversionMode, UrlScope } from "../types"

/**
 * What the visitor is currently working on, above the component tree.
 *
 * The same locale-remount fix every refactored tool carries: switching
 * language remounts the `[locale]` segment and `useState` starts over. Not
 * persisted — a URL can carry a session token in its query string.
 */

interface UrlDraftState {
  input: string
  mode: ConversionMode
  scope: UrlScope
  setInput: (input: string) => void
  setMode: (mode: ConversionMode) => void
  setScope: (scope: UrlScope) => void
  reset: () => void
}

const initialState = () => ({
  input: "",
  mode: "encode" as ConversionMode,
  // The commonest job by far: escaping one value to put in a query string.
  scope: "value" as UrlScope
})

export const useUrlDraftStore = create<UrlDraftState>()((set) => ({
  ...initialState(),
  setInput: (input) => set({ input }),
  setMode: (mode) => set({ mode }),
  setScope: (scope) => set({ scope }),
  reset: () => set(initialState())
}))
