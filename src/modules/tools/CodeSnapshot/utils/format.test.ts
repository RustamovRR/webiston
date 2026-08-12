import { describe, expect, it } from "vitest"

import { canFormat, formatCode } from "./format"

/**
 * Prettier, exercised for real.
 *
 * Not mocked. The whole risk in this module is the recipe table — a parser
 * name that does not exist, or a plugin left out of a language's list — and
 * every one of those failures is a runtime rejection that a mock would hide.
 * The plugins are real files in `node_modules`; running them in Node costs
 * milliseconds and is the only thing that proves the table is right.
 */

describe("canFormat", () => {
  it("accepts the languages Prettier really parses", () => {
    // Arrange / Act / Assert
    for (const id of ["typescript", "tsx", "css", "yaml", "markdown"]) {
      expect(canFormat(id)).toBe(true)
    }
  })

  it("refuses the ones it does not", () => {
    // Arrange / Act / Assert — 342 of Shiki's 360 grammars land here, and the
    // button has to be disabled for every one of them.
    for (const id of ["rust", "python", "go", "sql", "text"]) {
      expect(canFormat(id)).toBe(false)
    }
  })

  it("is keyed on canonical ids, which is what the resolver produces", () => {
    // Arrange / Act / Assert — `ts` is a Shiki ALIAS. `resolveLanguage` folds
    // it to `typescript` before this is ever asked, so a `true` here would
    // mean the map had grown a second spelling of the same language.
    expect(canFormat("ts")).toBe(false)
    expect(canFormat("typescript")).toBe(true)
  })
})

describe("formatCode", () => {
  it("formats TypeScript through the babel parser, generics included", async () => {
    // Arrange
    const input = "const x:number=1;function f<T>(a:T){return a}"

    // Act
    const result = await formatCode(input, "typescript")

    // Assert — `babel-ts` is used instead of the dedicated `typescript`
    // plugin, which is 213 KB gzipped against babel's 82 KB. Generics are the
    // thing that would break if the parser were plain `babel`.
    expect(result).toContain("const x: number = 1")
    expect(result).toContain("function f<T>(a: T)")
  })

  it("handles JSX, which shares that parser", async () => {
    // Arrange / Act
    const result = await formatCode(
      'const A=()=><div className="x">{y}</div>',
      "tsx"
    )

    // Assert
    expect(result).toContain("<div")
    expect(result).toContain('className="x"')
  })

  it("formats a non-JavaScript language with its own plugin", async () => {
    // Arrange / Act — CSS goes through postcss and needs NO estree, which is
    // the part of the table easiest to get wrong in the generous direction.
    const result = await formatCode("a{color:red;margin:0}", "css")

    // Assert
    expect(result).toBe("a {\n  color: red;\n  margin: 0;\n}")
  })

  it("leaves no trailing newline for the editor to show", async () => {
    // Arrange / Act
    const result = await formatCode("const a=1", "javascript")

    // Assert — Prettier always ends with one. The layout trims a trailing
    // newline before painting, so keeping it would put a blank line in the
    // textarea that the visitor can see and put a caret on but that never
    // appears in the picture.
    expect(result.endsWith("\n")).toBe(false)
    expect(result).toBe("const a = 1;")
  })

  it("returns the code untouched when nothing can format it", async () => {
    // Arrange
    const rust = 'fn main(){println!("hi")}'

    // Act
    const result = await formatCode(rust, "rust")

    // Assert
    expect(result).toBe(rust)
  })

  it("rejects on a syntax error instead of returning something plausible", async () => {
    // Arrange / Act / Assert — half-pasted code is the NORMAL state of a
    // snippet. Swallowing this would leave the visitor pressing a button that
    // silently does nothing.
    await expect(formatCode("const = = 1", "javascript")).rejects.toThrow()
  })
})
