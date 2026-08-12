import { describe, expect, it } from "vitest"

import { resolveLanguage } from "./highlight"
import { toCodeLine, trimTrailingNewline } from "./tokens"

/**
 * These two are the parts of `highlight.ts` that can be tested without a
 * network or a WebAssembly build: the alias resolution and the bit-field
 * decoding. Tokenising itself is exercised through the tool's integration
 * test, where a real highlighter is worth its start-up cost once.
 */

describe("resolveLanguage", () => {
  it("passes a real grammar id straight through", () => {
    // Arrange / Act / Assert
    expect(resolveLanguage("typescript")).toBe("typescript")
    expect(resolveLanguage("rust")).toBe("rust")
  })

  it("resolves the aliases people actually type", () => {
    // Arrange / Act / Assert — `js` and `ts` are aliases in Shiki's registry,
    // not grammar ids, so a naive `id in bundledLanguages` check drops them to
    // plain text and the snippet renders grey.
    expect(resolveLanguage("js")).toBe("javascript")
    expect(resolveLanguage("ts")).toBe("typescript")
    expect(resolveLanguage("py")).toBe("python")
  })

  it("is case- and whitespace-insensitive", () => {
    // Arrange / Act / Assert
    expect(resolveLanguage("  TypeScript ")).toBe("typescript")
    expect(resolveLanguage("JS")).toBe("javascript")
  })

  it("falls back to plain text rather than throwing", () => {
    // Arrange / Act / Assert — an unknown grammar must not take the canvas
    // down; Shiki's loader throws on an id it does not have.
    expect(resolveLanguage("klingon")).toBe("text")
    expect(resolveLanguage("")).toBe("text")
    expect(resolveLanguage("text")).toBe("text")
  })
})

describe("toCodeLine", () => {
  it("carries content and colour across unchanged", () => {
    // Arrange
    const tokens = [{ content: "const", color: "#ff0000" }]

    // Act
    const [token] = toCodeLine(tokens)

    // Assert
    expect(token.content).toBe("const")
    expect(token.color).toBe("#ff0000")
  })

  it("reads fontStyle as a bit field, not an enum value", () => {
    // Arrange — 3 is Italic(1) | Bold(2). An `=== 1` / `=== 2` comparison
    // would report neither, which is the bug this test exists for.
    const tokens = [{ content: "x", fontStyle: 3 }]

    // Act
    const [token] = toCodeLine(tokens)

    // Assert
    expect(token.italic).toBe(true)
    expect(token.bold).toBe(true)
  })

  it("decodes each flag on its own", () => {
    // Arrange / Act
    const [italic] = toCodeLine([{ content: "a", fontStyle: 1 }])
    const [bold] = toCodeLine([{ content: "a", fontStyle: 2 }])
    const [underline] = toCodeLine([{ content: "a", fontStyle: 4 }])
    const [strike] = toCodeLine([{ content: "a", fontStyle: 8 }])

    // Assert
    expect([italic.italic, italic.bold]).toEqual([true, false])
    expect([bold.bold, bold.italic]).toEqual([true, false])
    expect(underline.underline).toBe(true)
    expect(strike.strikethrough).toBe(true)
  })

  it("treats a missing fontStyle as no styling", () => {
    // Arrange / Act — Shiki omits the field entirely for unstyled scopes.
    const [token] = toCodeLine([{ content: "a" }])

    // Assert
    expect(token).toMatchObject({
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false
    })
  })

  /**
   * `FontStyle.NotSet` is -1, which is all bits set in two's complement. Read
   * naively it would turn every unstyled token bold, italic, underlined AND
   * struck through at once.
   */
  it("does not read NotSet (-1) as every flag at once", () => {
    // Arrange / Act
    const [token] = toCodeLine([{ content: "a", fontStyle: -1 }])

    // Assert
    expect([
      token.bold,
      token.italic,
      token.underline,
      token.strikethrough
    ]).toEqual([false, false, false, false])
  })
})

describe("trimTrailingNewline", () => {
  /**
   * The defect: a file's final `\n` becomes a fifth, empty line under a
   * four-line snippet — a strip of dead space inside the window that reads as
   * bad padding rather than as a bug. Only the line-number gutter counting to
   * 5 makes it undeniable.
   */
  it("drops the newline nearly every file ends with", () => {
    // Arrange / Act / Assert
    expect(trimTrailingNewline("a\nb\n").split("\n")).toHaveLength(2)
  })

  it("drops exactly one, so deliberate blank lines survive", () => {
    // Arrange / Act / Assert — someone spacing out a snippet meant those.
    expect(trimTrailingNewline("a\n\n\n")).toBe("a\n\n")
  })

  it("leaves code without a trailing newline alone", () => {
    // Arrange / Act / Assert
    expect(trimTrailingNewline("const a = 1")).toBe("const a = 1")
    expect(trimTrailingNewline("")).toBe("")
  })
})
