import { describe, expect, it } from "vitest"

import { DEFAULT_OPTIONS } from "../constants"
import {
  decodeSnapshot,
  encodeSnapshot,
  type SharedSnapshot
} from "./share-url"

/**
 * The link format, round-tripped and attacked.
 *
 * Two jobs here, and the second is the important one. A link is UNTRUSTED
 * input written by whoever sent it, and every field lands somewhere that
 * assumes a sane value: a `fontSize` of 40,000 asks the browser for a canvas
 * it will refuse to allocate, and a `focusLines` of `["x"]` breaks the
 * layout's `Set` arithmetic in a way nobody would trace back to a URL.
 */

const { fontFamily: _ignored, ...baseOptions } = DEFAULT_OPTIONS

const SAMPLE: SharedSnapshot = {
  code: "export const answer = 42\n",
  language: "typescript",
  theme: "dracula",
  font: "fira-code",
  scale: 3,
  options: {
    ...baseOptions,
    fontSize: 18,
    lineHeight: 1.8,
    padding: 96,
    frame: "plain",
    title: "answer.ts",
    showLineNumbers: true,
    firstLineNumber: 340,
    focusLines: [1, 3]
  }
}

/** Hand-write a fragment the way a stranger's link would arrive. */
const plainFragment = (state: unknown) =>
  `0${encodeURIComponent(JSON.stringify(state))}`

describe("encode / decode", () => {
  it("round-trips every field", async () => {
    // Arrange / Act
    const decoded = await decodeSnapshot(await encodeSnapshot(SAMPLE))

    // Assert
    expect(decoded).toEqual(SAMPLE)
  })

  it("compresses, and by a margin worth the code", async () => {
    // Arrange — a snippet the size people actually share.
    const code = Array.from(
      { length: 20 },
      (_, i) => `export const value${i} = compute(${i}, "label ${i}")`
    ).join("\n")

    // Act
    const packed = await encodeSnapshot({ ...SAMPLE, code })
    const plain = plainFragment({ c: code })

    // Assert — the reason this is not just `encodeURIComponent`. Measured on
    // a 485-char snippet: 979 chars plain against 487 packed.
    expect(packed.startsWith("1")).toBe(true)
    expect(packed.length).toBeLessThan(plain.length / 1.5)
  })

  it("reads a link from a browser with no compressor", async () => {
    // Arrange — the `0` format is the fallback an older engine emits, and
    // every other browser still has to be able to open that link.
    const fragment = plainFragment({
      c: "const a = 1",
      l: "javascript",
      t: "nord"
    })

    // Act
    const decoded = await decodeSnapshot(fragment)

    // Assert
    expect(decoded?.code).toBe("const a = 1")
    expect(decoded?.language).toBe("javascript")
    expect(decoded?.theme).toBe("nord")
  })

  it("resolves a language alias to its canonical id", async () => {
    // Arrange / Act — an older link, or a hand-typed one, may carry `ts`.
    const decoded = await decodeSnapshot(plainFragment({ c: "x", l: "ts" }))

    // Assert — an alias in the picker's `value` leaves it showing an empty box.
    expect(decoded?.language).toBe("typescript")
  })
})

describe("a link is untrusted input", () => {
  it("returns null rather than throwing on junk", async () => {
    // Arrange / Act / Assert
    for (const fragment of [
      "",
      "nonsense",
      "0not-json",
      "0%E0%A4%A",
      "1!!!not-base64!!!",
      `0${encodeURIComponent("[1,2,3]")}`,
      `0${encodeURIComponent('"a string"')}`,
      `0${encodeURIComponent("null")}`
    ]) {
      await expect(decodeSnapshot(fragment)).resolves.toBeNull()
    }
  })

  it("refuses a link with no code at all", async () => {
    // Arrange / Act / Assert — an empty picture is not worth restoring, and
    // it would silently wipe whatever the visitor was already working on.
    await expect(decodeSnapshot(plainFragment({ c: "" }))).resolves.toBeNull()
    await expect(decodeSnapshot(plainFragment({ l: "go" }))).resolves.toBeNull()
  })

  it("clamps every number to a value the UI actually offers", async () => {
    // Arrange
    const hostile = plainFragment({
      c: "x",
      s: 40000,
      h: -5,
      p: 999999,
      x: 99,
      fn: -3
    })

    // Act
    const decoded = await decodeSnapshot(hostile)

    // Assert — a 40,000px font asks for a canvas the browser refuses to
    // allocate, and `toBlob` then hands back null with no error anywhere.
    expect(decoded?.options.fontSize).toBe(DEFAULT_OPTIONS.fontSize)
    expect(decoded?.options.lineHeight).toBe(DEFAULT_OPTIONS.lineHeight)
    expect(decoded?.options.padding).toBe(DEFAULT_OPTIONS.padding)
    expect(decoded?.scale).toBe(2)
    expect(decoded?.options.firstLineNumber).toBe(1)
  })

  it("drops focus lines that are not positive integers", async () => {
    // Arrange / Act
    const decoded = await decodeSnapshot(
      plainFragment({ c: "x", fo: [1, "2", -3, 4.5, null, 6] })
    )

    // Assert — the layout puts these in a `Set` and compares them against
    // `index + 1`; anything else silently fails to match forever.
    expect(decoded?.options.focusLines).toEqual([1, 6])
  })

  it("falls back on an unknown frame, font or background", async () => {
    // Arrange / Act
    const decoded = await decodeSnapshot(
      plainFragment({ c: "x", w: "hologram", f: "comic-sans", bg: "nope" })
    )

    // Assert
    expect(decoded?.options.frame).toBe(DEFAULT_OPTIONS.frame)
    expect(decoded?.font).toBe("jetbrains-mono")
    expect(decoded?.options.background).toEqual(DEFAULT_OPTIONS.background)
  })

  it("caps the code so a link cannot freeze the tab", async () => {
    // Arrange — far past what the canvas can draw at any scale.
    const decoded = await decodeSnapshot(
      plainFragment({ c: "x".repeat(500_000) })
    )

    // Assert
    expect(decoded?.code.length).toBe(100_000)
  })

  it("caps the window title, which sizes the card", async () => {
    // Arrange / Act
    const decoded = await decodeSnapshot(
      plainFragment({ c: "x", ti: "t".repeat(5000) })
    )

    // Assert — the painter centres the title and widens the card to fit it,
    // so an unbounded one is another route to an unallocatable canvas.
    expect(decoded?.options.title.length).toBe(120)
  })

  it("treats a missing line-numbers flag as off, not as truthy junk", async () => {
    // Arrange / Act
    const decoded = await decodeSnapshot(plainFragment({ c: "x", n: "yes" }))

    // Assert — `Boolean("yes")` is `true`, which is how a hand-edited link
    // would turn the gutter on and change every width in the layout.
    expect(decoded?.options.showLineNumbers).toBe(false)
  })
})
