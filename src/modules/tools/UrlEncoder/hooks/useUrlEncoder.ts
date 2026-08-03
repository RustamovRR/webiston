"use client"

import { useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"

import { analyzeUrl } from "@/lib/utils"

import {
  MAX_FILE_BYTES,
  SAMPLE_KEYS,
  SAMPLE_VALUES,
  SUPPORTED_FILE_TYPES
} from "../constants"
import { useUrlDraftStore } from "../stores/urlDraftStore"
import type { FileFailure, UrlSample } from "../types"
import { convert, readQuery } from "../utils/urlCodec"

/**
 * The encoder's state and everything derived from it.
 *
 * What the rewrite removed, each a defect and not tidiness:
 *
 * - **`alert()`, three times** — the finding already closed in the JSON
 *   formatter, the Base64 converter and the JWT decoder.
 * - **`throw` inside `reader.onerror`**, the third occurrence of the same bug:
 *   the callback is asynchronous, so the surrounding `try/catch` never sees it
 *   and `setIsProcessing(false)` never runs. `FileReader` is gone.
 * - **A private `analyzeUrl`** sitting beside the one `lib/utils/url.ts`
 *   already exports.
 * - **`inputStats` / `outputStats`** counted words and lines of a URL. A URL
 *   has no spaces and no newlines, so both numbers were always 1.
 * - **Two file limits that disagreed by 10x** — a 10 MB upload accepted, then
 *   refused by a 1 MB text ceiling after it had been read.
 * - **`handleModeSwitch` re-ran the conversion by hand**, duplicating the
 *   maths the memo above it had already done.
 */

export function useUrlEncoder() {
  const t = useTranslations("UrlEncoderPage")
  const tSamples = useTranslations("UrlEncoderPage.Samples")

  const input = useUrlDraftStore((state) => state.input)
  const setInput = useUrlDraftStore((state) => state.setInput)
  const mode = useUrlDraftStore((state) => state.mode)
  const setMode = useUrlDraftStore((state) => state.setMode)
  const scope = useUrlDraftStore((state) => state.scope)
  const setScope = useUrlDraftStore((state) => state.setScope)

  const [isProcessing, setIsProcessing] = useState(false)
  const [fileError, setFileError] = useState<FileFailure | null>(null)

  const samples = useMemo<UrlSample[]>(
    () =>
      SAMPLE_KEYS.map((key) => ({
        key,
        label: tSamples(key),
        value: SAMPLE_VALUES[key]
      })),
    [tSamples]
  )

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" }
    const converted = convert(input, mode, scope)
    return converted.ok
      ? { output: converted.output, error: "" }
      : { output: "", error: t(`Errors.${converted.reason}`) }
  }, [input, mode, scope, t])

  /**
   * The breakdown, computed from whichever side is a readable URL.
   *
   * This is the half of the tool the old version had the pieces for and never
   * finished: it parsed the decoded output, rendered protocol/host/path/search
   * as four rows, and left the query string as one opaque `?q=hello%20world`
   * blob — the exact thing a person opened a URL tool to read.
   */
  const breakdown = useMemo(() => {
    const candidate = result.output || input
    if (!candidate.trim()) return null
    const info = analyzeUrl(candidate.trim())
    if (!info?.isValidUrl) return null
    return { ...info, query: readQuery(info.search ?? "") }
  }, [result.output, input])

  /**
   * The arrow takes the RESULT back as input. `setMode` on its own just picks
   * a direction — two controls, two jobs, the distinction the Base64 tool had
   * to be corrected on.
   */
  const switchMode = useCallback(() => {
    setMode(mode === "encode" ? "decode" : "encode")
    if (result.output) setInput(result.output)
  }, [mode, result.output, setMode, setInput])

  const clear = useCallback(() => {
    setInput("")
    setFileError(null)
  }, [setInput])

  const loadSample = useCallback(
    (value: string) => {
      setInput(value)
      setFileError(null)
    },
    [setInput]
  )

  const readFile = useCallback(
    async (file: File) => {
      setFileError(null)

      if (file.size > MAX_FILE_BYTES) {
        setFileError("tooLarge")
        return
      }
      if (
        !SUPPORTED_FILE_TYPES.includes(file.type) &&
        !/\.(txt|json)$/i.test(file.name)
      ) {
        setFileError("unsupported")
        return
      }

      setIsProcessing(true)
      try {
        setInput((await file.text()).trim())
      } catch {
        setFileError("unreadable")
      } finally {
        setIsProcessing(false)
      }
    },
    [setInput]
  )

  const download = useCallback(() => {
    if (!result.output) return
    const blob = new Blob([result.output], {
      type: "text/plain; charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${t(`Download.${mode}`)}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [result.output, mode, t])

  return {
    input,
    setInput,
    mode,
    setMode,
    scope,
    setScope,
    isProcessing,
    result,
    breakdown,
    fileError: fileError ? t(`Errors.${fileError}`) : "",
    samples,
    loadSample,
    switchMode,
    clear,
    readFile,
    download,
    canDownload: Boolean(result.output)
  }
}
