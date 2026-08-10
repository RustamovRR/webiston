import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The content script's stylesheet is a TEMPLATE LITERAL, and that is a trap.
 *
 * `getStyles()` returns ~300 lines of CSS built with backticks. A single
 * backtick anywhere inside — in a rule, or in a prose comment naming a CSS
 * property — ends the string early. Sometimes that is a syntax error the
 * compiler catches. Sometimes it is not: TWO backticks close and reopen the
 * literal, producing valid TypeScript and a stylesheet silently truncated in
 * the middle, which ships a half-styled panel to every user.
 *
 * This suite exists because the mistake was made three times in one sitting,
 * and the third one would have shipped: the build passed.
 *
 * Source-level rather than by importing the module, because `content.ts` calls
 * `defineContentScript` and the `browser` global at import time — neither of
 * which exists outside an extension.
 */

/**
 * Deliberately NOT inside `entrypoints/`. WXT treats every file in that
 * directory as an entrypoint and derives the name from the filename, so
 * `content.stylesheet.test.ts` collided with `content.ts` and the extension
 * build died on `preventDuplicateEntrypointNames`.
 */
const SOURCE = readFileSync(
  path.join(import.meta.dirname, "../entrypoints/content.ts"),
  "utf8"
)

/** The body of the one template literal `getStyles` returns. */
function stylesheet(): string {
  const start = SOURCE.indexOf("function getStyles")
  expect(start, "getStyles not found — was it renamed?").toBeGreaterThan(-1)

  const open = SOURCE.indexOf("return `", start) + "return `".length
  const close = SOURCE.indexOf("`", open)
  return SOURCE.slice(open, close)
}

describe("the content script stylesheet", () => {
  it("runs to its final rule instead of ending early", () => {
    // Arrange / Act
    const css = stylesheet()

    // Assert — the LAST rule in the file. If a stray backtick truncated the
    // literal, everything from that point on is missing and this fails.
    expect(css).toContain(".wc-replace:hover")
  })

  it("has balanced braces", () => {
    // Arrange / Act
    const css = stylesheet()

    // Assert
    const open = (css.match(/\{/g) ?? []).length
    const close = (css.match(/\}/g) ?? []).length
    expect(open).toBe(close)
  })

  it("resets the box model, which a shadow root does not inherit", () => {
    // Arrange / Act
    const css = stylesheet()

    // Assert — without this the textareas measure 28px wider than the panel
    // holding them and the text visibly escapes the input.
    expect(css).toMatch(/box-sizing:\s*border-box/)
  })

  it("keeps every panel surface on a token, never a literal colour", () => {
    // Arrange / Act
    const css = stylesheet()

    // Assert — the popover is drawn over someone else's page, so a hardcoded
    // hex here would be the one place the design system cannot reach.
    const hexes = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
    expect(hexes).toEqual([])
  })
})
