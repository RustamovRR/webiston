"use client"

import { useLayoutEffect, useRef, useState } from "react"

import {
  DEFAULT_THEME,
  FALLBACK_BACKGROUND,
  FALLBACK_FOREGROUND,
  LIVE_HIGHLIGHT_MAX_CHARS
} from "../constants"
import type { CodeLine } from "../types"
import { highlightSync, highlightToLines } from "../utils/highlight"
import { retokeniseDelay } from "../utils/schedule"

/**
 * Coloured tokens for the code on screen, kept as live as they can afford.
 *
 * The picture IS the editor in this tool — the textarea layered over the canvas
 * has transparent glyphs — so these tokens are the only text a visitor can see.
 * That makes the delivery schedule a correctness question, not a performance
 * one, and it is the whole subject of this file.
 */

export interface SnapshotTokens {
  lines: CodeLine[]
  foreground: string
  editorBackground: string
  /**
   * The theme these colours came FROM.
   *
   * Carried with the tokens rather than tracked beside them, because the
   * painter has to be able to tell "current" from "one theme behind": while a
   * newly picked theme is still downloading, the tokens in hand belong to the
   * old one, and painting them at the new geometry is a visible wrong frame.
   */
  theme: string
  /**
   * True when the CODE changed, as opposed to a setting.
   *
   * The painter cross-fades a repaint, and a character that dissolves into
   * place reads as lag rather than polish — so this is how it knows not to.
   * It covers formatting and a dropped file as well as typing, which is
   * deliberate: all three replace the text, and none of them wants a 200ms
   * dissolve over the words that just arrived.
   */
  typed: boolean
}

interface UseSnapshotTokensInput {
  code: string
  language: string
  theme: string
  /** Called with `"highlight"` when a grammar could not be fetched. */
  onError: (error: string | null) => void
}

const EMPTY: SnapshotTokens = {
  lines: [],
  foreground: FALLBACK_FOREGROUND,
  editorBackground: FALLBACK_BACKGROUND,
  theme: DEFAULT_THEME,
  typed: false
}

export function useSnapshotTokens({
  code,
  language,
  theme,
  onError
}: UseSnapshotTokensInput): SnapshotTokens {
  const [tokens, setTokens] = useState<SnapshotTokens>(EMPTY)

  const previousCode = useRef(code)
  /** When the canvas last received a fresh set, for the refresh ceiling. */
  const deliveredAt = useRef(0)

  /**
   * A LAYOUT effect, not a passive one.
   *
   * The chain that has to complete before the browser draws is: tokenise →
   * `setTokens` → re-render → paint. React runs a layout effect before the
   * paint and flushes any `setState` it makes synchronously, so the whole chain
   * lands in the frame the keystroke arrived in. As a passive effect the same
   * work happens one frame later, and for that frame the caret sits past a
   * glyph that has not been drawn — a small version of the exact defect this
   * file exists to remove.
   */
  useLayoutEffect(() => {
    const typed = previousCode.current !== code
    previousCode.current = code

    /**
     * The live path: no timer, no promise, same task as the keystroke.
     *
     * Everything `highlightSync` needs is already in memory after the first
     * tokenisation of a session, and `codeToTokens` is synchronous. The size
     * gate is measured — see `LIVE_HIGHLIGHT_MAX_CHARS`.
     */
    if (code.length <= LIVE_HIGHLIGHT_MAX_CHARS) {
      const immediate = highlightSync(code, language, theme)
      if (immediate) {
        deliveredAt.current = Date.now()
        setTokens({
          lines: immediate.lines,
          foreground: immediate.foreground,
          editorBackground: immediate.background,
          theme,
          typed
        })
        onError(null)
        return
      }
    }

    // The deferred path: a first use, or a document too big to keep up with.
    // The schedule — a debounce with a ceiling — is in `utils/schedule.ts`,
    // where it can be tested against a clock this file cannot control.
    const delay = retokeniseDelay(typed, Date.now() - deliveredAt.current)

    /**
     * Two edits in flight can settle in either order — a language whose grammar
     * is already cached resolves immediately while the previous one is still
     * fetching. Without the `stale` guard the older tokens win and the canvas
     * shows the previous snippet, intermittently and only on slow networks.
     */
    let stale = false
    const timer = setTimeout(() => {
      highlightToLines(code, language, theme)
        .then((result) => {
          if (stale) return
          deliveredAt.current = Date.now()
          // One update, carrying the theme it was produced under. Two separate
          // ones let a paint slip between them.
          setTokens({
            lines: result.lines,
            foreground: result.foreground,
            editorBackground: result.background,
            theme,
            typed
          })
          onError(null)
        })
        .catch(() => {
          // The last good tokens stay on screen — a grammar that failed to
          // download must not blank the picture. But it is SAID, because the
          // silent version leaves the reader picking a theme and watching
          // nothing change, with no way to know a retry is what they need.
          if (!stale) onError("highlight")
        })
    }, delay)

    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [code, language, theme, onError])

  return tokens
}
