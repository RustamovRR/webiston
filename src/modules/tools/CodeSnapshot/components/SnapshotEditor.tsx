"use client"

import type {
  ChangeEvent,
  ClipboardEvent,
  DragEvent,
  KeyboardEvent,
  RefObject
} from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

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
  /** Handed a file dragged onto the picture. */
  onDropFile: (file: File) => void
  /** Shown over the picture while a file is being dragged across it. */
  dropHint: string
  /** Positional, 1-based line numbers currently kept at full strength. */
  focusLines: number[]
  onToggleLineFocus: (line: number) => void
  /** `{number}` is the number PRINTED in the gutter, not the position. */
  focusLabel: (printed: string) => string
  /** Holds the PREVIOUS frame, cross-faded out by the hook after a repaint. */
  ghostRef: RefObject<HTMLCanvasElement | null>
  /** Reports the zoom actually applied, so the panel can say so. */
  onFitChange: (fit: number) => void
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
  onPaste,
  onDropFile,
  dropHint,
  focusLines,
  onToggleLineFocus,
  focusLabel,
  ghostRef,
  onFitChange
}: SnapshotEditorProps) {
  const [dragging, setDragging] = useState(false)

  /**
   * Shrink the picture until all of it is visible. Never enlarge it.
   *
   * carbon.now.sh, ray.so and codeimage all fit the preview to the panel, for
   * the reason this tool needs it too: you are composing a picture, so you
   * have to be able to see the picture. Before this, the "Slayd" preset drew a
   * 1175 CSS-px card into a ~900px panel and put the right-hand third behind a
   * horizontal scrollbar.
   *
   * A CSS transform, not a smaller canvas. The backing store stays at export
   * resolution, so a scaled-down preview is SHARPER rather than softer — and
   * the textarea and the gutter buttons live inside the same transformed box,
   * so they scale with it and the caret stays exactly on its glyph. That
   * alignment is the whole reason this editor works, and it survives for free.
   *
   * Only ever downward: blowing a small snapshot up would be soft and would
   * lie about what the export looks like.
   */
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [boxWidth, setBoxWidth] = useState(0)

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return
    const observer = new ResizeObserver(([entry]) => {
      setBoxWidth(entry.contentRect.width)
    })
    /**
     * Seed it synchronously, the SAME way the observer measures.
     *
     * Two mistakes were made here in one sitting and both are worth keeping.
     * The first version seeded from `clientWidth`, which INCLUDES the padding
     * while `contentRect` excludes it: the two disagreed by 32px and the wrong
     * one stood until the next resize, so a picture that needed 0.728 was
     * scaled to 0.761 and still overflowed. The second dropped the seed
     * entirely and trusted `ResizeObserver` to fire on `observe()` — which it
     * does, EXCEPT in a hidden tab, where it never delivered at all and the
     * fit stayed 1. So: seed it, and subtract the padding the same way.
     */
    const measure = () => {
      const style = getComputedStyle(box)
      const padding =
        Number.parseFloat(style.paddingLeft) +
        Number.parseFloat(style.paddingRight)
      setBoxWidth(Math.max(box.clientWidth - padding, 0))
    }

    measure()
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const fit = layout && boxWidth > 0 ? Math.min(1, boxWidth / layout.width) : 1

  useEffect(() => {
    onFitChange(fit)
  }, [fit, onFitChange])
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

  /**
   * Drag and drop, with the two `preventDefault` calls that make it work.
   *
   * `dragOver` must be cancelled or the browser refuses the drop and navigates
   * to the file instead — the whole page is replaced by the raw source, which
   * is the classic way this feature ships broken. `drop` is cancelled for the
   * same reason.
   *
   * `dragLeave` fires when the pointer crosses into a CHILD element too, so
   * the highlight would flicker off as soon as the file passed over the
   * canvas. `relatedTarget` is where the pointer went; if that is still inside
   * this box, the drag never left.
   */
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) return
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    // The first file only. Dropping a folder of source and getting one
    // arbitrary picture is not a feature anyone asked for.
    const file = event.dataTransfer.files[0]
    if (file) onDropFile(file)
  }

  return (
    // The drop target is the scroll box, not the canvas: a file has to be
    // accepted anywhere over the editor, including the margin around a short
    // snippet. Not focusable and carries no role — dropping is an ALTERNATIVE
    // to typing, never the only way in, and the textarea inside it is the
    // real control.
    // biome-ignore lint/a11y/noStaticElementInteractions: a drop target has no
    // keyboard equivalent to offer; every path it opens (paste, type, pick a
    // language) is already reachable from the controls beside it.
    <div
      ref={boxRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      // `scrollbar-gutter: stable` is not cosmetic here, it breaks a LOOP.
      // The fit is measured from this box, and the fit decides the picture's
      // height, which decides whether a vertical scrollbar appears, which
      // changes this box's content width — so a scrollbar that comes and goes
      // makes the scale oscillate forever. Reserving the gutter permanently
      // makes the measurement independent of what is inside.
      style={{ scrollbarGutter: "stable" }}
      className={`relative max-h-[calc(100dvh-14rem)] min-h-[320px] overflow-auto rounded-lg border bg-muted/30 p-4 ${
        dragging ? "border-primary border-dashed" : "border-border"
      }`}
    >
      {dragging && (
        <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 font-medium text-foreground text-sm">
          {dropHint}
        </p>
      )}
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
      {/* Two boxes, and both are load-bearing. A CSS transform does not change
          layout size, so without an outer box reserving the SCALED dimensions
          the scroll container would still believe the content is full width
          and keep its scrollbar. `mx-auto` centres a picture narrower than the
          panel instead of leaving it against one edge. */}
      <div
        // `overflow-hidden` is what makes the fit actually fit. A transform
        // scales what you SEE and leaves the layout box alone, so the stage
        // inside still measures its full unscaled width — and the scroll
        // container was reading that and showing a horizontal scrollbar for a
        // picture already comfortably inside the panel. Clipping to the
        // reserved size removes nothing visible: everything in the stage is
        // within the picture's own bounds once scaled.
        className="mx-auto overflow-hidden transition-[width,height] duration-200 ease-out motion-reduce:transition-none"
        style={
          layout
            ? { width: layout.width * fit, height: layout.height * fit }
            : undefined
        }
      >
        <div
          className="relative min-h-[16rem] w-fit"
          style={{ transform: `scale(${fit})`, transformOrigin: "top left" }}
        >
          {/* No `style` here on purpose. `paintSnapshot` sets the CSS size in
            the same task as the backing store — measured, React was 2.6ms
            behind, and for that frame the new picture was squashed into the
            old box at a 3.46× ratio instead of 2×. One writer, no gap. */}
          <canvas ref={canvasRef} className="block" />
          {/* The PREVIOUS frame, held over the new one and faded out by the
              hook. A cross-dissolve is the only way to ease a canvas swap:
              its CONTENT cannot be transitioned, so the old bitmap has to be
              kept and dissolved over the new one. `pointer-events-none` so it
              never intercepts the caret. */}
          <canvas
            ref={ghostRef}
            className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-200 ease-out motion-reduce:transition-none"
          />
          {/* One hit area per line number, sized and placed from the layout the
            painter used — so what you click is exactly what you see.
            Real `<button>`s, not one click handler over the strip with the
            line worked out from `offsetY`: that version is mouse-only, and
            this is the control that ray.so does not have and snappify charges
            for. The gutter sits LEFT of `codeX`, which is where the textarea
            starts, so nothing overlaps.
            Rendered only when the numbers are on — there is nothing to click
            otherwise, and `gutterWidth` is 0. */}
          {layout && layout.gutterWidth > 0 && (
            <div className="pointer-events-none absolute inset-0">
              {layout.lines.map((line, index) =>
                line.number === null ? null : (
                  <button
                    key={line.number}
                    type="button"
                    // POSITIONAL, not the printed number: the layout dims by
                    // position, and `firstLineNumber` lets a snippet lifted from
                    // line 340 print 340 while still being line 1.
                    onClick={() => onToggleLineFocus(index + 1)}
                    aria-pressed={focusLines.includes(index + 1)}
                    className="pointer-events-auto absolute cursor-pointer rounded-[3px] hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-ring"
                    style={{
                      left: layout.codeX - layout.gutterWidth,
                      top: line.top,
                      width: layout.gutterWidth,
                      height: layout.lineHeight
                    }}
                  >
                    {/* The number itself is painted on the canvas underneath;
                      this is the name assistive tech reads. `sr-only` is safe
                      HERE — it hides text inside a button that has real size,
                      unlike a focusable element collapsed to a point. */}
                    <span className="sr-only">{focusLabel(line.number)}</span>
                  </button>
                )
              )}
            </div>
          )}
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
    </div>
  )
}
