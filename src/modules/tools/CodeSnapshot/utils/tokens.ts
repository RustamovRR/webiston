import type { CodeLine } from "../types"

/**
 * Shiki's token shape, decoded into ours.
 *
 * Lives apart from `highlight.ts` on purpose. That module statically imports
 * `shiki/core`, the JS regex engine and the 360-entry grammar registry — so a
 * unit test for a bit-field decoder was pulling all of Shiki into memory just
 * to check that 3 means bold-and-italic. Nothing here imports anything.
 */

/**
 * `fontStyle` is a BIT FIELD, not an enum value.
 *
 * `@shikijs/vscode-textmate` defines Italic 1, Bold 2, Underline 4,
 * Strikethrough 8, so a bold italic comment arrives as `3`. Comparing it with
 * `===` — the obvious thing to write — silently drops every combined style,
 * and the symptom is subtle enough to ship: most themes use one flag at a
 * time, so it looks correct until someone picks a theme that italicises and
 * bolds the same scope.
 *
 * The other value in that enum is `NotSet = -1`, and it is a trap: -1 is all
 * bits set, so every mask is truthy. Read without the `> 0` guard, "this scope
 * has no explicit style" becomes bold, italic, underlined and struck through
 * at once. Caught by a test, not by review.
 */
const ITALIC = 1
const BOLD = 2
const UNDERLINE = 4
const STRIKETHROUGH = 8

export interface RawToken {
  content: string
  color?: string
  fontStyle?: number
}

export function toCodeLine(tokens: RawToken[]): CodeLine {
  return tokens.map((token) => {
    const raw = token.fontStyle ?? 0
    const style = raw > 0 ? raw : 0
    return {
      content: token.content,
      color: token.color,
      italic: (style & ITALIC) !== 0,
      bold: (style & BOLD) !== 0,
      underline: (style & UNDERLINE) !== 0,
      strikethrough: (style & STRIKETHROUGH) !== 0
    }
  })
}

/**
 * Drop ONE trailing newline, and only one.
 *
 * Almost every file ends with `\n`, and `codeToTokens` splits on it — so a
 * four-line snippet arrives as five lines, the fifth empty. On screen that is
 * a blank row of dead space under the code, which reads as a lopsided window
 * rather than as a bug, so it survives review; the line-number gutter is what
 * finally makes it visible by counting to 5.
 *
 * One, not all: a snippet that deliberately ends in blank lines keeps them.
 */
export function trimTrailingNewline(code: string): string {
  return code.endsWith("\n") ? code.slice(0, -1) : code
}
