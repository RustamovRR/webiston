import { describe, expect, it } from "vitest"

import {
  DEFAULT_OPTIONS,
  DOTS_WIDTH,
  GUTTER_GAP,
  TITLE_BAR_HEIGHT,
  TITLE_FONT_SIZE,
  WINDOW_INSET
} from "../constants"
import type { CodeLine, MeasureText, SnapshotOptions } from "../types"
import { layoutSnapshot } from "./layout"

/**
 * A monospace ruler: every character is exactly 10px wide at 20px, so every
 * expectation below is arithmetic anyone can check by hand. A real
 * `measureText` would make these assertions font-version-dependent, which is
 * the opposite of what a geometry test is for.
 */
const CHAR_WIDTH = 0.5
const measure: MeasureText = (text, font) =>
  text.length * font.size * CHAR_WIDTH

const options = (
  overrides: Partial<SnapshotOptions> = {}
): SnapshotOptions => ({
  ...DEFAULT_OPTIONS,
  fontSize: 20,
  lineHeight: 1.5,
  padding: 40,
  ...overrides
})

const line = (text: string): CodeLine => [{ content: text }]

describe("layoutSnapshot", () => {
  it("sizes the canvas from the widest line, not the last one", () => {
    // Arrange — the long line is in the middle, so a naive "last line wins"
    // implementation would clip it.
    const lines = [line("ab"), line("abcdefghij"), line("abc")]

    // Act
    const layout = layoutSnapshot(lines, options({ frame: "plain" }), measure)

    // Assert — 10 chars × 10px, plus both insets, plus both paddings.
    const widest = 10 * 20 * CHAR_WIDTH
    expect(layout.window.width).toBe(widest + WINDOW_INSET * 2)
    expect(layout.width).toBe(layout.window.width + 40 * 2)
  })

  it("stacks lines by a rounded line height", () => {
    // Arrange — 20 × 1.5 is exactly 30, so rounding is a no-op and the step is
    // checkable; the rounding itself is covered by the next test.
    const layout = layoutSnapshot(
      [line("a"), line("b"), line("c")],
      options({ frame: "plain" }),
      measure
    )

    // Act
    const tops = layout.lines.map((l) => l.top)

    // Assert
    expect(layout.lineHeight).toBe(30)
    expect(tops[1] - tops[0]).toBe(30)
    expect(tops[2] - tops[1]).toBe(30)
  })

  it("rounds the line height so steps never accumulate error", () => {
    // Arrange — 13 × 1.6 = 20.8.
    const layout = layoutSnapshot(
      Array.from({ length: 10 }, () => line("x")),
      options({ fontSize: 13, lineHeight: 1.6, frame: "plain" }),
      measure
    )

    // Act / Assert — 21, and the tenth line is an exact multiple of it. At
    // 20.8 the tenth line would land on a fraction and the focus overlay
    // would straddle two rows.
    expect(layout.lineHeight).toBe(21)
    const first = layout.lines[0].top
    expect(layout.lines[9].top - first).toBe(21 * 9)
    expect(Number.isInteger(layout.lines[9].top)).toBe(true)
  })

  it("advances tokens by their measured width", () => {
    // Arrange
    const lines: CodeLine[] = [
      [{ content: "const" }, { content: " " }, { content: "x" }]
    ]

    // Act
    const [laid] = layoutSnapshot(
      lines,
      options({ frame: "plain" }),
      measure
    ).lines

    // Assert — 5, 1 and 1 characters at 10px each, from the same origin.
    const origin = laid.tokens[0].x
    expect(laid.tokens[1].x).toBe(origin + 50)
    expect(laid.tokens[2].x).toBe(origin + 60)
  })

  /**
   * The bug this pins down: sizing the gutter from `firstLineNumber` alone.
   * Starting at 998 with three lines means the widest label is "1000", and a
   * gutter measured from "998" clips it.
   */
  it("sizes the line-number gutter from the LAST number", () => {
    // Arrange
    const lines = [line("a"), line("b"), line("c")]

    // Act
    const layout = layoutSnapshot(
      lines,
      options({ showLineNumbers: true, firstLineNumber: 998, frame: "plain" }),
      measure
    )

    // Assert — "1000" is 4 characters, not 3.
    expect(layout.gutterWidth).toBe(4 * 20 * CHAR_WIDTH + GUTTER_GAP)
    expect(layout.lines.map((l) => l.number)).toEqual(["998", "999", "1000"])
  })

  it("reserves no gutter when line numbers are off", () => {
    // Arrange / Act
    const layout = layoutSnapshot(
      [line("a")],
      options({ showLineNumbers: false, frame: "plain" }),
      measure
    )

    // Assert
    expect(layout.gutterWidth).toBe(0)
    expect(layout.lines[0].number).toBeNull()
  })

  /**
   * `codeX` is where the painter right-aligns the line numbers, at
   * `codeX - GUTTER_GAP`. The first version of the painter reconstructed it as
   * `window.x + window.width - gutterWidth` and put every number against the
   * card's right edge instead.
   */
  it("reports codeX as the left edge of the code, past the gutter", () => {
    // Arrange
    const lines = [line("a"), line("b")]

    // Act
    const layout = layoutSnapshot(
      lines,
      options({ showLineNumbers: true, frame: "plain" }),
      measure
    )

    // Assert — it agrees with where a real token was actually placed…
    expect(layout.codeX).toBe(layout.lines[0].tokens[0].x)
    // …and it sits at padding + inset + gutter, not near the right edge.
    expect(layout.codeX).toBe(40 + WINDOW_INSET + layout.gutterWidth)
    expect(layout.codeX).toBeLessThan(layout.window.x + layout.window.width)
  })

  it("still reports codeX when the first line is blank", () => {
    // Arrange — a blank first line has no token to read a position from,
    // which is why the painter must not derive `codeX` from the tokens.
    const lines: CodeLine[] = [[], line("abc")]

    // Act
    const layout = layoutSnapshot(
      lines,
      options({ showLineNumbers: true, frame: "plain" }),
      measure
    )

    // Assert
    expect(layout.lines[0].tokens).toEqual([])
    expect(layout.codeX).toBe(layout.lines[1].tokens[0].x)
  })

  it("adds a title bar only for the macOS frame", () => {
    // Arrange
    const lines = [line("a")]

    // Act
    const mac = layoutSnapshot(lines, options({ frame: "macos" }), measure)
    const plain = layoutSnapshot(lines, options({ frame: "plain" }), measure)

    // Assert
    expect(mac.titleBarHeight).toBe(TITLE_BAR_HEIGHT)
    expect(plain.titleBarHeight).toBe(0)
    expect(mac.window.height - plain.window.height).toBe(TITLE_BAR_HEIGHT)
  })

  it("drops the window inset entirely when there is no frame", () => {
    // Arrange / Act
    const layout = layoutSnapshot(
      [line("abcd")],
      options({ frame: "none", padding: 0 }),
      measure
    )

    // Assert — code sits flush against the background.
    expect(layout.window.width).toBe(4 * 20 * CHAR_WIDTH)
    expect(layout.lines[0].tokens[0].x).toBe(0)
  })

  /**
   * An empty focus set has to mean "no focus". Reading it as "focus nothing"
   * would dim the whole snapshot the moment the reader cleared their
   * selection — a state that looks like a rendering failure.
   */
  it("treats an empty focus set as no focus at all", () => {
    // Arrange / Act
    const layout = layoutSnapshot(
      [line("a"), line("b")],
      options({ focusLines: [] }),
      measure
    )

    // Assert
    expect(layout.lines.map((l) => l.focused)).toEqual([true, true])
  })

  it("marks only the focused lines, counting from 1", () => {
    // Arrange / Act
    const layout = layoutSnapshot(
      [line("a"), line("b"), line("c")],
      options({ focusLines: [2] }),
      measure
    )

    // Assert — line 2 is index 1.
    expect(layout.lines.map((l) => l.focused)).toEqual([false, true, false])
  })

  it("centres the baseline in the line box", () => {
    // Arrange / Act
    const layout = layoutSnapshot([line("a")], options(), measure)

    // Assert
    const [first] = layout.lines
    expect(first.baseline - first.top).toBe(layout.lineHeight / 2)
  })

  it("offsets everything by the padding exactly once", () => {
    // Arrange
    const lines = [line("abc")]

    // Act
    const bare = layoutSnapshot(lines, options({ padding: 0 }), measure)
    const padded = layoutSnapshot(lines, options({ padding: 40 }), measure)

    // Assert
    expect(padded.width - bare.width).toBe(80)
    expect(padded.height - bare.height).toBe(80)
    expect(padded.window.x).toBe(40)
    expect(padded.lines[0].tokens[0].x - bare.lines[0].tokens[0].x).toBe(40)
    expect(padded.lines[0].top - bare.lines[0].top).toBe(40)
  })

  it("survives an empty document without producing a negative size", () => {
    // Arrange / Act
    const layout = layoutSnapshot([], options(), measure)

    // Assert
    expect(layout.lines).toEqual([])
    expect(layout.width).toBeGreaterThan(0)
    expect(layout.height).toBeGreaterThan(0)
    expect(layout.gutterWidth).toBe(0)
  })

  it("keeps blank lines as full-height rows", () => {
    // Arrange — a blank line inside a snippet is a token-less line, and it
    // still has to occupy its row or the code below shifts up.
    const lines: CodeLine[] = [line("a"), [], line("b")]

    // Act
    const layout = layoutSnapshot(lines, options({ frame: "plain" }), measure)

    // Assert
    expect(layout.lines[1].tokens).toEqual([])
    expect(layout.lines[2].top - layout.lines[0].top).toBe(
      layout.lineHeight * 2
    )
  })
})

