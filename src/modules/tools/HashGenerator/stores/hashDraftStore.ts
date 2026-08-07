import { create } from "zustand"

import type { DigestFormat, FileSource } from "../types"

/**
 * What the visitor is currently working on, above the component tree.
 *
 * The same locale-remount fix every refactored tool carries: switching
 * language remounts the `[locale]` segment and `useState` starts over, so a
 * pasted payload and a half-typed HMAC key vanished on a language click.
 *
 * Deliberately NOT persisted. The two fields most likely to hold a secret are
 * the ones this tool is for: an HMAC signing key, and whatever text somebody
 * decided to hash.
 */

interface HashDraftState {
  text: string
  /** Set when a file is loaded; the file's BYTES are what gets hashed. */
  file: FileSource | null
  format: DigestFormat
  /** The checksum to compare against — empty means "not verifying". */
  expected: string
  hmacEnabled: boolean
  hmacKey: string
  setText: (text: string) => void
  setFile: (file: FileSource | null) => void
  setFormat: (format: DigestFormat) => void
  setExpected: (expected: string) => void
  setHmacEnabled: (enabled: boolean) => void
  setHmacKey: (key: string) => void
  /** Clears the WORK. Mode, format and key are settings and survive it. */
  clearWork: () => void
  reset: () => void
}

const initialState = () => ({
  text: "",
  file: null,
  format: "hex" as DigestFormat,
  expected: "",
  hmacEnabled: false,
  hmacKey: ""
})

export const useHashDraftStore = create<HashDraftState>()((set) => ({
  ...initialState(),
  // Text and file are one source, so setting either clears the other. Holding
  // both would leave the panel showing text while the digests describe a file.
  setText: (text) => set({ text, file: null }),
  setFile: (file) => set({ file, text: "" }),
  setFormat: (format) => set({ format }),
  setExpected: (expected) => set({ expected }),
  setHmacEnabled: (hmacEnabled) => set({ hmacEnabled }),
  setHmacKey: (hmacKey) => set({ hmacKey }),
  // Escape and the Clear button drop what you were hashing — not the mode you
  // put the tool in, the output format you chose, or a signing key you are
  // part-way through checking a batch of payloads with.
  clearWork: () => set({ text: "", file: null, expected: "" }),
  reset: () => set(initialState())
}))
