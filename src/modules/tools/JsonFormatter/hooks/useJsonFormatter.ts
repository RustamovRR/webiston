"use client"

import { useCallback, useMemo, useState } from "react"
import { useDebounceValue } from "usehooks-ts"

import {
  ACCEPTED_FILE_TYPES,
  isAcceptedFile,
  MAX_FILE_BYTES,
  SAMPLE_JSON
} from "../constants"
import { useJsonDraftStore } from "../stores/jsonDraftStore"
import { analyseJson, byteSize } from "../utils/json"

/**
 * The formatter's state.
 *
 * Two things moved out of here and both were defects, not tidiness:
 *
 * - The parse ran inside a `useMemo` that called `useTranslations`, so the
 *   locale was an input to parsing JSON and the logic could not be tested.
 *   It is `analyseJson` now, and it has tests.
 * - File rejection was three `alert()` calls carrying hardcoded Uzbek —
 *   while `Errors.fileTypeError`, `fileSizeError` and `fileReadError` already
 *   existed in BOTH message bundles, unused. A browser alert also blocks the
 *   page and cannot be styled or dismissed by keyboard the way the rest of the
 *   site's messages can.
 */

/** Which rejection to show, or null. Translated by the component. */
export type FileErrorKey = "fileTypeError" | "fileSizeError" | "fileReadError"

export function useJsonFormatter() {
  const input = useJsonDraftStore((state) => state.input)
  const indent = useJsonDraftStore((state) => state.indent)
  const view = useJsonDraftStore((state) => state.view)
  const showLineNumbers = useJsonDraftStore((state) => state.showLineNumbers)
  const setInput = useJsonDraftStore((state) => state.setInput)
  const setIndent = useJsonDraftStore((state) => state.setIndent)
  const setView = useJsonDraftStore((state) => state.setView)
  const toggleLineNumbers = useJsonDraftStore(
    (state) => state.toggleLineNumbers
  )
  const clear = useJsonDraftStore((state) => state.clear)

  const [fileError, setFileError] = useState<FileErrorKey | null>(null)

  /**
   * The textarea stays live; the ANALYSIS trails it. Parse + two stringifies
   * + the stats walk ran on every keystroke, synchronously — measured on a
   * 384 KB document, ~94 ms per keystroke and 878 ms on paste, all of it
   * blocking the caret. 150 ms is above the latin-cyrillic tool's 90 because
   * the work here is an order heavier.
   */
  const [analysedInput] = useDebounceValue(input, 150)

  const result = useMemo(
    () => analyseJson(analysedInput, indent),
    [analysedInput, indent]
  )

  // The tree is a VIEW of the formatted document, not a third serialisation:
  // copy and download from tree view give the formatted text.
  const output = view === "minified" ? result.minified : result.formatted

  const readFile = useCallback(
    (file: File) => {
      setFileError(null)

      if (!isAcceptedFile(file)) {
        setFileError("fileTypeError")
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        setFileError("fileSizeError")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => setInput(String(event.target?.result ?? ""))
      reader.onerror = () => setFileError("fileReadError")
      reader.readAsText(file)
    },
    [setInput]
  )

  const download = useCallback(() => {
    if (!result.isValid || !output) return

    const blob = new Blob([output], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `webiston-${view}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    // One frame, so the download has started before the blob is released.
    requestAnimationFrame(() => URL.revokeObjectURL(url))
  }, [result.isValid, output, view])

  const loadSample = useCallback(() => {
    setFileError(null)
    setInput(JSON.stringify(SAMPLE_JSON, null, 2))
  }, [setInput])

  const clearAll = useCallback(() => {
    setFileError(null)
    clear()
  }, [clear])

  return {
    input,
    setInput,
    indent,
    setIndent,
    view,
    setView,
    showLineNumbers,
    toggleLineNumbers,
    result,
    /**
     * Whether `result` describes a real document. The component must gate the
     * valid/invalid readouts on THIS, not on `input`: during the debounce lag
     * the input is ahead of the analysis, and judging fresh input by a stale
     * result flashed the error card on the first keystroke.
     */
    hasAnalysis: analysedInput.trim().length > 0,
    output,
    outputBytes: byteSize(output),
    fileError,
    acceptedFileTypes: ACCEPTED_FILE_TYPES,
    readFile,
    download,
    loadSample,
    clear: clearAll
  }
}