/**
 * Every width assertion above uses `frame: "plain"`, which is exactly why
 * these two defects survived: the macOS bar has contents of its own, and the
 * layout was sizing the card from the code alone.
 */
describe("layoutSnapshot — the macOS title bar has its own width", () => {
  it("never draws the traffic lights outside the card", () => {
    // Arrange — two characters. Sized from the code, the card is ~52px while
    // the third dot's right edge is at 64.
    const layout = layoutSnapshot(
      [line("hi")],
      options({ frame: "macos", padding: 0 }),
      measure
    )

    // Act / Assert
    expect(layout.window.width).toBeGreaterThanOrEqual(DOTS_WIDTH)
  })

  it("widens the card so a centred title clears the dots", () => {
    // Arrange — short code, long filename. The painter centres the title at
    // `x + width/2`, so without this the name spills past both edges.
    const title = "components/shared/ToolCard.tsx"
    const layout = layoutSnapshot(
      [line("hi")],
      options({ frame: "macos", padding: 0, title }),
      measure
    )

    // Act — the stub measures at TITLE_FONT_SIZE, not the code size.
    const titleWidth = title.length * TITLE_FONT_SIZE * CHAR_WIDTH

    // Assert — room for the title in the middle, with the dots cleared on
    // both sides of it.
    expect(layout.window.width).toBeGreaterThanOrEqual(
      DOTS_WIDTH * 2 + titleWidth
    )
    const titleLeft = (layout.window.width - titleWidth) / 2
    expect(titleLeft).toBeGreaterThanOrEqual(DOTS_WIDTH)
  })

  it("does not widen a frameless snapshot for a title it never draws", () => {
    // Arrange / Act — `paint.ts` only draws the title in the macOS bar.
    const bare = layoutSnapshot(
      [line("hi")],
      options({ frame: "none", padding: 0 }),
      measure
    )
    const titled = layoutSnapshot(
      [line("hi")],
      options({
        frame: "none",
        padding: 0,
        title: "a-very-long-file-name.tsx"
      }),
      measure
    )

    // Assert
    expect(titled.window.width).toBe(bare.window.width)
  })
})

