/**
 * What is worth remembering between visits: which alphabet the user last asked
 * for on each route, and the words they told the converter to leave alone.
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

import { normaliseUserTerms } from "@webiston/transliteration"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { ConverterPage } from "../constants"
import type { ScriptPreference } from "../types"

/** A v3 direction, as the alphabet it converted into. "auto" needs no entry:
 * it is the Latin-Cyrillic page's default. */
const LEGACY_PREFERENCE: Record<string, ScriptPreference> = {
  "latin-to-cyrillic": "cyrillic",
  "cyrillic-to-latin": "latin"
}

interface TransliterationState {
  /** The switch position per route. A route with none opens on its default. */
  preferences: Partial<Record<ConverterPage, ScriptPreference>>
  /** Words this reader asked the converter to leave in place. */
  exceptions: string[]
  setPreference: (page: ConverterPage, preference: ScriptPreference) => void
  addException: (term: string) => void
  removeException: (term: string) => void
  clearExceptions: () => void
}

export const useTransliterationStore = create<TransliterationState>()(
  persist(
    (set) => ({
      // Empty, not pre-filled: each route's default lives in
      // DEFAULT_PREFERENCE, so changing a default reaches every visitor who
      // never touched the switch.
      preferences: {},
      exceptions: [],
      setPreference: (page, preference) =>
        set((state) => ({
          preferences: { ...state.preferences, [page]: preference }
        })),

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
      // v2 `preference` (three), v3 added `exceptions`, v4 replaced the one
      // direction with an alphabet per route. Without a version, zustand
      // merges the old object in and leaves a dead key in every returning
      // visitor's localStorage forever.
      version: 4,
      // A v2 record has no `exceptions` key, and `[...undefined]` throws on
      // the first add. A v3 record's `preference` is a DIRECTION, and the
      // reader who pinned "→ Lotin" on the Latin-Cyrillic page should find it
      // still pinned there — so it is translated, not dropped. A v1
      // `direction` was never carried forward and still is not: those
      // visitors went back to "auto" at v2.
      migrate: (persisted) => {
        const record = persisted as {
          preference?: unknown
          exceptions?: unknown
        }
        // `hasOwn`, not a bare lookup: a stored "constructor" would otherwise
        // read Object.prototype's and pin a function as the preference.
        const legacy =
          typeof record.preference === "string" &&
          Object.hasOwn(LEGACY_PREFERENCE, record.preference)
            ? LEGACY_PREFERENCE[record.preference]
            : undefined
        return {
          preferences: legacy ? { "latin-cyrillic": legacy } : {},
          exceptions: Array.isArray(record.exceptions) ? record.exceptions : []
        }
      }
    }
  )
)
