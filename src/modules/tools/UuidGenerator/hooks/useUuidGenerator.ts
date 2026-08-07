"use client"

import { useCallback, useEffect, useMemo } from "react"

import { useUuidDraftStore } from "../stores/uuidDraftStore"
import { formatUuid, generateUuid, inspectUuid } from "../utils/uuid"

/**
 * The tool's state and everything derived from it.
 *
 * Three things this replaces did wrong, all of them cheap to keep right:
 *
 * - **`isGenerating` was set true and false in the same synchronous block**,
 *   so the spinner it drove could never paint. Generating 1000 values takes
 *   under a millisecond; there is no pending state to model.
 * - **`copyAll` reported success before the clipboard answered** — a
 *   `.then()` with no `.catch()`, so a refused write both claimed to have
 *   copied and raised an unhandled rejection. The shared `CopyButton` owns
 *   that interaction now, so there is one implementation of it.
 * - **The store held pre-formatted strings**, which meant switching from
 *   `standard` to `compact` left the visitor with values in the old shape
 *   until they pressed generate again. The store holds canonical values and
 *   formatting is derived, so the display follows the control immediately.
 */
export function useUuidGenerator() {
  const count = useUuidDraftStore((state) => state.count)
  const version = useUuidDraftStore((state) => state.version)
  const format = useUuidDraftStore((state) => state.format)
  const textCase = useUuidDraftStore((state) => state.textCase)
  const values = useUuidDraftStore((state) => state.values)
  const inspectInput = useUuidDraftStore((state) => state.inspectInput)

  const setCount = useUuidDraftStore((state) => state.setCount)
  const setVersion = useUuidDraftStore((state) => state.setVersion)
  const setFormat = useUuidDraftStore((state) => state.setFormat)
  const setTextCase = useUuidDraftStore((state) => state.setTextCase)
  const setValues = useUuidDraftStore((state) => state.setValues)
  const setInspectInput = useUuidDraftStore((state) => state.setInspectInput)
  const clear = useUuidDraftStore((state) => state.clear)

  const generate = useCallback(() => {
    setValues(
      Array.from({ length: count }, () => generateUuid(version)),
      `${version}:${count}`
    )
  }, [count, version, setValues])

  /**
   * The batch always matches the controls above it.
   *
   * One rule: asking for something DIFFERENT — another version, another count
   * — produces it immediately, and changing how it is DISPLAYED (delimiters,
   * case) never regenerates, because that is derived. Without this, choosing
   * v7 left a list of v4 values on screen until the visitor thought to press
   * a button, which reads as a broken control rather than a pending one.
   *
   * `generatedFor` is what keeps a locale switch — which remounts the tree —
   * from throwing away values the visitor already has, and it is why this is
   * not simply "generate on mount".
   *
   * The first batch is made after mount and never during render: a random
   * value drawn during render differs between the server's HTML and the
   * client's, which is a hydration mismatch by construction.
   */
  useEffect(() => {
    const state = useUuidDraftStore.getState()
    if (state.generatedFor !== `${version}:${count}`) generate()
  }, [version, count, generate])

  /** What is displayed and copied: canonical values under the current style. */
  const formatted = useMemo(
    () => values.map((value) => formatUuid(value, format, textCase)),
    [values, format, textCase]
  )

  const asText = useMemo(() => formatted.join("\n"), [formatted])

  const stats = useMemo(
    () => ({
      total: formatted.length,
      /** Proof, not decoration: 1000 draws, 1000 distinct values. */
      unique: new Set(formatted).size
    }),
    [formatted]
  )

  const verdict = useMemo(
    () => (inspectInput.trim() ? inspectUuid(inspectInput) : null),
    [inspectInput]
  )

  const download = useCallback(
    (kind: "txt" | "json") => {
      if (formatted.length === 0) return

      // One value per line, or a bare JSON array — the two shapes that can be
      // pasted straight into a seed script or a shell loop. What this replaces
      // wrapped five strings in a translated banner with a timestamp, which
      // has to be deleted before the file can be used for anything.
      const body =
        kind === "json"
          ? JSON.stringify(formatted, null, 2)
          : `${formatted.join("\n")}\n`

      const blob = new Blob([body], {
        type:
          kind === "json"
            ? "application/json;charset=utf-8"
            : "text/plain;charset=utf-8"
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `uuids.${kind}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    [formatted]
  )

  return {
    count,
    version,
    format,
    textCase,
    formatted,
    asText,
    stats,
    inspectInput,
    verdict,
    setCount,
    setVersion,
    setFormat,
    setTextCase,
    setInspectInput,
    generate,
    clear,
    download
  }
}
