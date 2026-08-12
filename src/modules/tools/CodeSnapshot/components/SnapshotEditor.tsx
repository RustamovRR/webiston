"use client"

import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  RefObject
} from "react"

import { INDENT } from "../constants"
import type { Layout } from "../types"

interface SnapshotEditorProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** Geometry of the picture currently painted; null before the first paint. */
  layout: Layout | null
  code: string
  onCodeChange: (code: string) => void
  fontFamily: string
  fontSize: number
  /** The theme's own foreground, so the caret belongs to the picture. */
  caretColor: string
  label: string
  /** Handed the pasted text so the language can be guessed from it. */
  onPaste: (pasted: string) => void
}

/**
 * The picture, and the thing you type into. One surface.
 *
 * carbon.now.sh, codeimage.dev, ray.so and snappify all put the code INSIDE
 * the styled window — the first two on CodeMirror. The two-panel split this
 * replaces existed only because the preview is a canvas, which cannot be
 * typed into, and it cost half the screen to a textarea nobody looked at after
 * their first paste.
 *
 * A canvas can still be typed into, by the oldest trick in the highlighted-
 * editor book: a real `<textarea>` on top with its glyphs made invisible and
 * its caret left visible. Input, selection, copy, undo and IME all stay native
 * because they ARE native; the canvas underneath only draws.
 *
 * **The hazard, measured before committing to it.** The pattern misaligns the
 * caret the moment the drawn text and the textarea disagree about advance
 * width — which bold, italic and ligatures would normally cause. In JetBrains
 * Mono, `measureText("=>")` is 16.79998779296875 and `measureText("=") +
 * measureText(">")` is the same to the digit: a monospace face keeps the
 * advance across weights and ligatures alike. All four fonts offered here are
 * monospace, so the caret holds.
 *
 * `-webkit-text-fill-color`, not `color: transparent`: the former hides the
 * glyphs while leaving `caret-color` free to paint, and it is honoured by
 * Firefox despite the prefix.
 */
export function SnapshotEditor({
  canvasRef,
  layout,
  code,
  onCodeChange,
  fontFamily,
  fontSize,
  caretColor,
  label,
  onPaste
}: SnapshotEditorProps) {
  /**
   * Tab indents; it does not leave.
   *
   * A textarea's default is to move focus, which in a code editor means the
   * first Tab throws the visitor out of the thing they are editing. Keyboard
   * users can still escape with Escape-then-Tab, which is the accessible
   * pattern for an editor that claims the key.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab" || event.shiftKey) return
    event.preventDefault()

    const target = event.currentTarget
    const { selectionStart, selectionEnd } = target
    onCodeChange(
      code.slice(0, selectionStart) + INDENT + code.slice(selectionEnd)
    )
    // Restore the caret after React re-renders with the new value; setting it
    // synchronously would be overwritten by the controlled update.
    requestAnimationFrame(() => {
      target.selectionStart = selectionStart + INDENT.length
      target.selectionEnd = selectionStart + INDENT.length
    })
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    onCodeChange(event.target.value)

  /**
   * The paste is reported, not intercepted.
   *
   * No `preventDefault`: the browser's own paste handles the selection, the
   * caret and the undo stack correctly, and re-implementing that to read the
   * text would trade a working editor for a language guess. The clipboard
   * text is simply handed up alongside it.
   */
  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = event.clipboardData.getData("text")
    if (pasted) onPaste(pasted)
  }

  return (
    <div className="max-h-[calc(100dvh-14rem)] min-h-[320px] overflow-auto rounded-lg border border-border bg-muted/30 p-4">
      {/* `w-fit`, so the wrapper is exactly the picture and the overlay's
          absolute coordinates are the layout's own — no offset arithmetic. */}
      {/* No ARIA on the canvas, deliberately. It has no fallback content and
          no accessible name, so assistive tech already skips it, and the
          textarea layered over it is what carries the name. Both `aria-hidden`
          and `role="presentation"` were tried: Biome believes a `<canvas>` is
          focusable AND interactive, strips the first on `--write` silently and
          rejects the second. The behaviour we want is the default, so the
          honest fix is to assert it in the test rather than annotate it here.
          `CodeSnapshot.test.tsx` checks that no `img` role is exposed. */}
      <div className="relative min-h-[16rem] w-fit min-w-full">
        <canvas
          ref={canvasRef}
          style={
            layout ? { width: layout.width, height: layout.height } : undefined
          }
          className="block"
        />
        <textarea
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label={label}
          // `wrap="off"` matters twice: the canvas never wraps a line, so a
          // wrapping textarea would put the caret on a row that does not
          // exist in the picture.
          wrap="off"
          className="absolute resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
          style={{
            // Before the first paint there is no geometry yet, and the
            // editor still has to exist: a grammar download on a slow
            // connection would otherwise leave the visitor looking at an
            // empty box they cannot type into. It fills the wrapper until
            // the layout arrives, then snaps onto the code.
            left: layout?.codeX ?? 0,
            top: layout?.lines[0]?.top ?? 0,
            width: layout
              ? Math.max(
                  layout.window.x + layout.window.width - layout.codeX,
                  1
                )
              : "100%",
            height: layout
              ? Math.max(
                  layout.lineHeight * Math.max(layout.lines.length, 1),
                  layout.lineHeight
                )
              : "100%",
            fontFamily,
            fontSize,
            // Pixels, not a ratio: the layout already rounded it, and a
            // ratio would re-derive a different number.
            lineHeight: layout ? `${layout.lineHeight}px` : undefined,
            caretColor,
            WebkitTextFillColor: "transparent",
            whiteSpace: "pre",
            tabSize: INDENT.length
          }}
        />
      </div>
    </div>
  )
}
