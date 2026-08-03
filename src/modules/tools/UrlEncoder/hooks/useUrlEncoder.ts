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
import {
  convert,
  detectMode,
  detectScope,
  isStillEncoded,
  readQuery
} from "../utils/urlCodec"

/**
 * The encoder's state and everything derived from it.
 *
 * The FIRST rebuild fixed the maths and got the product wrong: it turned the
 * value/whole-URL distinction into a decision the visitor had to take before
 * the tool would answer, which meant four combinations to understand and one
 * of them — decoding text that was never encoded — returns the input unchanged
 * and reads as "this tool does nothing". Reported, and correctly.
 *
 * So the tool decides and says what it decided. `preference` is `auto` by
 * default and `resolvedMode` is published so the UI can show the resolution,
 * which is the same call latin-cyrillic made with its "Avto" direction.
 *
 * Removed in the first rebuild and still gone: three `alert()` calls, a
 * `throw` inside `reader.onerror` (async — the `try/catch` never saw it), a
 * private `analyzeUrl` beside the one `lib/utils` exports, word and line
 * counts of a string that has neither, and two file limits that disagreed 10x.
 */

export function useUrlEncoder() {
  const t = useTranslations("UrlEncoderPage")
  const tSamples = useTranslations("UrlEncoderPage.Samples")

  const input = useUrlDraftStore((state) => state.input)
  const setInput = useUrlDraftStore((state) => state.setInput)
  const preference = useUrlDraftStore((state) => state.preference)
  const setPreference = useUrlDraftStore((state) => state.setPreference)
  const scopeOverride = useUrlDraftStore((state) => state.scopeOverride)
  const setScopeOverride = useUrlDraftStore((state) => state.setScopeOverride)

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

  const mode = preference === "auto" ? detectMode(input) : preference

  /**
   * Decoding never asks. `decodeURIComponent` plus `+`-as-space is what every
   * decoder does and what a person pasting a link expects; the `decodeURI`
   * variant, which preserves `%26`, is a specialist need and offering it as an
   * equal choice was half of what made the first version confusing.
   *
   * ENCODING genuinely has two answers, so that is the only place the control
   * appears — pre-set to whichever the input looks like.
   */
  const scope =
    mode === "decode" ? "value" : (scopeOverride ?? detectScope(input))

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" }
    const converted = convert(input, mode, scope)
    return converted.ok
      ? { output: converted.output, error: "" }
      : { output: "", error: t(`Errors.${converted.reason}`) }
  }, [input, mode, scope, t])

  /**
   * The two things the visitor most needs told, and neither was said before.
   *
   * `unchanged` is the state from the bug report: decoding something that was
   * never encoded returns it verbatim, which looks broken unless the page says
   * "there was nothing to decode".
   *
   * `doubleEncoded` is the `%2520` case — a URL that went through an encoder
   * twice, usually a redirect parameter or a proxy. The output still looks
   * like gibberish and nothing explains why, so it is the single hardest thing
   * for a person to work out unaided.
   */
  const notice = (() => {
    if (!input.trim() || result.error) return null
    if (result.output === input) {
      // Direction-specific wording. Encoding `hello` also returns it verbatim,
      // and "there was nothing to decode" is the wrong sentence for that.
      return mode === "decode"
        ? ("unchangedDecode" as const)
        : ("unchangedEncode" as const)
    }
    if (mode === "decode" && isStillEncoded(result.output)) {
      return "doubleEncoded" as const
    }
    return null
  })()

  /**
   * The structure is read from whichever side is still ENCODED.
   *
   * That is not a detail: a value containing `%26` is one parameter, and
   * `URLSearchParams` over the decoded text would see two. Parsing the encoded
   * form and decoding each value afterwards is the only order that keeps the
   * parameter count true.
   */
  const breakdown = useMemo(() => {
    // Both sides are candidates, encoded side first. Reading only the output
    // lost the panel entirely as soon as the scope was overridden to `value`,
    // because `https%3A%2F%2F…` is not a URL — even though the INPUT still
    // was one.
    const candidates =
      mode === "decode" ? [input, result.output] : [result.output, input]

    for (const candidate of candidates) {
      const trimmed = candidate.trim()
      if (!trimmed) continue
      const info = analyzeUrl(trimmed)
      if (info?.isValidUrl) {
        return { ...info, query: readQuery(info.search ?? "") }
      }
    }
    return null
  }, [mode, input, result.output])

  /** The arrow takes the result back as input and pins the opposite direction. */
  const swap = useCallback(() => {
    if (!result.output) return
    setPreference(mode === "encode" ? "decode" : "encode")
    setScopeOverride(null)
    setInput(result.output)
  }, [mode, result.output, setPreference, setScopeOverride, setInput])

  /** Offered when the output is still escaped — one click, no explanation. */
  const decodeAgain = useCallback(() => {
    if (!result.output) return
    setPreference("decode")
    setInput(result.output)
  }, [result.output, setPreference, setInput])

  const clear = useCallback(() => {
    setInput("")
    setScopeOverride(null)
    setFileError(null)
  }, [setInput, setScopeOverride])

  const loadSample = useCallback(
    (value: string) => {
      setInput(value)
      setScopeOverride(null)
      setFileError(null)
    },
    [setInput, setScopeOverride]
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
    preference,
    setPreference,
    /** What `preference` actually resolved to — shown, never hidden. */
    mode,
    scope,
    setScopeOverride,
    isProcessing,
    result,
    notice,
    breakdown,
    fileError: fileError ? t(`Errors.${fileError}`) : "",
    samples,
    loadSample,
    swap,
    decodeAgain,
    clear,
    readFile,
    download,
    canDownload: Boolean(result.output)
  }
}
