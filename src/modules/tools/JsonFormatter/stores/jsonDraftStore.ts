import { create } from "zustand"

import { DEFAULT_INDENT, type IndentOption } from "../constants"

/**
 * What the visitor is working on, held above the component tree.
 *
 * Third tool with the same fix, and the same reason each time: switching
 * language changes the `[locale]` segment, which UNMOUNTS the tool, and
 * `useState("")` starts over. Verified on the QR generator that the JS context
 * survives the switch — it is a soft navigation — so module state is enough.
 *
 * Not persisted. A pasted API response is somebody's data; it belongs in
 * memory for as long as the tab is open and nowhere else.
 */

export type ViewMode = "formatted" | "minified"

interface JsonDraftState {
  input: string
  indent: IndentOption
  view: ViewMode
  showLineNumbers: boolean
  setInput: (input: string) => void
  setIndent: (indent: IndentOption) => void
  setView: (view: ViewMode) => void
  toggleLineNumbers: () => void
  clear: () => void
}

export const useJsonDraftStore = create<JsonDraftState>()((set) => ({
  input: "",
  indent: DEFAULT_INDENT,
  view: "formatted",
  showLineNumbers: true,
  setInput: (input) => set({ input }),
  setIndent: (indent) => set({ indent }),
  setView: (view) => set({ view }),
  toggleLineNumbers: () =>
    set((state) => ({ showLineNumbers: !state.showLineNumbers })),
  // The text goes; the view preferences stay. Clearing is "I am done with
  // this payload", not "forget how I like my output".
  clear: () => set({ input: "" })
}))
