"use client"

import { useCallback, useEffect, useMemo } from "react"

import { useLoremDraftStore } from "../stores/loremDraftStore"
import type { LoremOptions } from "../types"
import { applyFormat, generateLorem, measure } from "../utils/generate"

/**
 * The tool's state and everything derived from it.
 *
 * Three things this replaces did wrong:
 *
 * - **`loadSample` ran `generateText` inside a `setTimeout(…, 100)`**, which
 *   closed over the settings from BEFORE the sample was applied — so the first
 *   press produced text for the previous configuration. The comment above it
 *   read "generate after a small delay to ensure state is updated".
 * - **`generateText` wrote `""` and then the result**, rendering an empty
 *   panel between two frames for no reason.
 * - **The whole right-hand panel was a stat sheet rendered as TEXT** —
 *   character, word, line and paragraph counts formatted into a monospace box
 *   next to the output, in a `DualTextPanel` built for two documents.
 */
export function useLoremIpsum() {
  const unit = useLoremDraftStore((state) => state.unit)
  const amount = useLoremDraftStore((state) => state.amount)
  const bank = useLoremDraftStore((state) => state.bank)
  const format = useLoremDraftStore((state) => state.format)
  const startWithLorem = useLoremDraftStore((state) => state.startWithLorem)
  const text = useLoremDraftStore((state) => state.text)

  const setUnit = useLoremDraftStore((state) => state.setUnit)
  const setAmount = useLoremDraftStore((state) => state.setAmount)
  const setBank = useLoremDraftStore((state) => state.setBank)
  const setFormat = useLoremDraftStore((state) => state.setFormat)
  const setStartWithLorem = useLoremDraftStore(
    (state) => state.setStartWithLorem
  )
  const setText = useLoremDraftStore((state) => state.setText)
  const clear = useLoremDraftStore((state) => state.clear)

  const options = useMemo<LoremOptions>(
    () => ({ unit, amount, bank, format, startWithLorem }),
    [unit, amount, bank, format, startWithLorem]
  )

  /**
   * What the text is made FROM — the format is not in it.
   *
   * Changing plain to HTML is a display decision, so it must not re-roll the
   * words; changing the bank or the amount is a different request, so it must.
   */
  const signature = `${unit}:${amount}:${bank}:${startWithLorem}`

  const generate = useCallback(() => {
    setText(generateLorem(options), signature)
  }, [options, signature, setText])

  /**
   * A generator that opens empty asks for a click before it has shown
   * anything. Made after mount, never during render: text drawn during render
   * differs between the server's HTML and the client's, which is a hydration
   * mismatch by construction. `generatedFor` is what keeps a locale switch —
   * which remounts the tree — from throwing the text away.
   */
  useEffect(() => {
    if (useLoremDraftStore.getState().generatedFor !== signature) generate()
  }, [signature, generate])

  const output = useMemo(() => applyFormat(text, options), [text, options])

  /**
   * Measured on the TEXT, not on the output.
   *
   * The counts sit beside the controls that requested them, so they have to
   * answer the same question: ask for 512 bytes and the panel must read 512
   * bytes, not 519 because seven characters of `<p></p>` were wrapped around
   * it afterwards. Measuring the formatted string made the numbers describe
   * the markup rather than the filler.
   */
  const stats = useMemo(() => measure(text), [text])

  const download = useCallback(() => {
    if (!output) return
    // The text, and nothing else. What this replaces wrapped it in a
    // hardcoded-Uzbek banner, a timestamp, a settings dump and two `---`
    // rules, all of which have to be deleted before the file can be used.
    const blob = new Blob([`${output}\n`], {
      type:
        format === "html"
          ? "text/html;charset=utf-8"
          : "text/plain;charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = format === "html" ? "lorem-ipsum.html" : "lorem-ipsum.txt"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [output, format])

  return {
    unit,
    amount,
    bank,
    format,
    startWithLorem,
    output,
    stats,
    hasText: output.length > 0,
    setUnit,
    setAmount,
    setBank,
    setFormat,
    setStartWithLorem,
    generate,
    clear,
    download
  }
}
