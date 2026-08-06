import { create } from "zustand"

import {
  DEFAULT_AMOUNT,
  DEFAULT_BYTES,
  MAX_AMOUNT,
  MAX_BYTES,
  MIN_AMOUNT
} from "../constants"
import type { LoremBank, LoremFormat, LoremUnit } from "../types"

/**
 * The tool's work, at module scope.
 *
 * Switching locale remounts the tree, so `useState` starts over — the 9th tool
 * to get this treatment. Not persisted, like the rest of the suite.
 */

interface LoremDraftState {
  unit: LoremUnit
  amount: number
  bank: LoremBank
  format: LoremFormat
  startWithLorem: boolean
  /** Always PLAIN text. HTML is derived — see `applyFormat`. */
  text: string
  /** The `unit:amount:bank:startWithLorem` the current text was made for. */
  generatedFor: string | null
  setUnit: (unit: LoremUnit) => void
  setAmount: (amount: number) => void
  setBank: (bank: LoremBank) => void
  setFormat: (format: LoremFormat) => void
  setStartWithLorem: (value: boolean) => void
  setText: (text: string, generatedFor: string) => void
  clear: () => void
  reset: () => void
}

const initialState = {
  unit: "paragraphs" as LoremUnit,
  amount: DEFAULT_AMOUNT,
  bank: "cicero" as LoremBank,
  format: "plain" as LoremFormat,
  startWithLorem: true,
  text: "",
  generatedFor: null as string | null
}

/**
 * The ceiling depends on what is being counted: 100 paragraphs is a wall of
 * text, while 100 bytes is barely a sentence.
 */
function clampAmount(amount: number, unit: LoremUnit): number {
  if (!Number.isFinite(amount)) return MIN_AMOUNT
  const max = unit === "bytes" ? MAX_BYTES : MAX_AMOUNT
  return Math.min(max, Math.max(MIN_AMOUNT, Math.trunc(amount)))
}

export const useLoremDraftStore = create<LoremDraftState>()((set) => ({
  ...initialState,
  /**
   * The amount means a different thing under each unit, so it moves with it.
   *
   * Switching TO bytes with 3 in the field would ask for a 3-byte document.
   * Switching AWAY from 512 bytes would clamp to the maximum and quietly
   * generate 100 paragraphs — 40,000 characters nobody asked for, which is
   * how the first version of this behaved.
   */
  setUnit: (unit) =>
    set((state) => {
      if (unit === state.unit) return { unit }
      if (unit === "bytes") return { unit, amount: DEFAULT_BYTES }
      if (state.unit === "bytes") return { unit, amount: DEFAULT_AMOUNT }
      return { unit, amount: clampAmount(state.amount, unit) }
    }),
  setAmount: (amount) =>
    set((state) => ({ amount: clampAmount(amount, state.unit) })),
  setBank: (bank) => set({ bank }),
  setFormat: (format) => set({ format }),
  setStartWithLorem: (startWithLorem) => set({ startWithLorem }),
  setText: (text, generatedFor) => set({ text, generatedFor }),
  clear: () => set({ text: "", generatedFor: null }),
  reset: () => set(initialState)
}))
