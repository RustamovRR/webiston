"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  buildSamples,
  MAX_FILE_BYTES,
  SAMPLE_KEYS,
  SUPPORTED_FILE_TYPES
} from "../constants"
import { useJwtDraftStore } from "../stores/jwtDraftStore"
import type { FileFailure } from "../types"
import { decodeJwt, isUnsigned, readTiming } from "../utils/jwt"

/**
 * The decoder's state and everything derived from it.
 *
 * What the rewrite removed, each a defect and not tidiness:
 *
 * - **`alert()`, five times** — the finding already closed in the JSON
 *   formatter and the Base64 converter. Errors are values now.
 * - **Three sample labels hardcoded in Uzbek** inside the hook, then patched
 *   back to translations by a three-branch ternary in the component. The
 *   labels come from the bundle and the tokens are built.
 * - **`FileReader`** with the same `alert`-in-`onerror` shape; `File.text()`
 *   is a promise and `finally` cannot be skipped.
 * - **`inputStats`** counted words and lines of a JWT. A token is one string
 *   with no spaces and no newlines; the numbers were always `1` and `1`.
 * - **`formatJSON` returned from the hook** — a `JSON.stringify` wrapper
 *   rebuilt on every render and handed to the view as if it were state.
 */

export function useJwtDecoder() {
  const t = useTranslations("JwtDecoderPage")
  const tSamples = useTranslations("JwtDecoderPage.Samples")

  const token = useJwtDraftStore((state) => state.token)
  const setToken = useJwtDraftStore((state) => state.setToken)
  const showSignature = useJwtDraftStore((state) => state.showSignature)
  const setShowSignature = useJwtDraftStore((state) => state.setShowSignature)

  const [isProcessing, setIsProcessing] = useState(false)
  const [fileError, setFileError] = useState<FileFailure | null>(null)

  /**
   * `now` is state, set after mount, and never read during the server render.
   *
   * Every expiry answer on this page depends on the current time, and the
   * server's clock is not the visitor's. Rendering "expires in 3 hours" from
   * `new Date()` during render is a hydration mismatch by construction — the
   * server computes one sentence and the client another.
   */
  const [now, setNow] = useState<Date | null>(null)

  const result = useMemo(
    () => (token.trim() ? decodeJwt(token) : null),
    [token]
  )

  // Re-read the clock whenever the TOKEN changes, not only on mount. Set once
  // on mount, a token pasted ten minutes into a session was judged against a
  // ten-minute-old `now` — so a token that had just expired still read
  // "expires in 5 minutes".
  // biome-ignore lint/correctness/useExhaustiveDependencies: `token` is the
  // trigger; `now` is what the effect writes
  useEffect(() => {
    setNow(new Date())
  }, [token])

  const decoded = result?.ok ? result.token : null

  const timing = useMemo(
    () => (decoded && now ? readTiming(decoded.payload, now) : null),
    [decoded, now]
  )

  /**
   * Samples are built against the CURRENT time, so "valid" is valid.
   *
   * Built lazily and only on the client: the three that shipped were fixed
   * strings whose `exp` claims had all passed, so every sample — including the
   * one labelled "Standard JWT" — reported expired.
   */
  const samples = useMemo(() => {
    const tokens = now ? buildSamples(now) : null
    return SAMPLE_KEYS.map((key) => ({
      key,
      label: tSamples(key),
      value: tokens?.[key] ?? ""
    }))
  }, [now, tSamples])

  const loadSample = useCallback(
    (value: string) => {
      if (!value) return
      setToken(value)
      setFileError(null)
    },
    [setToken]
  )

  const clear = useCallback(() => {
    setToken("")
    setFileError(null)
  }, [setToken])

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
        setToken((await file.text()).trim())
      } catch {
        setFileError("unreadable")
      } finally {
        setIsProcessing(false)
      }
    },
    [setToken]
  )

  const download = useCallback(
    (part: "header" | "payload") => {
      if (!decoded) return
      const blob = new Blob([JSON.stringify(decoded[part], null, 2)], {
        type: "application/json"
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `jwt-${part}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    [decoded]
  )

  return {
    token,
    setToken,
    decoded,
    timing,
    /** `true` only once a token has been read AND its header says `alg: none`. */
    unsigned: decoded ? isUnsigned(decoded.header) : false,
    error:
      result && !result.ok
        ? t(`Errors.${result.reason}`, { part: result.part ?? "" })
        : "",
    showSignature,
    setShowSignature,
    isProcessing,
    fileError: fileError ? t(`Errors.${fileError}`, { part: "" }) : "",
    samples,
    loadSample,
    clear,
    readFile,
    download,
    /** Null until mounted; the view renders timing only once it is set. */
    now
  }
}
