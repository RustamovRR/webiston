import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CodeHighlight } from "./code-highlight"

/**
 * The shared highlighter.
 *
 * Two of its four branches were broken in a way no visual check catches:
 * `[^&gt;]` reads as the character class `& g t ;`, so the HTML tag rule
 * stopped at the first `t` in `<meta`.
 */

const html = (code: string, language: "html" | "javascript" | "json") =>
  render(<CodeHighlight code={code} language={language} />).container.innerHTML

describe("markup", () => {
  it("colours a whole tag name, including one containing t or g", () => {
    // Arrange & Act
    const out = html('<meta property="og:title" content="Salom" />', "html")

    // Assert — the old rule matched `&lt;me` and stopped.
    expect(out).toContain(">meta</span>")
    expect(out).toContain(">property</span>")
  })

  it("keeps an attribute value that contains an entity in one piece", () => {
    // Arrange & Act — an escaped quote inside the value used to end the
    // value rule, which then coloured the rest of the line as markup.
    const out = html('<meta content="React &quot;Hooks&quot;" />', "html")

    // Assert
    expect(out).toContain("&amp;quot;Hooks&amp;quot;")
    expect(out).toContain(">content</span>")
  })

  it("never lets the source text become an element", () => {
    // Arrange & Act
    const out = html('<script>alert("x")</script>', "html")

    // Assert — the text is displayed, not executed.
    expect(out).not.toContain("<script>")
    expect(out).toContain("&lt;")
  })
})

describe("script", () => {
  it("colours keywords and strings without colouring its own markup", () => {
    // Arrange & Act — chained replaces used to re-colour the class attribute
    // inserted by the previous rule.
    const out = html('export const metadata = { title: "Salom" }', "javascript")

    // Assert
    expect(out).toContain(">export</span>")
    expect(out).toContain(">const</span>")
    expect(out).not.toContain("text-chart-4</span>")
  })
})

describe("json", () => {
  it("still colours keys, strings and literals", () => {
    // Arrange & Act
    const out = html('{"a": "b", "c": 1, "d": null}', "json")

    // Assert
    expect(out).toContain("text-chart-4")
    expect(out).toContain("text-chart-2")
    expect(out).toContain("text-chart-5")
  })
})

describe("every branch", () => {
  it("uses design tokens and no palette classes", () => {
    // Arrange & Act — fourteen hardcoded hues, each with a `dark:` twin,
    // lived here before.
    const outputs = [
      html('<meta content="x" />', "html"),
      html("const a = 1", "javascript"),
      html('{"a": 1}', "json")
    ].join("")

    // Assert
    expect(outputs).not.toMatch(/text-(blue|green|purple|gray|zinc)-\d/)
    expect(outputs).not.toContain("dark:")
  })
})
