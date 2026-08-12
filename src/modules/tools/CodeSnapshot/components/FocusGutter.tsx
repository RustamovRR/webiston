import type { Layout } from "../types"

interface FocusGutterProps {
  /** The geometry the painter used, so a hit area lands on its own number. */
  layout: Layout
  /** Positional, 1-based line numbers currently kept at full strength. */
  focusLines: number[]
  onToggle: (line: number) => void
  /** `{number}` is the number PRINTED in the gutter, not the position. */
  label: (printed: string) => string
}

/**
 * One hit area per line number, laid over the painted gutter.
 *
 * Real `<button>`s, not one click handler over the strip with the line worked
 * out from `offsetY`: that version is mouse-only, and this is the control
 * ray.so does not have and snappify charges for. The gutter sits LEFT of
 * `codeX`, which is where the textarea starts, so nothing overlaps.
 */
export function FocusGutter({
  layout,
  focusLines,
  onToggle,
  label
}: FocusGutterProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {layout.lines.map((line, index) =>
        line.number === null ? null : (
          <button
            key={line.number}
            type="button"
            // POSITIONAL, not the printed number: the layout dims by position,
            // and `firstLineNumber` lets a snippet lifted from line 340 print
            // 340 while still being line 1.
            onClick={() => onToggle(index + 1)}
            aria-pressed={focusLines.includes(index + 1)}
            className="pointer-events-auto absolute cursor-pointer rounded-[3px] hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-ring"
            style={{
              left: layout.codeX - layout.gutterWidth,
              top: line.top,
              width: layout.gutterWidth,
              height: layout.lineHeight
            }}
          >
            {/* The number itself is painted on the canvas underneath; this is
                the name assistive tech reads. `sr-only` is safe HERE — it hides
                text inside a button that has real size, unlike a focusable
                element collapsed to a point. */}
            <span className="sr-only">{label(line.number)}</span>
          </button>
        )
      )}
    </div>
  )
}
