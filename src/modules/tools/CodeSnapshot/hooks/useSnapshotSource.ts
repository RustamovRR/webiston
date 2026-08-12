"use client"

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState
} from "react"

import type { SnapshotOptions } from "../types"
import { detectLanguage } from "../utils/detect"
import { readDroppedFile } from "../utils/file-drop"
import { canFormat, formatCode } from "../utils/format"
import { resolveLanguage } from "../utils/highlight"

/**
 * How the code got here, and what that implies about its language.
 *
 * Three ways in — typed, pasted, dropped — and one way to tidy it up. They
 * belong together because they share one rule: whenever something OTHER than
 * the visitor's own choice changes the language, it has to say so and be
 * undoable.
 */

interface UseSnapshotSourceInput {
  code: string
  language: string
  setCode: Dispatch<SetStateAction<string>>
  setLanguage: Dispatch<SetStateAction<string>>
  setOptions: Dispatch<SetStateAction<SnapshotOptions>>
  onError: (error: string | null) => void
}

interface UseSnapshotSource {
  /**
   * The language the last paste or drop changed, and what it changed FROM.
   *
   * Present only while the notice is on screen. A detector that silently
   * replaces a choice the visitor made is a detector nobody trusts, so what it
   * did is stated and undoable.
   */
  detected: { from: string; to: string } | null
  undoDetection: () => void
  clearDetection: () => void
  /** Call with the text of a paste; switches the language when it is sure. */
  onPaste: (pasted: string) => void
  /** A file dragged onto the editor: its contents, language and name. */
  dropFile: (file: File) => Promise<void>
  /** Prettier, on the current code. False when it could not parse. */
  format: () => Promise<boolean>
  /** True while the plugin chunks are downloading — the first press is slow. */
  formatting: boolean
  /** Whether Prettier has a parser for the chosen language at all. */
  formattable: boolean
}

export function useSnapshotSource({
  code,
  language,
  setCode,
  setLanguage,
  setOptions,
  onError
}: UseSnapshotSourceInput): UseSnapshotSource {
  const [detected, setDetected] = useState<{
    from: string
    to: string
  } | null>(null)
  const [formatting, setFormatting] = useState(false)

  /**
   * Detect the language of a paste, and only of a paste.
   *
   * Not on every keystroke: half-typed code changes its apparent language as
   * it is written — `def` alone is Python, `def foo` still is, and a picker
   * that flickers between grammars while you type is unusable. A paste is a
   * complete thought, which is the only moment the evidence is worth reading.
   *
   * `detectLanguage` returns `null` whenever it is unsure, and that is
   * honoured exactly: no guess, no change, no notice.
   */
  const onPaste = useCallback(
    (pasted: string) => {
      const guess = detectLanguage(pasted)
      if (!guess || guess === language) return
      setDetected({ from: language, to: guess })
      setLanguage(guess)
    },
    [language, setLanguage]
  )

  const undoDetection = useCallback(() => {
    if (detected) setLanguage(detected.from)
    setDetected(null)
  }, [detected, setLanguage])

  const clearDetection = useCallback(() => setDetected(null), [])

  /**
   * A dropped file: code, language and window title in one gesture.
   *
   * The extension is trusted OVER the content scorer, and the order matters:
   * a `.rs` file is Rust because its author said so, and no amount of pattern
   * matching outranks that. `detectLanguage` is the fallback for the cases the
   * extension cannot answer — a `.txt` holding Python, or a file with no
   * extension at all.
   *
   * The filename also becomes the window title. That is the whole reason
   * anyone types in that field, and here it is already known.
   */
  const dropFile = useCallback(
    async (file: File) => {
      let dropped: Awaited<ReturnType<typeof readDroppedFile>>
      try {
        dropped = await readDroppedFile(file)
      } catch (failure) {
        onError(
          failure instanceof Error && failure.message
            ? failure.message
            : "unreadable"
        )
        return
      }

      const next = dropped.language ?? detectLanguage(dropped.code)
      setCode(dropped.code)
      setOptions((current) => ({ ...current, title: dropped.title }))
      onError(null)
      if (next && next !== language) {
        setDetected({ from: language, to: next })
        setLanguage(next)
      }
    },
    [language, setCode, setLanguage, setOptions, onError]
  )

  /**
   * Format the code in place.
   *
   * The language is resolved first: the picker hands over canonical ids, but
   * URL state and paste-detection will not, and `canFormat("ts")` is false
   * while `canFormat("typescript")` is true — a silently dead button.
   *
   * A parse failure is REPORTED, not swallowed. Half-pasted code is the normal
   * state of a snippet, so "this does not parse" is the single most useful
   * thing this button can say when it cannot do its job.
   */
  const format = useCallback(async () => {
    const lang = resolveLanguage(language)
    if (!canFormat(lang)) return false
    setFormatting(true)
    try {
      setCode(await formatCode(code, lang))
      onError(null)
      return true
    } catch {
      onError("format")
      return false
    } finally {
      setFormatting(false)
    }
  }, [code, language, setCode, onError])

  return {
    detected,
    undoDetection,
    clearDetection,
    onPaste,
    dropFile,
    format,
    formatting,
    formattable: canFormat(resolveLanguage(language))
  }
}
