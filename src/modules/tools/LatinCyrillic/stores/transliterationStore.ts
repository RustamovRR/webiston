/**
 * The only thing worth remembering between visits: which way the user last
 * asked to convert.
 *
 * The store used to also hold `sourceText`, `fileName`, `chunks` and
 * `selectedChunkId` at module scope, which meant an uploaded document stayed
 * in memory for the whole session — the user navigated away and the text was
 * still there. None of it survived a reload anyway (`partialize` persisted
 * only `direction`, and `onRehydrateStorage` cleared the rest a second time),
 * so it was module-global state doing the job of component state.
 */

import type { DirectionPreference } from "@webiston/transliteration"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TransliterationState {
  preference: DirectionPreference
  setPreference: (preference: DirectionPreference) => void
}

export const useTransliterationStore = create<TransliterationState>()(
  persist(
    (set) => ({
      // "auto" by default: the text picks the direction until the user
      // overrides it, which is what someone pasting into a converter wants.
      preference: "auto",
      setPreference: (preference) => set({ preference })
    }),
    {
      name: "latin-cyrillic-storage",
      // Bumped because the shape changed: the key used to hold `direction`
      // (two values) and now holds `preference` (three). Without a version,
      // zustand merges the old object in and leaves a dead `direction` key in
      // every returning visitor's localStorage forever.
      version: 2
    }
  )
)
