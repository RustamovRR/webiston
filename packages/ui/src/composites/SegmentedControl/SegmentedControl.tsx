"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

import { cn } from "../../utils/cn"

/**
 * A segmented control whose selection SLIDES between options.
 *
 * Two things are load-bearing here, and both were missing from the hand-rolled
 * version this replaces:
 *
 * 1. THE INDICATOR IS ONE ELEMENT. Styling the active option itself means the
 *    highlight can only appear and disappear — there is nothing to animate
 *    between, so the selection jumps. A single absolutely-positioned bar that
 *    moves to the chosen option is the only way to get continuous motion, and
 *    it is what makes this feel like one control rather than three buttons.
 *
 * 2. THE OPTIONS ARE REAL RADIOS. `role="radio"` on a button is half of the
 *    ARIA pattern: it also owes a roving tabindex and arrow-key movement. A
 *    `<fieldset>` of visually-hidden inputs gets grouping, announcement, arrow
 *    keys and Home/End from the browser, and works before hydration.
 *
 * The label colour is solved by a CLIPPED DUPLICATE, not by a colour
 * transition — and that distinction is the whole fix for the "text swaps
 * weirdly" report. With a colour transition, the label and the bar answer to
 * two different clocks: the new label turned light while the dark bar was
 * still 100px away, so for ~150ms it was light-on-light and appeared to
 * blink. Here the light copy of the labels lives INSIDE the sliding bar,
 * clipped to it, counter-translated so it lines up with the base row — the
 * bar and its text share one transform, so the reveal is pixel-locked to the
 * motion by construction. This is how the iOS segmented control does it, and
 * it is also why framer-motion would not help: the library animates values,
 * but the fix is architecture — one clock instead of two.
 *
 * Motion is `transform` + `width` on two elements sharing one timing, so it
 * is compositor-friendly and needs no animation library.
 */

export interface SegmentedOption<Value extends string> {
  value: Value
  label: React.ReactNode
  /** Optional, for when the visible label is a glyph or an arrow. */
  srLabel?: string
}

interface SegmentedControlProps<Value extends string> {
  options: readonly SegmentedOption<Value>[]
  value: Value
  onChange: (value: Value) => void
  /** Names the group for assistive tech; rendered as a visually hidden legend. */
  label: string
  className?: string
}

interface Indicator {
  left: number
  width: number
}

