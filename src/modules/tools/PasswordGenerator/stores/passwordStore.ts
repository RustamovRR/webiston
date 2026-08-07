import { create } from "zustand"

import { DEFAULT_SETTINGS } from "../constants"
import {
  generatePassword,
  NoCharactersSelectedError,
  type PasswordSettings
} from "../utils/generate-password"

/**
 * The generator's state, above the component tree — fourth tool with the same
 * locale-remount fix, and the one where losing state stings most: the visitor
 * generated a password, went to paste it somewhere, came back via the language
 * button, and it was a DIFFERENT password.
 *
 * Emphatically NOT persisted. A generated password written to localStorage
 * would be the single worst byte this site could store.
 */

interface PasswordState {
  settings: PasswordSettings
  password: string
  /** Set when the settings permit no characters; the component translates. */
  error: "noCharacters" | null
  show: boolean
  regenerate: () => void
  /** Any change to WHAT is generated regenerates immediately — a stale
   *  password next to fresh settings would misdescribe itself. */
  updateSettings: (patch: Partial<PasswordSettings>) => void
  toggleShow: () => void
}

function generateFor(
  settings: PasswordSettings
): Pick<PasswordState, "password" | "error"> {
  try {
    return { password: generatePassword(settings), error: null }
  } catch (error) {
    if (error instanceof NoCharactersSelectedError) {
      return { password: "", error: "noCharacters" }
    }
    throw error
  }
}

export const usePasswordStore = create<PasswordState>()((set) => ({
  settings: DEFAULT_SETTINGS,
  // Empty until the first client render asks — module scope runs on the
  // server too, and a password drawn there would be the same for nobody and
  // wasted for everybody.
  password: "",
  error: null,
  show: true,
  regenerate: () => set((state) => generateFor(state.settings)),
  updateSettings: (patch) =>
    set((state) => {
      const settings = { ...state.settings, ...patch }
      return { settings, ...generateFor(settings) }
    }),
  toggleShow: () => set((state) => ({ show: !state.show }))
}))
