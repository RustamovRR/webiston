import { create } from "zustand"

import type { MetaDraft, OutputFormat, Platform, TwitterCard } from "../types"

/**
 * The form, at module scope.
 *
 * Switching locale is a soft navigation that REMOUNTS the tree, so anything in
 * `useState` starts over — and this is the tool in the suite where that costs
 * the most: ten fields of hand-written marketing copy, gone on a language
 * click. The 8th tool to get this treatment.
 *
 * Not persisted, like the rest of the suite.
 */

interface OgDraftState extends MetaDraft {
  platform: Platform
  output: OutputFormat
  setField: <Key extends keyof MetaDraft>(
    field: Key,
    value: MetaDraft[Key]
  ) => void
  setPlatform: (platform: Platform) => void
  setOutput: (output: OutputFormat) => void
  loadSample: (sample: MetaDraft) => void
  clear: () => void
  /** Back to defaults, including the settings. Used by the tests. */
  reset: () => void
}

/**
 * An empty form, with the three fields that are a CHOICE rather than a value
 * set to the answer most pages want.
 *
 * The old default put `https://webiston.uz/logo.png` and
 * `https://webiston.uz/tools` into the image and URL fields of every visitor's
 * form — so anyone who did not notice published this site's logo as their own
 * share card.
 */
const initialState: MetaDraft & { platform: Platform; output: OutputFormat } = {
  title: "",
  description: "",
  image: "",
  imageAlt: "",
  url: "",
  siteName: "",
  type: "website",
  locale: "uz_UZ",
  twitterCard: "summary_large_image" as TwitterCard,
  twitterSite: "",
  platform: "telegram",
  output: "html"
}

export const useOgDraftStore = create<OgDraftState>()((set) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value } as Partial<OgDraftState>),
  setPlatform: (platform) => set({ platform }),
  setOutput: (output) => set({ output }),
  loadSample: (sample) => set(sample),
  // Clears the WORK. The preview platform and the output format are settings.
  clear: () =>
    set({
      title: "",
      description: "",
      image: "",
      imageAlt: "",
      url: "",
      siteName: "",
      type: "website",
      locale: "uz_UZ",
      twitterCard: "summary_large_image",
      twitterSite: ""
    }),
  reset: () => set(initialState)
}))