export function SegmentedControl<Value extends string>({
  options,
  value,
  onChange,
  label,
  className
}: SegmentedControlProps<Value>) {
  const name = useId()
  const trackRef = useRef<HTMLFieldSetElement>(null)
  const itemRefs = useRef(new Map<Value, HTMLElement>())
  const [indicator, setIndicator] = useState<Indicator | null>(null)

  /**
   * Whether a MOVE may animate. The arrival never may.
   *
   * The server has no layout, so the markup ships with the indicator at
   * `translateX(0)` and `opacity: 0` — the browser paints that, and only then
   * does the layout effect below measure and correct it. A plain CSS
   * transition treats that correction as a move and slides the highlight in
   * from the first option, which is why switching locale (a fresh render of
   * this tree) replayed the animation from "Auto" every single time.
   *
   * Enabling transitions one frame after the first measurement separates the
   * two cases: the position is applied instantly, everything after it slides.
   * This is the same fix an animation library would apply — framer-motion
   * spells it `initial={false}` — so pulling one in would buy the behaviour
   * back at the cost of the bundle, not fix anything CSS cannot.
   */
  const [canAnimate, setCanAnimate] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setCanAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useLayoutEffect(() => {
    const track = trackRef.current
    const active = itemRefs.current.get(value)
    if (!track || !active) return

    const measure = () => {
      const trackBox = track.getBoundingClientRect()
      const activeBox = active.getBoundingClientRect()
      const style = getComputedStyle(track)

      // The offset is measured from the CONTENT box, not the border box.
      //
      // `getBoundingClientRect()` returns the border box, while an absolutely
      // positioned child with `left: auto` starts at its static position —
      // the content-box origin. Subtracting the border and the padding is the
      // difference between the two, and skipping it shifted the indicator by
      // exactly that much: measured 5px, which parked the last option's
      // highlight flush against the track's right edge.
      const originX =
        trackBox.left +
        Number.parseFloat(style.borderLeftWidth) +
        Number.parseFloat(style.paddingLeft)

      setIndicator({
        left: activeBox.left - originX,
        width: activeBox.width
      })
    }

    measure()

    // Labels change width when the locale or the font does, and the control
    // wraps on narrow screens. Without this the indicator keeps the geometry it
    // measured once and drifts off its option.
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    for (const element of itemRefs.current.values()) observer.observe(element)

    return () => observer.disconnect()
  }, [value])

  return (
    // No border of its own. This control is almost always dropped inside a
    // bordered card, and a bordered box inside a bordered box is what makes a
    // toolbar look boxy — the filled track already reads as one unit.
    <fieldset
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded-lg bg-muted p-1",
        className
      )}
      ref={trackRef}
    >
      <legend className="sr-only">{label}</legend>

      {/* Base layer: every label in its resting colour. The active one is
          covered by the overlay below, so nothing here ever changes colour —
          which is exactly why nothing can blink. */}
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <label
            key={option.value}
            ref={(element) => {
              if (element) itemRefs.current.set(option.value, element)
              else itemRefs.current.delete(option.value)
            }}
            className="relative cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isActive}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "block whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-muted-foreground text-sm",
                // Hover feedback on the INACTIVE options only — the active
                // one is owned by the bar.
                !isActive &&
                  "transition-colors duration-200 peer-hover:bg-accent/60 peer-hover:text-foreground",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-muted"
              )}
            >
              {option.srLabel ? (
                <>
                  <span aria-hidden="true">{option.label}</span>
                  <span className="sr-only">{option.srLabel}</span>
                </>
              ) : (
                option.label
              )}
            </span>
          </label>
        )
      })}

      {/* The sliding bar, ON TOP of the labels, carrying a clipped light
          copy of the whole row. Bar and copy translate by +left and -left
          with the same timing, so whatever the bar covers appears in the
          active colour — mid-flight included. Hidden until measured: a bar
          at width 0 flashing into position on mount reads as a glitch. */}
      <span
        aria-hidden="true"
        className={cn(
          // `left-1` is load-bearing: the bar used to sit FIRST in the DOM and
          // lean on its static position, but the reveal needs it painted over
          // the labels, i.e. rendered after them — and the static position of
          // a last child is past the last label. Pinning it to the content
          // origin (the track's 4px padding) keeps translateX(left) meaning
          // what the measurement meant.
          "pointer-events-none absolute top-1 bottom-1 left-1 overflow-hidden rounded-md bg-primary shadow-sm",
          canAnimate
            ? "transition-[transform,width,opacity] duration-300 ease-out"
            : "transition-none",
          "motion-reduce:transition-none"
        )}
        style={{
          transform: `translateX(${indicator?.left ?? 0}px)`,
          width: indicator?.width ?? 0,
          opacity: indicator ? 1 : 0
        }}
      >
        <span
          className={cn(
            "flex h-full w-max items-center gap-0.5",
            canAnimate
              ? "transition-transform duration-300 ease-out"
              : "transition-none",
            "motion-reduce:transition-none"
          )}
          style={{ transform: `translateX(${-(indicator?.left ?? 0)}px)` }}
        >
          {/* Same classes as the base row, so the two layers are the same
              geometry and the copy sits exactly over its original. */}
          {options.map((option) => (
            <span
              key={option.value}
              className="block whitespace-nowrap px-3 py-1.5 font-medium text-primary-foreground text-sm"
            >
              {option.label}
            </span>
          ))}
        </span>
      </span>
    </fieldset>
  )
}
