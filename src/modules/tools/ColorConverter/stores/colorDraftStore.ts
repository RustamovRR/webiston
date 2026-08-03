import { create } from "zustand"

import { DEFAULT_COLOR, WHITE } from "../constants"
import type { GradientDraft, GradientStop, WorkbenchView } from "../types"

/**
 * Everything the visitor is currently working on, above the component tree —
 * the same locale-remount fix every refactored tool carries: switching
 * language remounts the `[locale]` segment and `useState` starts over.
 *
 * `view` lives here and NOT in the URL. Putting the active panel in the query
 * string means the server renders one panel and an effect swaps to another
 * after hydration, which is a layout shift charged to exactly the shared-link
 * visitors the feature would be for. The COLOUR goes in the URL; the view does
 * not.
 *
 * `paletteType` is gone: all three schemes render at once, so there is nothing
 * left to choose.
 *
 * Not persisted. The HISTORY feature persists deliberately (see
 * `lib/utils/color-storage.ts`); the live draft does not need to survive a
 * reload, only the remount.
 */

const initialGradient = (): GradientDraft => ({
  type: "linear",
  angle: 90,
  stops: [
    { id: 1, color: DEFAULT_COLOR, position: 0 },
    { id: 2, color: WHITE, position: 100 }
  ]
})

interface ColorDraftState {
  inputColor: string
  view: WorkbenchView
  gradient: GradientDraft
  /** Monotonic, so a removed stop's id is never handed to a new one. */
  nextStopId: number
  setInputColor: (inputColor: string) => void
  setView: (view: WorkbenchView) => void
  updateGradient: (patch: Partial<Omit<GradientDraft, "stops">>) => void
  setStops: (stops: GradientStop[]) => void
  addStop: (build: (id: number) => GradientStop) => void
  reset: () => void
}

const initialState = () => ({
  inputColor: DEFAULT_COLOR,
  view: "scale" as WorkbenchView,
  gradient: initialGradient(),
  nextStopId: 3
})

export const useColorDraftStore = create<ColorDraftState>()((set) => ({
  ...initialState(),
  setInputColor: (inputColor) => set({ inputColor }),
  setView: (view) => set({ view }),
  updateGradient: (patch) =>
    set((state) => ({ gradient: { ...state.gradient, ...patch } })),
  setStops: (stops) =>
    set((state) => ({ gradient: { ...state.gradient, stops } })),
  addStop: (build) =>
    set((state) => ({
      gradient: {
        ...state.gradient,
        stops: [...state.gradient.stops, build(state.nextStopId)]
      },
      nextStopId: state.nextStopId + 1
    })),
  reset: () => set(initialState())
}))
