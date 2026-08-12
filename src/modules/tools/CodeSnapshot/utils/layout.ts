import {
  DOTS_WIDTH,
  FALLBACK_FOREGROUND,
  GUTTER_GAP,
  TITLE_BAR_HEIGHT,
  TITLE_FONT_SIZE,
  WINDOW_INSET
} from "../constants"
import type {
  CodeLine,
  LaidOutLine,
  LaidOutToken,
  Layout,
  MeasureText,
  SnapshotOptions
} from "../types"

/**
 * Turn tokens into pixel positions. Pure, and that is the point.
 *
 * Nothing here touches a canvas, a DOM node or a font file — it asks for widths
 * through the injected `measure` and returns numbers. Two things fall out of
 * that: the whole geometry is unit-testable under jsdom (which has no canvas
 * implementation at all, so a layout coupled to `CanvasRenderingContext2D`
 * could only ever be tested by eye), and the preview and the export can share
 * one set of coordinates instead of two implementations that drift.
 *
 * Everything is in CSS pixels at scale 1. The exporter multiplies once, at the
 * backing store, so a 3x PNG is genuinely three times the resolution rather
 * than an upscaled 1x.
 */
export function layoutSnapshot(
  lines: CodeLine[],
  options: SnapshotOptions,
  measure: MeasureText
): Layout {
  const {
    fontFamily,
    fontSize,
    padding,
    frame,
    showLineNumbers,
    firstLineNumber,
    focusLines
  } = options

  // Rounded, because a fractional line height accumulates: at 1.6 × 13px the
  // hundredth line would sit 0.8px off from where a rounded step puts it, and
  // the focus overlay would straddle two lines.
  const lineHeight = Math.round(fontSize * options.lineHeight)

  const font = (bold: boolean, italic: boolean) => ({
    size: fontSize,
    family: fontFamily,
    bold,
    italic
  })

  /**
   * The gutter is sized from the LAST number, not the first.
   *
   * With `firstLineNumber` at 998 and three lines, the widths are 998, 999,
   * 1000 — measuring the first would clip the last. Monospace makes this a
   * width-of-the-longest-string question, and the longest string is the
   * biggest number.
   */
  const lastNumber = firstLineNumber + Math.max(lines.length - 1, 0)
  const gutterWidth =
    showLineNumbers && lines.length > 0
      ? measure(String(lastNumber), font(false, false)) + GUTTER_GAP
      : 0

  // An empty focus set means "no focus", not "focus nothing" — otherwise
  // clearing the selection would dim the entire snapshot.
  const focus = new Set(focusLines)
  const hasFocus = focus.size > 0

  const titleBarHeight = frame === "macos" ? TITLE_BAR_HEIGHT : 0
  const inset = frame === "none" ? 0 : WINDOW_INSET
  const codeX = inset + gutterWidth
  const codeY = titleBarHeight + inset

  let widest = 0
  const laidOut: LaidOutLine[] = lines.map((tokens, index) => {
    const top = codeY + index * lineHeight
    let x = codeX
    const placed: LaidOutToken[] = []

    // Where the last token that actually leaves ink ends. NOT `x`: most
    // editors leave trailing whitespace, Shiki emits it as real tokens, and
    // `paint.ts` refuses to draw a token with no visible glyphs — so measuring
    // to `x` would widen the card by whitespace nobody can see. Twenty
    // trailing spaces at 14px is ~168px of empty right margin.
    let inkedRight = codeX

    for (const token of tokens) {
      const bold = token.bold ?? false
      const italic = token.italic ?? false
      const width = measure(token.content, font(bold, italic))

      placed.push({
        text: token.content,
        x,
        width,
        bold,
        italic,
        color: token.color ?? FALLBACK_FOREGROUND,
        underline: token.underline ?? false,
        strikethrough: token.strikethrough ?? false
      })
      x += width
      // Underline and strikethrough are ink even over a space, and the painter
      // draws them — so those runs do count.
      if (token.content.trim() || token.underline || token.strikethrough) {
        inkedRight = x
      }
    }

    widest = Math.max(widest, inkedRight - codeX)

    return {
      top,
      // `middle`, not an ascent guess. Canvas can centre a glyph in its em box
      // for us; computing a baseline from an assumed ascent is exactly the
      // arithmetic that put the privacy-policy heading 3.2px out of its line
      // box on one machine and not another.
      baseline: top + lineHeight / 2,
      tokens: placed,
      number: showLineNumbers ? String(firstLineNumber + index) : null,
      focused: !hasFocus || focus.has(index + 1)
    }
  })

  /**
   * The title bar has its own minimum width, and it is not the code's.
   *
   * Sizing the card from the code alone means `hi` in a macOS frame produces a
   * ~52px card while the three dots need 64px — the green one is painted on
   * the background, outside the window. The title is worse: the painter
   * centres it, so a filename spills past both edges and is clipped by the
   * canvas boundary. Both are invisible in the tests until a case pairs a
   * short line with a long title.
   */
  const titleBarWidth =
    frame === "macos"
      ? Math.max(
          DOTS_WIDTH + inset,
          // Centred, so the dots' width has to be cleared on BOTH sides for
          // the title to sit in the middle without colliding.
          DOTS_WIDTH * 2 +
            (options.title
              ? measure(options.title, {
                  size: TITLE_FONT_SIZE,
                  family: fontFamily,
                  bold: false,
                  italic: false
                })
              : 0)
        )
      : 0

  const windowWidth = Math.max(codeX + widest + inset, titleBarWidth)
  const windowHeight = codeY + lines.length * lineHeight + inset

  return {
    width: windowWidth + padding * 2,
    height: windowHeight + padding * 2,
    window: {
      x: padding,
      y: padding,
      width: windowWidth,
      height: windowHeight
    },
    titleBarHeight,
    gutterWidth,
    codeX: codeX + padding,
    lineHeight,
    // Shifted into background space here rather than at paint time, so the
    // painter never has to know the padding exists.
    lines: laidOut.map((line) => ({
      ...line,
      top: line.top + padding,
      baseline: line.baseline + padding,
      tokens: line.tokens.map((token) => ({ ...token, x: token.x + padding }))
    }))
  }
}
