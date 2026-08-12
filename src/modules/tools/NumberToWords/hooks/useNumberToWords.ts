"use client"

import { useCallback, useMemo, useState } from "react"

import { DEFAULT_MODE, type OutputMode } from "../constants"
import type { ConversionState } from "../types"
import { formatAmount, parseAmount } from "../utils/amount"
import { amountToWords, capitalise } from "../utils/words"

interface UseNumberToWords {
  input: string
  setInput: (input: string) => void
  mode: OutputMode
  setMode: (mode: OutputMode) => void
  /** True writes the first letter in caps, the way a document does. */
  capitalised: boolean
  setCapitalised: (capitalised: boolean) => void
  state: ConversionState
  clear: () => void
}

/**
 * Parse, name, transliterate — all of it during render.
 *
 * No effect, no debounce, no state beyond what the visitor typed. Naming a
 * sum is string arithmetic on at most eighteen digits; it finishes in
 * microseconds, so deriving it in a `useMemo` keeps the words and the field
 * in the same frame by construction. There is no window in which the box
 * shows one amount and the words another — which is the failure mode that
 * matters most here, because the words are what gets copied onto a document.
 */
export function useNumberToWords(): UseNumberToWords {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<OutputMode>(DEFAULT_MODE)
  const [capitalised, setCapitalised] = useState(true)

  const state = useMemo<ConversionState>(() => {
    const parsed = parseAmount(input)
    if (!parsed.ok) {
      return parsed.error === "empty"
        ? { status: "idle" }
        : { status: "error", error: parsed.error }
    }

    const words = amountToWords(parsed.amount, mode)
    // `null` means the value is past the scale table. The parser has its own
    // digit cap, so this is the belt to that braces — and either way the
    // visitor is told, never handed a half-named sum.
    if (!words) return { status: "error", error: "tooLarge" }

    return {
      status: "ready",
      formatted: formatAmount(parsed.amount),
      words: capitalised
        ? {
            latin: capitalise(words.latin),
            cyrillic: capitalise(words.cyrillic)
          }
        : words,
      fractionIgnored: mode === "plain" && parsed.amount.fraction > 0
    }
  }, [input, mode, capitalised])

  const clear = useCallback(() => setInput(""), [])

  return {
    input,
    setInput,
    mode,
    setMode,
    capitalised,
    setCapitalised,
    state,
    clear
  }
}
