import { create } from "zustand"

import { DEFAULT_COLOR, type PaletteType } from "../constants"

/**
 * The colour being inspected, above the component tree — the same
 * locale-remount fix every refactored tool carries: switching language
 * remounts the `[locale]` segment and `useState` starts over.
 *
 * Not persisted. The HISTORY feature persists deliberately (see
 * `lib/utils/color-storage.ts`); the live draft does not need to survive a
 * reload, only the remount.
 */

interface ColorDraftState {
  inputColor: string
  paletteType: PaletteType
  setInputColor: (inputColor: string) => void
  setPaletteType: (paletteType: PaletteType) => void
}

export const useColorDraftStore = create<ColorDraftState>()((set) => ({
  inputColor: DEFAULT_COLOR,
  paletteType: "monochromatic",
  setInputColor: (inputColor) => set({ inputColor }),
  setPaletteType: (paletteType) => set({ paletteType })
}))
