import { create } from "zustand"

import type { ModePreference, UrlScope } from "../types"

/**
 * What the visitor is currently working on, above the component tree.
 *
 * The same locale-remount fix every refactored tool carries: switching
 * language remounts the `[locale]` segment and `useState` starts over. Not
 * persisted — a URL can carry a session token in its query string.
 */

interface UrlDraftState {
  input: string
  preference: ModePreference
  /** `null` means "whatever the input looks like"; a value is an override. */
  scopeOverride: UrlScope | null
  setInput: (input: string) => void
  setPreference: (preference: ModePreference) => void
  setScopeOverride: (scope: UrlScope | null) => void
  reset: () => void
}

const initialState = () => ({
  input: "",
  // The tool works it out; the control is there to disagree with.
  preference: "auto" as ModePreference,
  scopeOverride: null
})

export const useUrlDraftStore = create<UrlDraftState>()((set) => ({
  ...initialState(),
  setInput: (input) => set({ input }),
  setPreference: (preference) => set({ preference }),
  setScopeOverride: (scopeOverride) => set({ scopeOverride }),
  reset: () => set(initialState())
}))