describe("layoutSnapshot — trailing whitespace is not width", () => {
  /**
   * `paint.ts` skips any token with no visible glyphs, so counting its advance
   * in `widest` adds an empty right margin nobody can see. Most editors leave
   * trailing whitespace, so this is the common case, not an edge one.
   */
  it("ignores trailing whitespace the painter refuses to draw", () => {
    // Arrange
    const withSpaces: CodeLine = [
      { content: "const a = 1" },
      { content: "                    " }
    ]

    // Act
    const padded = layoutSnapshot(
      [withSpaces],
      options({ frame: "plain" }),
      measure
    )
    const clean = layoutSnapshot(
      [line("const a = 1")],
      options({ frame: "plain" }),
      measure
    )

    // Assert
    expect(padded.window.width).toBe(clean.window.width)
  })

  it("still counts whitespace that carries an underline", () => {
    // Arrange — the painter DOES draw a rule over blank text, so that run is
    // ink and has to be measured.
    const underlined: CodeLine = [
      { content: "a" },
      { content: "     ", underline: true }
    ]

    // Act
    const layout = layoutSnapshot(
      [underlined],
      options({ frame: "plain" }),
      measure
    )

    // Assert
    expect(layout.window.width).toBe(6 * 20 * CHAR_WIDTH + WINDOW_INSET * 2)
  })

  it("keeps interior whitespace, which is indentation", () => {
    // Arrange — leading indent is between two inked runs on other lines, and
    // dropping it would left-align the whole snippet.
    const indented: CodeLine = [{ content: "    " }, { content: "return x" }]

    // Act
    const layout = layoutSnapshot(
      [indented],
      options({ frame: "plain" }),
      measure
    )

    // Assert — 4 spaces + 8 characters.
    expect(layout.window.width).toBe(12 * 20 * CHAR_WIDTH + WINDOW_INSET * 2)
  })
})
