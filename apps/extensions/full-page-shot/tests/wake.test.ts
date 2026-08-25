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
    expect(script).toContain("host?.remove()")
  })

  it("never leaves its overlay behind for the camera", () => {
    // Arrange — the overlay is injected into the page, so if it outlived the
    // wake phase it would be composited INTO the screenshot. `finally` is the
    // only guarantee that survives a throw halfway through the scroll.
    const source = WAKE_SCRIPT(labels)

    // Assert
    expect(source).toContain("} finally {")
    expect(source).toContain("host?.remove()")
  })

  it("ends at the top of the document and hands back where the visitor was", () => {
    // Arrange / Act — MEASURED on webiston.uz: `captureBeyondViewport` paints
    // fixed and sticky boxes at the CURRENT scroll offset, so a capture taken
    // at the visitor's offset strands the site header and both sidebars that
    // far down the image. The position comes back in the report instead, for
    // the caller to restore after the shutter.
    const source = WAKE_SCRIPT(labels)

    // Assert
    expect(source).toContain("const startedAt = window.scrollY")
    // A panel is the opposite case: the window never moved, so the visitor's
    // own position is the one worth showing and there is nothing to restore.
    expect(source).toContain("jump(panel ? startedAt : 0)")
    expect(source).toContain("startedAt: panel ? 0 : startedAt")
  })

  it("covers the page opaquely while it walks", () => {
    // Arrange / Act — a translucent scrim still shows the jumps; measured at
    // 97%, body text on a light page stayed legible.
    const source = WAKE_SCRIPT(labels)

    // Assert
    expect(source).not.toContain("opacity:.9")
    expect(source).toContain("style.background = pageBackground")
  })

  it("walks the panel when the DOCUMENT is not what scrolls", () => {
    // Arrange / Act — Gmail, Slack and most dashboards put `overflow: hidden`
    // on the document. Measured on a page of that shape before this existed:
    // 36 of 40 images never started loading and the capture burned the whole
    // 4-second image deadline waiting for them. After: 40 of 40, 894ms.
    const script = WAKE_SCRIPT(labels)

    // Assert
    expect(script).toContain("findScroller")
    expect(script).toContain("panel.scrollTop = y")
    expect(script).toContain("innerScroll: !!panel")
  })

  it("never changes a computed style to make the page photograph better", () => {
    // Arrange / Act — forcing `overflow: visible` on somebody's app shell
    // would make an inner-scroll page capture in full, and is the same class
    // of change as the viewport override that broke every `vh` unit.
    const script = WAKE_SCRIPT(labels)

    // Assert — the ONE style this script writes is `scroll-behavior`, and it
    // puts that back.
    const writes =
      script.match(/\.style\.(setProperty|removeProperty)\(\s*"([^"]+)"/g) ?? []
    for (const write of writes) expect(write).toContain("scroll-behavior")
  })

  it("hands the caller a controller instead of tearing itself down", () => {
    // Arrange / Act — reported by the owner: a bar that fills, disappears,
    // and is then followed by several more seconds of work says "done" and
    // then makes you wait. The shutter and the assembly are the rest of the
    // job, so the overlay outlives the wake and the capture drives it.
    const script = WAKE_SCRIPT(labels)

    // Assert
    expect(script).toContain("hide()")
    expect(script).toContain("async done()")
    expect(script).toContain("abort()")
    // …and a failed wake still takes it down itself.
    expect(script).toContain("if (!ok) {")
  })

  it("sizes the cover in pixels so it cannot grow with the clip", () => {
    // Arrange / Act — `captureBeyondViewport` renders with the viewport blown
    // up to the whole clip. A box pinned to all four insets would grow with
    // it and cover the entire screenshot instead of one viewport.
    const script = WAKE_SCRIPT(labels)

    // Assert
    expect(script).not.toMatch(/position:fixed;inset:0/)
    expect(script).toContain("window.innerHeight")
  })

  it("tells the caller a cover is standing in the picture", () => {
    // Arrange / Act — the cover now stays up through the shutter, so the top
    // viewport of the image has to be replaced by a patch capture. That only
    // happens if the wake says there is something to patch.
    const script = WAKE_SCRIPT(labels)

    // Assert
    expect(script).toContain("covered: !!host")
  })

  it("keeps the wake inside its own share of the bar", () => {
    // Arrange / Act — the wake is not the whole operation, so it must not
    // paint the whole bar.
    const script = WAKE_SCRIPT(labels)

    // Assert
    expect(script).toMatch(/paint\(label, ratio \* 0?\.\d+\)/)
  })

  it("gives the opaque overlay a dead-man switch", () => {
    // Arrange / Act — `finally` covers every ordinary path, but a full-screen
    // cover that outlived the capture would leave a blank page with no way
    // out, so it also takes itself down on a timer.
    const source = WAKE_SCRIPT(labels)

    // Assert
    expect(source).toMatch(/setTimeout\(\(\) => host\?\.remove\(\), \d+\)/)
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
