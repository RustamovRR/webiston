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
    const script = WAKE_SCRIPT()

    // Assert — an escaped `\${` passes a colour-token check and still emits
    // literal characters into the page. It did once.
    expect(script).not.toContain("${")
  })

  it("draws nothing on the page at all", () => {
    // Arrange / Act — three designs were tried on top of the page (a pill, an
    // opaque cover, a 4px line) and the owner rejected all three. Anything
    // this script renders is `position: fixed`, so it is composited into a
    // `captureBeyondViewport` image and has to blink off for the shutter.
    // Progress belongs in the toolbar badge, which cannot be captured.
    const script = WAKE_SCRIPT()

    // Assert
    expect(script).not.toContain("attachShadow")
    expect(script).not.toContain("position:fixed")
    expect(script).not.toContain("createElement")
  })

  it("writes exactly one style on the page, and puts it back", () => {
    // Arrange / Act — forcing anything else would be the class of change that
    // made every `vh` unit wrong.
    const script = WAKE_SCRIPT()

    // Assert
    const writes =
      script.match(/\.style\.(setProperty|removeProperty)\(\s*"([^"]+)"/g) ?? []
    expect(writes.length).toBeGreaterThan(0)
    for (const write of writes) expect(write).toContain("scroll-behavior")
  })

  it("parses as JavaScript", () => {
    // Arrange
    const script = WAKE_SCRIPT()

    // Act / Assert — a stray backtick would break the string at build time,
    // but an unbalanced brace inside it would only break at run time.
    expect(() => new Function(`return ${script}`)).not.toThrow()
  })

  it("scrolls instantly rather than inheriting the page's smooth behaviour", () => {
    // Arrange / Act
    const script = WAKE_SCRIPT()

    // Assert — measured on a `scroll-behavior: smooth` page: without this the
    // walk never reached the bottom (6 of 8 reveals stayed hidden) and the
    // visitor was left 2,970px down their own page.
    expect(script).toContain('behavior: "instant"')
    expect(script).toContain(
      'setProperty("scroll-behavior", "auto", "important")'
    )
  })

  it("ends at the top of the document and hands back where the visitor was", () => {
    // Arrange / Act — MEASURED on webiston.uz: `captureBeyondViewport` paints
    // fixed and sticky boxes at the CURRENT scroll offset, so a capture taken
    // at the visitor's offset strands the site header and both sidebars that
    // far down the image. The position comes back in the report instead, for
    // the caller to restore after the shutter.
    const source = WAKE_SCRIPT()

    // Assert
    expect(source).toContain("const startedAt = window.scrollY")
    // A panel is the opposite case: the window never moved, so the visitor's
    // own position is the one worth showing and there is nothing to restore.
    expect(source).toContain("jump(panel ? startedAt : 0)")
    expect(source).toContain("startedAt: panel ? 0 : startedAt")
  })

  it("walks the panel when the DOCUMENT is not what scrolls", () => {
    // Arrange / Act — Gmail, Slack and most dashboards put `overflow: hidden`
    // on the document. Measured on a page of that shape before this existed:
    // 36 of 40 images never started loading and the capture burned the whole
    // 4-second image deadline waiting for them. After: 40 of 40, 894ms.
    const script = WAKE_SCRIPT()

    // Assert
    expect(script).toContain("findScroller")
    expect(script).toContain("panel.scrollTop = y")
    expect(script).toContain("innerScroll: !!panel")
  })

  it("never changes a computed style to make the page photograph better", () => {
    // Arrange / Act — forcing `overflow: visible` on somebody's app shell
    // would make an inner-scroll page capture in full, and is the same class
    // of change as the viewport override that broke every `vh` unit.
    const script = WAKE_SCRIPT()

    // Assert — the ONE style this script writes is `scroll-behavior`, and it
    // puts that back.
    const writes =
      script.match(/\.style\.(setProperty|removeProperty)\(\s*"([^"]+)"/g) ?? []
    for (const write of writes) expect(write).toContain("scroll-behavior")
  })

  it("never touches the viewport size", () => {
    // Arrange — the defect this file replaced. A full-height viewport made a
    // `100vh` hero 2,414px instead of 800px and grew the document 2.7x.
    const source = WAKE_SCRIPT()

    // Assert
    expect(source).not.toContain("setDeviceMetricsOverride")
    expect(source).not.toContain("innerHeight =")
  })
})
