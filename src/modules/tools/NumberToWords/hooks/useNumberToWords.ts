"use client"

import { useCallback, useMemo, useState } from "react"
import { formatAmount, parseAmount } from "@/lib/uzbek-number-words/amount"
import { amountToWords, capitalise } from "@/lib/uzbek-number-words/words"
import { DEFAULT_MODE, type OutputMode } from "../constants"
import type { ConversionState } from "../types"

interface UseNumberToWords {
  input: string
  setInput: (input: string) => void
  mode: OutputMode
  setMode: (mode: OutputMode) => void
  /** True writes the first letter in caps, the way a document does. */
  capitalised: boolean
  setCapitalised: (capitalised: boolean) => void
  /**
   * True wraps the words the way a contract line does: digits first, words in
   * brackets — `1 250 000,50 (Bir million ikki yuz ellik ming so'm ellik
   * tiyin)`. That string IS the deliverable for most visitors: it gets pasted
   * into the hujjat as-is, so producing it here saves them assembling it by
   * hand from two copies.
   */
  documentFormat: boolean
  setDocumentFormat: (documentFormat: boolean) => void
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
  const [documentFormat, setDocumentFormat] = useState(false)

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

    const formatted = formatAmount(parsed.amount)
    const cased = capitalised
      ? {
          latin: capitalise(words.latin),
          cyrillic: capitalise(words.cyrillic)
        }
      : words

    /**
     * The document line uses ORDINARY spaces and an ASCII minus, not the
     * display echo's U+202F and U+2212. The echo is typography; this string is
     * headed for a form field in 1C or a bank portal, and an invisible
     * non-ASCII space inside a pasted amount is exactly the kind of thing
     * their validators reject with an error nobody can see the cause of.
     */
    const shaped = documentFormat
      ? (() => {
          // Escapes, not the characters themselves — U+202F and U+2212 are
          // indistinguishable from a space and a hyphen in an editor, and the
          // parser's own grouping regex earned the same rule the hard way.
          const digits = formatted
            .replace(/\u202f/g, " ")
            .replace(/\u2212/g, "-")
          return {
            latin: `${digits} (${cased.latin})`,
            cyrillic: `${digits} (${cased.cyrillic})`
          }
        })()
      : cased

    return {
      status: "ready",
      formatted,
      words: shaped,
      fractionIgnored: mode === "plain" && parsed.amount.fraction > 0
    }
  }, [input, mode, capitalised, documentFormat])

  const clear = useCallback(() => setInput(""), [])

  return {
    input,
    setInput,
    mode,
    setMode,
    capitalised,
    setCapitalised,
    documentFormat,
    setDocumentFormat,
    state,
    clear
  }
}
