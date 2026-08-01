/**
 * What is worth remembering between visits: which way the user last asked to
 * convert, and the words they told the converter to leave alone.
 *
 * The exception list stays HERE — in this browser's localStorage — and that is
 * the whole design. Every competitor solves the same problem with an account
 * and a review queue: uzlatin.uz has a personal dictionary and a community one,
 * lotin.uz routes each reported word through a specialist before anything
 * changes. Ours needs neither, because the page already promises the text never
 * leaves the browser and a server-side list would be the one thing that broke
 * that promise.
 *
 * The store used to also hold `sourceText`, `fileName`, `chunks` and
 * `selectedChunkId` at module scope, which meant an uploaded document stayed
 * in memory for the whole session — the user navigated away and the text was
 * still there. None of it survived a reload anyway (`partialize` persisted
 * only `direction`, and `onRehydrateStorage` cleared the rest a second time),
 * so it was module-global state doing the job of component state.
 */

import {
  type DirectionPreference,
  normaliseUserTerms
} from "@webiston/transliteration"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TransliterationState {
  preference: DirectionPreference
  /** Words this reader asked the converter to leave in place. */
  exceptions: string[]
  setPreference: (preference: DirectionPreference) => void
  addException: (term: string) => void
  removeException: (term: string) => void
  clearExceptions: () => void
}

export const useTransliterationStore = create<TransliterationState>()(
  persist(
    (set) => ({
      // "auto" by default: the text picks the direction until the user
      // overrides it, which is what someone pasting into a converter wants.
      preference: "auto",
      exceptions: [],
      setPreference: (preference) => set({ preference }),

      // Cleaning happens on the way IN, not on every conversion: the engine
      // would otherwise re-trim and re-deduplicate the same list on every
      // keystroke, and a list that is already clean cannot surprise the
      // exception dialog with an entry it will not display.
      addException: (term) =>
        set((state) => ({
          exceptions: normaliseUserTerms([...state.exceptions, term])
        })),

      removeException: (term) =>
        set((state) => ({
          exceptions: state.exceptions.filter((entry) => entry !== term)
        })),

      clearExceptions: () => set({ exceptions: [] })
    }),
    {
      name: "latin-cyrillic-storage",
      // Bumped because the shape changed: v1 held `direction` (two values),
      // v2 `preference` (three), v3 adds `exceptions`. Without a version,
      // zustand merges the old object in and leaves a dead key in every
      // returning visitor's localStorage forever.
      version: 3,
      // A v2 record has no `exceptions` key, and `[...undefined]` throws on
      // the first add. Migration is what keeps returning visitors working.
      // Rebuilt field-by-field, not spread: a v1 record held `direction`, not
      // `preference`, so the spread version left `preference: undefined` for
      // every visitor migrating from v1 — no active segment, and the engine
      // handed a preference that is not one of its three values.
      migrate: (persisted) => {
        const record = persisted as Partial<TransliterationState>
        return {
          preference:
            record.preference === "latin-to-cyrillic" ||
            record.preference === "cyrillic-to-latin"
              ? record.preference
              : "auto",
          exceptions: Array.isArray(record.exceptions) ? record.exceptions : []
        }
      }
    }
  )
)
