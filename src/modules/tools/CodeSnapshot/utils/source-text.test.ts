import { describe, expect, it } from "vitest"

import { TAB_WIDTH } from "../constants"
import { normaliseSource } from "./source-text"

/**
 * The shape source has to be in before it can be drawn.
 *
 * The measurement behind all of this, taken on a real 2D context in Chrome:
 * `measureText("\t")`, `measureText("\r")` and `measureText(" ")` all return
 * 9.6328125 at 16px monospace. A canvas has no tab stops — the text
 * preparation algorithm converts every space character to U+0020 before
 * anything is measured — and no context property changes it.
 */

describe("normaliseSource", () => {
  it("expands a leading tab to a full indent", () => {
    // Arrange / Act / Assert — `gofmt` emits tabs and has no option not to, so
    // this is what every Go snippet pasted into this tool looks like. Drawn
    // raw, eight levels of nesting become eight single spaces.
    expect(normaliseSource("\tif err != nil {")).toBe(
      `${" ".repeat(TAB_WIDTH)}if err != nil {`
    )
  })

  it("expands to tab STOPS, not to a fixed run of spaces", () => {
    // Arrange — the naive `replace(/\t/g, "    ")` is right only for tabs at
    // the start of a line. A tab advances to the next multiple of the width,
    // which is what aligns the trailing comments and Makefile rules that are
    // the other reason a tab is in a file at all.
    const line = "a\tb"

    // Act
    const result = normaliseSource(line)

    // Assert — "a" occupies column 0, so the tab fills columns 1..3.
    expect(result).toBe(`a${" ".repeat(TAB_WIDTH - 1)}b`)
    expect(result.indexOf("b")).toBe(TAB_WIDTH)
  })

  it("restarts the stops on every line", () => {
    // Arrange / Act — a column count carried across a newline would put the
    // second line's indentation at a different width from the first.
    const result = normaliseSource("ab\tx\ncd\ty").split("\n")

    // Assert
    expect(result[0].indexOf("x")).toBe(TAB_WIDTH)
    expect(result[1].indexOf("y")).toBe(TAB_WIDTH)
  })

  it("turns Windows and classic Mac line endings into newlines", () => {
    // Arrange / Act / Assert — a stray `\r` is another space to a canvas, so
    // a file saved on Windows would draw a trailing space on every line and
    // widen the card by it.
    expect(normaliseSource("a\r\nb")).toBe("a\nb")
    expect(normaliseSource("a\rb")).toBe("a\nb")
    expect(normaliseSource("a\r\nb").split("\n")).toHaveLength(2)
  })

  it("returns the very same string when there is nothing to change", () => {
    // Arrange — this runs on every keystroke. Returning a new string would
    // make React re-render for a value that did not change.
    const clean = "const x = 1\n  return x\n"

    // Act / Assert — identity, not equality.
    expect(normaliseSource(clean)).toBe(clean)
  })

  it("leaves ordinary space indentation exactly as it is", () => {
    // Arrange / Act / Assert — most JS, TS and Python is already spaces, and
    // re-indenting someone's two-space file to four would be vandalism.
    const spaced = "def f():\n  return 1\n"
    expect(normaliseSource(spaced)).toBe(spaced)
  })

  it("handles an empty string", () => {
    // Arrange / Act / Assert
    expect(normaliseSource("")).toBe("")
  })
})
