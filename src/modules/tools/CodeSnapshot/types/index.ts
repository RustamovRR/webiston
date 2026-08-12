/**
 * One styled run of text, as Shiki hands it over.
 *
 * Deliberately NOT `ThemedToken` from `@shikijs/types`: that type drags the
 * whole Shiki type graph — grammars, engines, theme registries — into every
 * file that touches layout, and layout needs exactly four fields. Narrowing it
 * here is also what lets the layout tests run without loading Shiki at all.
 */
export interface CodeToken {
  content: string
  /** 6- or 8-digit hex, straight from the theme. */
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
}

/** A source line is a list of runs; an empty line is an empty list. */
export type CodeLine = CodeToken[]

/** What sits behind the window. `none` exports with a transparent margin. */
export type BackgroundKind = "solid" | "gradient" | "none"

export interface Background {
  kind: BackgroundKind
  /** Used by `solid`, and as the first stop of `gradient`. */
  from: string
  /** Second stop. Ignored unless `kind` is `gradient`. */
  to?: string
  /** Degrees, clockwise from "to top". Ignored unless `kind` is `gradient`. */
  angle?: number
}

/**
 * The chrome drawn around the code.
 *
 * `macos` is the familiar three-dot bar, `plain` a bare rounded card, `none`
 * no card at all — code straight onto the background, which is what people
 * embedding into their own slides usually want.
 */
export type WindowFrame = "macos" | "plain" | "none"

export interface SnapshotOptions {
  fontFamily: string
  fontSize: number
  /** Multiplier, not pixels — `1.6` reads better than `25.6px` in the UI. */
  lineHeight: number
  /** Space between the background edge and the window. */
  padding: number
  frame: WindowFrame
  /** Shown in the title bar. Empty string hides it; `none` ignores it. */
  title: string
  showLineNumbers: boolean
  /** So a snippet lifted from line 340 can say so. */
  firstLineNumber: number
  background: Background
  /**
   * 1-based line numbers to keep at full strength. Empty means "no focus" —
   * every line is drawn normally. Any non-empty set dims the rest.
   */
  focusLines: number[]
}

/** A run positioned on the canvas, ready to paint. */
export interface LaidOutToken {
  text: string
  x: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  /** Advance width, measured — needed for underline and strikethrough rules. */
  width: number
}

export interface LaidOutLine {
  /** Baseline y for every token on this line. */
  baseline: number
  /** Top edge of the line's box, for the focus dimming and diff tints. */
  top: number
  tokens: LaidOutToken[]
  /** Already formatted; `null` when line numbers are off. */
  number: string | null
  /** False when `focusLines` is non-empty and this line is not in it. */
  focused: boolean
}

export interface Layout {
  /** CSS pixels. Multiply by the export scale for the backing store. */
  width: number
  height: number
  /** The card, in CSS pixels. Zero-sized when the frame is `none`. */
  window: { x: number; y: number; width: number; height: number }
  /** Height of the title bar inside the window; 0 unless the frame is `macos`. */
  titleBarHeight: number
  /** Width of the line-number column including its gap; 0 when numbers are off. */
  gutterWidth: number
  /**
   * Left edge of the code, in background space — where the first glyph of a
   * non-empty line starts.
   *
   * Exported rather than left to the painter to reconstruct. Deriving it from
   * `window.x + window.width - gutterWidth` puts the line numbers against the
   * RIGHT edge of the card, and reading it off the first token breaks on a
   * blank first line, which has no tokens to read.
   */
  codeX: number
  lines: LaidOutLine[]
  lineHeight: number
}

/**
 * How the caller measures text.
 *
 * Injected rather than taken from a canvas so the layout is a pure function:
 * the tests pass a deterministic stub and assert exact pixel positions, which
 * is impossible against a real `CanvasRenderingContext2D` under jsdom.
 */
export type MeasureText = (
  text: string,
  font: { size: number; family: string; bold: boolean; italic: boolean }
) => number
