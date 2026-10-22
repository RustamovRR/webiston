"use client"

/**
 * The converter's state: the text, the alphabet it is going into, and the
 * result.
 *
 * The conversion itself is not here — it lives in `@webiston/transliteration`,
 * and `toUzbekScript` reads all three alphabets in any mix, so the source never
 * has to be declared. It is still DETECTED, for three jobs: resolving "auto",
 * naming the source panel, and knowing where swap should send the text back.
 *
 * What used to be here was a private heuristic that fired only when the text
 * length changed by more than five characters, so typing Cyrillic never
 * switched direction, replacing a selection with the same number of characters
 * never switched, and deleting a paragraph counted as a paste and overrode a
 * direction the user had chosen. Detection now runs on every change.
 */

import {
  detectUzbekScript,
  findPreservedTerms,
  toUzbekScript,
  type UzbekScript
} from "@webiston/transliteration"
import { useDebounceValue } from "usehooks-ts"

import {
  type ConverterPage,
  DEFAULT_PREFERENCE,
  SCRIPT_PREFERENCES
} from "../constants"
import { useLatinCyrillicDraftStore, useTransliterationStore } from "../stores"
import type { ScriptPreference } from "../types"

/**
 * Long enough to coalesce a burst of keystrokes, short enough to feel live.
 *
 * Conversion itself is not the reason for the delay — the engine does 50,000
 * characters in ~10 ms. Re-rendering a large result into the DOM is. At
 * ordinary typing speed the result appears to update with the caret.
 */
const DEBOUNCE_DELAY = 90

/**
 * What an empty source panel should be labelled with: the alphabet a person
 * converting INTO the target is most likely to type. "→ Lotin" waits for
 * Cyrillic; the other two wait for the 1995 Latin everybody types today.
 */
const EXPECTED_SOURCE: Record<UzbekScript, UzbekScript> = {
  cyrillic: "latin",
  latin: "cyrillic",
  "latin-2027": "latin"
}

/**
 * "Auto" is the Latin ↔ Cyrillic flip, by the rule the package's
 * `resolveDirection` uses for the extension: Cyrillic-dominant text goes to
 * the 1995 Latin, everything else to Cyrillic. The new alphabet is never a
 * guess — until the spelling rules and the transition programme are out, it
 * is something a person picks, not something the page decides for them.
 */
function resolveTarget(
  preference: ScriptPreference,
  sourceScript: UzbekScript
): UzbekScript {
  if (preference !== "auto") return preference
  return sourceScript === "cyrillic" ? "latin" : "cyrillic"
}

/**
 * Only today's options are trusted from storage. zustand runs `migrate` on a
 * version MISMATCH only, so a v4 record holding a value this build does not
 * know — a later deploy's new option, then a rollback — or a `null` map would
 * reach `toUzbekScript` as-is and throw on the first keystroke of every visit.
 */
const isScriptPreference = (value: unknown): value is ScriptPreference =>
  SCRIPT_PREFERENCES.some((option) => option === value)

export function useLatinCyrillic(page: ConverterPage) {
  const preference = useTransliterationStore((s) => {
    const stored = s.preferences?.[page]
    return isScriptPreference(stored) ? stored : DEFAULT_PREFERENCE[page]
  })
  const storePreference = useTransliterationStore((s) => s.setPreference)
  const exceptions = useTransliterationStore((s) => s.exceptions)
  const addException = useTransliterationStore((s) => s.addException)
  const removeException = useTransliterationStore((s) => s.removeException)
  const clearExceptions = useTransliterationStore((s) => s.clearExceptions)

  // Above the tree, so switching language does not throw the text away — see
  // `stores/draftStore.ts`. Shared by both routes on purpose: text typed on
  // one page is still there after following the link to the other.
  const sourceText = useLatinCyrillicDraftStore((s) => s.sourceText)
  const setSourceText = useLatinCyrillicDraftStore((s) => s.setSourceText)

  const [debouncedText] = useDebounceValue(sourceText, DEBOUNCE_DELAY)

  const options = { preserve: exceptions }

  // React Compiler memoises these; they re-run only when the text, the
  // preference or the exception list changes.
  const detectedScript = detectUzbekScript(debouncedText)
  const target = resolveTarget(preference, detectedScript)
  const convertedText = toUzbekScript(debouncedText, target, options)

  // What the engine left alone, so the UI can say so instead of leaving the
  // user to guess whether an unconverted word is a feature or a bug.
  const preservedTerms = findPreservedTerms(debouncedText, options)

  const setPreference = (next: ScriptPreference) => storePreference(page, next)

  /**
   * Swap puts the result in the input and converts it back to the alphabet
   * it started in.
   *
   * It pins the preference to that alphabet. Leaving it on "auto" would make
   * the swap a no-op: auto would look at the text it was just handed and
   * resolve straight back to where it came from — and for the new alphabet,
   * auto would not go back there at all.
   *
   * When the text was ALREADY in the target — "Lotin" pinned over Latin, or a
   * half-converted document that one ğ makes read as new-alphabet — going
   * "back" to it is the same switch position and the button would do
   * nothing. It goes to the alphabet that target is usually fed from instead.
   */
  const swap = () => {
    if (!convertedText) return
    setPreference(
      detectedScript === target ? EXPECTED_SOURCE[target] : detectedScript
    )
    setSourceText(convertedText)
  }

  const clear = () => setSourceText("")

  return {
    sourceText,
    convertedText,
    /** What the user chose — the route's default until they say otherwise. */
    preference,
    /** The alphabet the result is in: the preference, with "auto" resolved. */
    target,
    /** The alphabet the source is in, for its label and placeholder. */
    sourceScript: debouncedText ? detectedScript : EXPECTED_SOURCE[target],
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
