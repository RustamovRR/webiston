import { create } from "zustand"

/**
 * The text being converted, held above the component tree.
 *
 * Same defect the QR generator had, reported the same way: switching language
 * calls `router.push(pathname, { locale })`, the `[locale]` segment changes,
 * the tool UNMOUNTS, and `useState("")` starts over — so a pasted article was
 * gone. It is a soft navigation, verified by a marker on `window` surviving
 * it, which is exactly why plain module state is enough to fix it.
 *
 * NOT part of `transliterationStore`, and not persisted, for two reasons:
 *
 * - That store writes to localStorage. The converter's whole promise is that
 *   the text never leaves the browser; a pasted document belongs in memory,
 *   not on disk. Preferences and the exception list are settings and do belong
 *   there — different lifetime, different store.
 * - `transliterationStore`'s own header records `sourceText` being taken OUT
 *   of it, and that removal was right at the time: nothing needed it to
 *   survive, so it was module state doing a component's job. The locale
 *   remount is the something.
 */

interface LatinCyrillicDraftState {
  sourceText: string
  setSourceText: (sourceText: string) => void
}

export const useLatinCyrillicDraftStore = create<LatinCyrillicDraftState>()(
  (set) => ({
    sourceText: "",
    setSourceText: (sourceText) => set({ sourceText })
  })
)
