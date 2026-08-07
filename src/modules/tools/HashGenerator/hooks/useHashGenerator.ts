"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  ALGORITHMS,
  HMAC_ALGORITHMS,
  MAX_FILE_BYTES,
  SAMPLE_KEYS,
  SAMPLE_VALUES
} from "../constants"
import { useHashDraftStore } from "../stores/hashDraftStore"
import type { FileFailure, HashOutput, HashSample } from "../types"
import { digest, hmac, toBase64, toHex, verifyChecksum } from "../utils/digest"

/**
 * The tool's state and everything derived from it.
 *
 * Four defects in what this replaces, all of them producing a wrong answer
 * silently:
 *
 * - **MD5 was not MD5.** See `utils/md5.ts`.
 * - **A file's TEXT was hashed, not its bytes** — `reader.readAsText` — so the
 *   digest of anything with a BOM, CRLF endings or a non-UTF-8 byte disagreed
 *   with `sha256sum`, which is the only thing a file hash is for.
 * - **`setTimeout(…, 300)` with no `clearTimeout` was called a debounce.** Every
 *   keystroke queued a full run, and because `crypto.subtle.digest` is async
 *   those runs could finish out of order — the panel could settle on the digest
 *   of text the visitor had already changed.
 * - **Toggling an algorithm hashed with the previous selection**: the
 *   regeneration was scheduled from inside the `setSelectedAlgorithms` updater,
 *   so it closed over the pre-toggle array. Turning SHA-512 on showed results
 *   without it until the next keystroke. (It also ran a side effect inside a
 *   state updater, which React invokes twice in development.)
 *
 * The algorithm checkboxes are gone with it. Five digests over typed text cost
 * microseconds, so making the visitor choose bought nothing and cost a whole
 * class of bug.
 */

export function useHashGenerator() {
  const t = useTranslations("HashGeneratorPage")
  const tSamples = useTranslations("HashGeneratorPage.samples")

  const text = useHashDraftStore((state) => state.text)
  const setText = useHashDraftStore((state) => state.setText)
  const file = useHashDraftStore((state) => state.file)
  const setFile = useHashDraftStore((state) => state.setFile)
  const format = useHashDraftStore((state) => state.format)
  const setFormat = useHashDraftStore((state) => state.setFormat)
  const expected = useHashDraftStore((state) => state.expected)
  const setExpected = useHashDraftStore((state) => state.setExpected)
  const hmacEnabled = useHashDraftStore((state) => state.hmacEnabled)
  const setHmacEnabled = useHashDraftStore((state) => state.setHmacEnabled)
  const hmacKey = useHashDraftStore((state) => state.hmacKey)
  const setHmacKey = useHashDraftStore((state) => state.setHmacKey)
  const clearWork = useHashDraftStore((state) => state.clearWork)

  const [outputs, setOutputs] = useState<HashOutput[]>([])
  const [isHashing, setIsHashing] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [fileError, setFileError] = useState<FileFailure | null>(null)

  const samples = useMemo<HashSample[]>(
    () =>
      SAMPLE_KEYS.map((key) => ({
        key,
        label: tSamples(key),
        value: SAMPLE_VALUES[key]
      })),
    [tSamples]
  )

  /**
   * What is actually hashed.
   *
   * A file contributes its bytes unchanged; text is encoded as UTF-8, which is
   * the same thing every command-line tool does and the reason `Oʻzbekiston`
   * now gets the digest `sha256sum` gives it.
   */
  const bytes = useMemo(
    () => (file ? file.bytes : new TextEncoder().encode(text)),
    [file, text]
  )

  /** HMAC needs a key; without one there is nothing to compute, not an error. */
  const keyBytes = useMemo(() => new TextEncoder().encode(hmacKey), [hmacKey])

  const algorithms = hmacEnabled ? HMAC_ALGORITHMS : ALGORITHMS

  useEffect(() => {
    if (bytes.length === 0 || (hmacEnabled && keyBytes.length === 0)) {
      setOutputs([])
      setIsHashing(false)
      return
    }

    // React runs this cleanup before the next effect, so a run whose input is
    // already stale can never reach `setOutputs`. That is the whole fix for
    // the out-of-order race — no timers, no sequence numbers.
    let cancelled = false
    setIsHashing(true)

    void (async () => {
      const next: HashOutput[] = []
      for (const algorithm of algorithms) {
        // `!== "MD5"` is already guaranteed by `HMAC_ALGORITHMS`; it is here so
        // the type narrows to what `hmac` accepts without an assertion.
        const raw =
          hmacEnabled && algorithm !== "MD5"
            ? await hmac(bytes, keyBytes, algorithm)
            : await digest(bytes, algorithm)
        next.push({ algorithm, hex: toHex(raw), base64: toBase64(raw) })
      }
      if (cancelled) return
      setOutputs(next)
      setIsHashing(false)
    })()

    return () => {
      cancelled = true
    }
  }, [bytes, keyBytes, hmacEnabled, algorithms])

  /** Live, because the answer to "does this match" should need no button. */
  const verdict = useMemo(
    () => (outputs.length > 0 ? verifyChecksum(expected, outputs) : null),
    [expected, outputs]
  )

  const readFile = useCallback(
    async (picked: File) => {
      setFileError(null)

      if (picked.size > MAX_FILE_BYTES) {
        setFileError("tooLarge")
        return
      }

      setIsReading(true)
      try {
        // `arrayBuffer()`, not `FileReader.readAsText`. Any file type works
        // now — an image, an installer, a zip — because nothing here has to
        // pretend the contents are text.
        const buffer = await picked.arrayBuffer()
        setFile({
          name: picked.name,
          size: picked.size,
          bytes: new Uint8Array(buffer)
        })
      } catch {
        setFileError("unreadable")
      } finally {
        setIsReading(false)
      }
    },
    [setFile]
  )

  const clearFile = useCallback(() => {
    setFile(null)
    setFileError(null)
  }, [setFile])

  const clear = useCallback(() => {
    clearWork()
    setFileError(null)
  }, [clearWork])

  const loadSample = useCallback(
    (value: string) => {
      setText(value)
      setFileError(null)
    },
    [setText]
  )

  /**
   * One line per algorithm, `<name>  <digest>` — the shape a checksum file
   * uses, so the download can be diffed against a published one instead of
   * being read by eye. What it replaces was a decorated report with a banner,
   * a timestamp and a 500-character excerpt of the input.
   */
  const asText = useMemo(
    () =>
      outputs
        .map((output) => `${output.algorithm}  ${output[format]}`)
        .join("\n"),
    [outputs, format]
  )

  const download = useCallback(() => {
    if (!asText) return
    const blob = new Blob([`${asText}\n`], {
      type: "text/plain; charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = file ? `${file.name}.checksums.txt` : "checksums.txt"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [asText, file])

  return {
    text,
    setText,
    file,
    clearFile,
    format,
    setFormat,
    expected,
    setExpected,
    hmacEnabled,
    setHmacEnabled,
    hmacKey,
    setHmacKey,
    outputs,
    /** The number that decides the digest — bytes, never characters. */
    byteCount: bytes.length,
    /** There is something to sign and no key to sign it with. */
    needsHmacKey: hmacEnabled && hmacKey.length === 0 && bytes.length > 0,
    isHashing,
    isReading,
    verdict,
    fileError: fileError ? t(`errors.${fileError}`) : "",
    samples,
    loadSample,
    readFile,
    clear,
    asText,
    download,
    canDownload: outputs.length > 0
  }
}
