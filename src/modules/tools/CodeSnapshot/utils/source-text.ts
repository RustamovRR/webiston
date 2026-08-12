import { TAB_WIDTH } from "../constants"

/**
 * Put pasted, dropped and shared source into the one shape this tool can draw.
 *
 * **A canvas has no tab stops.** Measured on a real 2D context: `measureText`
 * returns the SAME width for `"\t"` and for `" "` — the text preparation
 * algorithm converts every space character, tab and carriage return included,
 * to a single U+0020 before anything is measured or drawn. So a tab is one
 * space on the picture, and there is no context property that changes it.
 *
 * That breaks two things at once, and the second is the serious one:
 *
 * 1. **Indentation collapses.** Go is tab-indented by definition — `gofmt`
 *    emits tabs and there is no option not to — and so are Makefiles and a
 *    great deal of C. Eight levels of nesting draw as eight single spaces.
 * 2. **The caret leaves its glyph.** The textarea layered over the canvas
 *    honours `tab-size`, which this editor sets to `INDENT.length`, so the DOM
 *    advances a tab by two columns while the canvas advances it by one. The
 *    whole "the picture IS the editor" alignment — the thing measured to
 *    0.006px over a 37-character line before this pattern was adopted — is off
 *    by a character per tab on any line that contains one.
 *
 * Both disappear if the tabs never reach the state. Expanding on the way IN,
 * rather than at paint time, is what keeps the textarea and the canvas looking
 * at identical text.
 *
 * Line endings are normalised in the same pass, for a related reason: `\r` is
 * also a space to a canvas, so a file saved on Windows would draw a trailing
 * space on every line and widen the card by it.
 */

/**
 * Expand to real tab STOPS, not a fixed run of spaces.
 *
 * `"a\tb"` is not `"a" + 4 spaces + "b"` — the tab advances to the next
 * multiple of the width, so it is `"a" + 3 spaces + "b"`. The naive version is
 * right only for tabs at the start of a line, which is most of them, and
 * visibly wrong for the aligned trailing comments and Makefile rules that are
 * the other reason a tab is in the file at all.
 */
function expandTabs(line: string): string {
  let out = ""
  for (const character of line) {
    if (character !== "\t") {
      out += character
      continue
    }
    out += " ".repeat(TAB_WIDTH - (out.length % TAB_WIDTH))
  }
  return out
}

export function normaliseSource(text: string): string {
  // The common case is text that needs nothing, and it runs on every
  // keystroke — so it costs two scans and returns the same reference, which
  // lets React bail out of the render entirely.
  if (!text.includes("\t") && !text.includes("\r")) return text

  return text.replace(/\r\n?/g, "\n").split("\n").map(expandTabs).join("\n")
}
