import { describe, expect, it } from "vitest"

import { WAKE_SCRIPT } from "../lib/wake"

/**
 * `WAKE_SCRIPT` is a string that becomes code inside somebody else's page, so
 * the failures it can have are not type errors. Two have actually happened:
 * a `${...}` that was escaped and shipped as literal text into the page, and a
 * backtick inside a CSS comment that terminated the template literal.
 */

const labels = {
  waking: "Sahifa tayyorlanmoqda…",
  loading: "Rasmlar yuklanmoqda…"
}

describe("WAKE_SCRIPT", () => {
  it("interpolates every placeholder instead of shipping it as text", () => {
    // Arrange / Act
    const script = WAKE_SCRIPT(labels)

    // Assert — an escaped `\${` passes a colour-token check and still emits
    // literal characters into the page. It did once.
    expect(script).not.toContain("${")
  })

  it("parses as JavaScript", () => {
    // Arrange
    const script = WAKE_SCRIPT(labels)

    // Act / Assert — a stray backtick would break the string at build time,
    // but an unbalanced brace inside it would only break at run time.
    expect(() => new Function(`return ${script}`)).not.toThrow()
  })

  it("survives a label carrying quotes, backslashes and a backtick", () => {
    // Arrange — messages come from `_locales`, so this is defence in depth
    // rather than an untrusted input, but the escaping has to actually work.
    // A backtick is the interesting character: the script is BUILT from a
    // template literal, and one landing unescaped would end the string.
    const hostile = { waking: 'a"b\\c`d', loading: "'e'" }

    // Act
    const script = WAKE_SCRIPT(hostile)

    // Assert — the label is embedded as a JSON string literal, and the whole
    // thing still parses.
    expect(script).toContain(JSON.stringify(hostile.waking))
    expect(() => new Function(`return ${script}`)).not.toThrow()
  })

  it("renders the progress fill as a block", () => {
    // Arrange / Act
    const script = WAKE_SCRIPT(labels)

    // Assert — these are spans; `width` does not apply to an inline box, and
    // without this the bar reported 50% while rendering 0 pixels.
    expect(script).toMatch(/\.f\{display:block/)
  })

  it("scrolls instantly rather than inheriting the page's smooth behaviour", () => {
    // Arrange / Act
    const script = WAKE_SCRIPT(labels)

    // Assert — measured on a `scroll-behavior: smooth` page: without this the
    // walk never reached the bottom (6 of 8 reveals stayed hidden) and the
    // visitor was left 2,970px down their own page.
    expect(script).toContain('behavior: "instant"')
    expect(script).toContain(
      'setProperty("scroll-behavior", "auto", "important")'
    )
  })

  it("dims the page and removes the whole overlay when it is done", () => {
    // Arrange / Act
    const script = WAKE_SCRIPT(labels)

    // Assert
    expect(script).toMatch(/\.s\{position:absolute;inset:0/)
    expect(script).toContain("host.remove()")
  })

  it("never leaves its overlay behind for the camera", () => {
    // Arrange — the overlay is injected into the page, so if it outlived the
    // wake phase it would be composited INTO the screenshot. `finally` is the
    // only guarantee that survives a throw halfway through the scroll.
    const source = WAKE_SCRIPT(labels)

    // Assert
    expect(source).toContain("} finally {")
    expect(source).toContain("host.remove()")
  })

  it("restores the visitor's scroll position", () => {
    // Arrange / Act — a screenshot tool that leaves someone 40,000px down
    // their own page has broken the page to photograph it.
    const source = WAKE_SCRIPT(labels)

    // Assert
    expect(source).toContain("const startedAt = window.scrollY")
    expect(source).toContain("jump(startedAt)")
  })

  it("never touches the viewport size", () => {
    // Arrange — the defect this file replaced. A full-height viewport made a
    // `100vh` hero 2,414px instead of 800px and grew the document 2.7x.
    const source = WAKE_SCRIPT(labels)

    // Assert
    expect(source).not.toContain("setDeviceMetricsOverride")
    expect(source).not.toContain("innerHeight =")
  })
})
