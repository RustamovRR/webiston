import { create } from "zustand"

import { MAX_UUID_COUNT, MIN_UUID_COUNT } from "../constants"
import type { UuidCase, UuidFormat, UuidVersion } from "../types"

/**
 * The tool's work, at module scope.
 *
 * Switching locale is a soft navigation that REMOUNTS the tree, so anything
 * held in `useState` starts over — measured on the QR generator, where a
 * pasted payload disappeared. A module-scope store survives it. The 7th tool
 * to get this treatment.
 *
 * Deliberately NOT persisted, like the rest of the suite: a batch of
 * identifiers is a one-off, and writing them to storage would only add
 * surviving a reload, which nobody has asked for.
 */

interface UuidDraftState {
  count: number
  version: UuidVersion
  format: UuidFormat
  textCase: UuidCase
  /** Canonical, lower-case, hyphenated. Display formatting is derived. */
  values: string[]
  /**
   * The `version:count` the current batch was made for.
   *
   * It is what lets the tool regenerate when the visitor changes WHAT they are
   * asking for, without regenerating when the component merely remounts — and
   * a locale switch is a remount, which is the whole reason this store exists.
   */
  generatedFor: string | null
  /** Whatever is in the inspector field. */
  inspectInput: string
  setCount: (count: number) => void
  setVersion: (version: UuidVersion) => void
  setFormat: (format: UuidFormat) => void
  setTextCase: (textCase: UuidCase) => void
  setValues: (values: string[], generatedFor: string) => void
  setInspectInput: (value: string) => void
  clear: () => void
  /** Back to defaults. Used by the tests to isolate one run from the next. */
  reset: () => void
}

const initialState = {
  count: 5,
  version: "v4" as UuidVersion,
  format: "standard" as UuidFormat,
  textCase: "lower" as UuidCase,
  values: [] as string[],
  generatedFor: null as string | null,
  inspectInput: ""
}

export const useUuidDraftStore = create<UuidDraftState>()((set) => ({
  ...initialState,
  setCount: (count) =>
    set({
      // `Number.parseInt("")` is NaN, and NaN survives Math.min/max — an empty
      // field would otherwise put NaN in the store and render "NaN" values.
      count: Number.isFinite(count)
        ? Math.min(MAX_UUID_COUNT, Math.max(MIN_UUID_COUNT, Math.trunc(count)))
        : MIN_UUID_COUNT
    }),
  setVersion: (version) => set({ version }),
  setFormat: (format) => set({ format }),
  setTextCase: (textCase) => set({ textCase }),
  setValues: (values, generatedFor) => set({ values, generatedFor }),
  setInspectInput: (inspectInput) => set({ inspectInput }),
  clear: () => set({ values: [], generatedFor: null, inspectInput: "" }),
  reset: () => set(initialState)
}))
