"use client"

/**
 * The converter's state: the text, which way it is going, and the result.
 *
 * The direction POLICY is not here — it lives in `@webiston/transliteration`
 * so the extension's popup, its in-page popover and its context menu resolve
 * direction exactly the way this page does. What used to be here was a private
 * heuristic that fired only when the text length changed by more than five
 * characters, so typing Cyrillic never switched direction, replacing a
 * selection with the same number of characters never switched, and deleting a
 * paragraph counted as a paste and overrode a direction the user had chosen.
 */

import {
  convertWithPreference,
  type DirectionPreference,
  findPreservedTerms,
  oppositeDirection
} from "@webiston/transliteration"
import { useState } from "react"
import { useDebounceValue } from "usehooks-ts"

import { useTransliterationStore } from "../stores"

/**
 * Long enough to coalesce a burst of keystrokes, short enough to feel live.
 *
 * Conversion itself is not the reason for the delay — the engine does 50,000
 * characters in ~10 ms. Re-rendering a large result into the DOM is. At
 * ordinary typing speed the result appears to update with the caret.
 */
const DEBOUNCE_DELAY = 90

export function useLatinCyrillic() {
  const preference = useTransliterationStore((s) => s.preference)
  const setPreference = useTransliterationStore((s) => s.setPreference)
  const exceptions = useTransliterationStore((s) => s.exceptions)
  const addException = useTransliterationStore((s) => s.addException)
  const removeException = useTransliterationStore((s) => s.removeException)
  const clearExceptions = useTransliterationStore((s) => s.clearExceptions)

  const [sourceText, setSourceText] = useState("")
  const [debouncedText] = useDebounceValue(sourceText, DEBOUNCE_DELAY)

  const options = { preserve: exceptions }

  // React Compiler memoises this; it re-runs only when the text, the
  // preference or the exception list changes.
  const { text: convertedText, direction } = convertWithPreference(
    debouncedText,
    preference,
    options
  )

  // What the engine left alone, so the UI can say so instead of leaving the
  // user to guess whether an unconverted word is a feature or a bug.
  const preservedTerms = findPreservedTerms(debouncedText, options)

  /**
   * Swap puts the result in the input and turns the conversion around.
   *
   * It also pins the preference to the direction being swapped TO. Leaving it
   * on "auto" would make the swap a no-op: auto would look at the text it was
   * just handed and resolve straight back to where it came from.
   */
  const swap = () => {
    if (!convertedText) return
    setPreference(oppositeDirection(direction))
    setSourceText(convertedText)
  }

  const clear = () => setSourceText("")

  return {
    sourceText,
    convertedText,
    /** What the user chose — "auto" until they say otherwise. */
    preference,
    /** What "auto" resolved to, for the panel labels. */
    direction,
    /** Distinct spans deliberately left unconverted — links, code, terms. */
    preservedTerms,
    /** The reader's own additions to that list. */
    exceptions,
    addException,
    removeException,
    clearExceptions,
    setPreference,
    setSourceText,
    swap,
    clear
  }
}

export type UseLatinCyrillicResult = ReturnType<typeof useLatinCyrillic>
export type { DirectionPreference }
