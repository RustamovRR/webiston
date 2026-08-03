import { create } from "zustand"

/**
 * The token the visitor is currently looking at, above the component tree.
 *
 * The same locale-remount fix every refactored tool carries: switching
 * language remounts the `[locale]` segment and `useState` starts over, so a
 * pasted token simply vanished.
 *
 * Deliberately NOT persisted, and here that is a security property rather than
 * a preference: the thing people paste into a JWT decoder is very often a live
 * access token. Nothing about this tool should outlive the tab.
 */

interface JwtDraftState {
  token: string
  /** The signature is hidden until asked for — it is the secret-adjacent half. */
  showSignature: boolean
  setToken: (token: string) => void
  setShowSignature: (showSignature: boolean) => void
  reset: () => void
}

const initialState = () => ({ token: "", showSignature: false })

export const useJwtDraftStore = create<JwtDraftState>()((set) => ({
  ...initialState(),
  setToken: (token) => set({ token }),
  setShowSignature: (showSignature) => set({ showSignature }),
  reset: () => set(initialState())
}))
