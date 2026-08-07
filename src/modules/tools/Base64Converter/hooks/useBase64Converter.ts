"use client"

import { useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"
import {
  byteLength,
  decodeBase64,
  encodeBase64,
  encodeBytes
} from "@/lib/utils"
import {
  MAX_FILE_BYTES,
  SAMPLE_KEYS,
  SAMPLE_TEXTS,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_TEXT_TYPES
} from "../constants"
import { useBase64DraftStore } from "../stores/base64DraftStore"
import type { Base64Sample, FileFailure } from "../types"

/**
 * The converter's state and everything derived from it.
 *
 * What the rewrite removed, each a defect and not tidiness:
 *
 * - **`alert()`, three times.** The same finding already closed in the JSON
 *   formatter: a modal that blocks the page to say a file was too big. Errors
 *   are values now, rendered inline with `role="alert"`.
 * - **Five hardcoded Uzbek sentences and an Uzbek download filename**, inside
 *   a hook, next to a translator that was already in scope. On /en the tool
 *   answered in Uzbek.
 * - **`throw` inside `reader.onerror`.** That callback runs asynchronously, so
 *   the surrounding `try/catch` never saw it: the throw escaped unhandled and
 *   `setIsProcessing(false)` never ran, leaving the tool stuck on "processing"
 *   until a reload. `FileReader` is gone entirely — `File` has promise-based
 *   `.text()` and `.arrayBuffer()`.
 * - **Images were encoded twice.** `readAsDataURL` yields base64 already; the
 *   handler stripped the `data:` prefix and put THAT in the input box, which
 *   the encode step then encoded again. The output was base64 of base64.
 */

/**
 * The source is text the visitor typed, or a file they dropped in.
 *
 * Modelling it explicitly is what fixes the double encode. An image has no
 * text form, so it cannot live in the input box — it is a source whose encoded
 * value IS the answer, computed once from the real bytes.
 */
type Source =
  | { kind: "text" }
  | { kind: "file"; name: string; encoded: string; bytes: number }

export function useBase64Converter() {
  const t = useTranslations("Base64ConverterPage")
  const tSamples = useTranslations("Base64ConverterPage.Samples")

  const input = useBase64DraftStore((state) => state.input)
  const setInputText = useBase64DraftStore((state) => state.setInput)
  const mode = useBase64DraftStore((state) => state.mode)
  const setMode = useBase64DraftStore((state) => state.setMode)
  const urlSafe = useBase64DraftStore((state) => state.urlSafe)
  const setUrlSafe = useBase64DraftStore((state) => state.setUrlSafe)

  const [isProcessing, setIsProcessing] = useState(false)
  const [fileError, setFileError] = useState<FileFailure | null>(null)
  const [source, setSource] = useState<Source>({ kind: "text" })

  /** Typing always returns the source to text — the file is no longer what is being converted. */
  const setInput = useCallback(
    (value: string) => {
      setInputText(value)
      setSource({ kind: "text" })
      setFileError(null)
    },
    [setInputText]
  )

  /**
   * Samples in the direction currently being worked in. The encoded halves are
   * DERIVED — they used to be a parallel hand-written table of four base64
   * strings, which is a table that can disagree with itself.
   */
  const samples = useMemo<Base64Sample[]>(
    () =>
      SAMPLE_KEYS.map((key) => ({
        key,
        label: tSamples(key),
        value:
          mode === "encode"
            ? SAMPLE_TEXTS[key]
            : encodeBase64(SAMPLE_TEXTS[key])
      })),
    [mode, tSamples]
  )

  /**
   * Both byte counts live HERE and not in the view.
   *
   * The first version called `byteLength(result.output)` inside the render, so
   * every unrelated re-render ran a full `TextEncoder` pass over an output that
   * can be 13 MB. Encoded output is pure ASCII, so its byte count is just its
   * length — no pass needed at all in the direction where the string is
   * biggest.
   */
  const result = useMemo(() => {
    const empty = { output: "", error: "", bytes: 0, outputBytes: 0 }

    if (source.kind === "file") {
      return {
        output: source.encoded,
        error: "",
        bytes: source.bytes,
        outputBytes: source.encoded.length
      }
    }

    if (!input.trim()) return empty

    if (mode === "encode") {
      const output = encodeBase64(input, urlSafe)
      return {
        output,
        error: "",
        bytes: byteLength(input),
        outputBytes: output.length
      }
    }

    const decoded = decodeBase64(input)
    return decoded.ok
      ? {
          output: decoded.text,
          error: "",
          bytes: byteLength(input),
          outputBytes: decoded.byteCount
        }
      : { ...empty, error: t(`Errors.${decoded.reason}`) }
  }, [source, input, mode, urlSafe, t])

  /**
   * Two controls, two different jobs.
   *
   * `setMode` picks a direction and leaves the text alone. `switchMode` — the
   * arrow between the panels — takes the RESULT back as input and flips.
   * The first version wired the direction control to `switchMode` and ignored
   * the value it was handed, which is the exact defect it had just removed
   * from `GradientTabs`: correct only while there are exactly two options, and
   * it made choosing a direction silently rewrite the visitor's input.
   */
  const switchMode = useCallback(() => {
    setMode(mode === "encode" ? "decode" : "encode")
    if (result.output) setInput(result.output)
    else setSource({ kind: "text" })
  }, [mode, result.output, setMode, setInput])

  const clear = useCallback(() => {
    setInput("")
  }, [setInput])

  const readFile = useCallback(
    async (file: File) => {
      setFileError(null)

      if (file.size > MAX_FILE_BYTES) {
        setFileError("tooLarge")
        return
      }

      const isText = SUPPORTED_TEXT_TYPES.includes(file.type)
      const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)

      // Decoding an image is not a thing; encoding one is the only case where
      // the source is not text at all.
      if (!(isText || (mode === "encode" && isImage))) {
        setFileError("unsupported")
        return
      }

      setIsProcessing(true)
      try {
        if (isImage) {
          const bytes = new Uint8Array(await file.arrayBuffer())
          setInputText("")
          setSource({
            kind: "file",
            name: file.name,
            // A DATA URI, not the bare payload. Nobody encodes a PNG to admire
            // the base64 — they encode it to inline it in CSS or an `<img>`,
            // and the prefix is the half of that string a person cannot guess.
            // The decoder strips the prefix, so the round trip still works.
            encoded: `data:${file.type};base64,${encodeBytes(bytes)}`,
            bytes: bytes.length
          })
        } else {
          setInput(await file.text())
        }
      } catch {
        setFileError("unreadable")
      } finally {
        // `finally`, so the tool cannot get stuck on "processing" — which is
        // exactly what the old `throw`-inside-`onerror` did.
        setIsProcessing(false)
      }
    },
    [mode, setInput, setInputText]
  )

  const download = useCallback(() => {
    if (!result.output) return
    const blob = new Blob([result.output], {
      type: "text/plain; charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    // Translated: the filename was hardcoded Uzbek on both locales.
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
    urlSafe,
    setUrlSafe,
    isProcessing,
    result,
    /** Set when the source is an uploaded image rather than typed text. */
    fileName: source.kind === "file" ? source.name : "",
    fileError: fileError ? t(`Errors.${fileError}`) : "",
    switchMode,
    clear,
    loadSample: setInput,
    readFile,
    download,
    canDownload: Boolean(result.output),
    acceptedFileTypes:
      mode === "encode"
        ? [...SUPPORTED_TEXT_TYPES, ...SUPPORTED_IMAGE_TYPES].join(",")
        : SUPPORTED_TEXT_TYPES.join(","),
    samples
  }
}
