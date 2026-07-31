"use client"

import { useId, useLayoutEffect, useRef, useState } from "react"

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
 * Motion is `transform` + `width` on one element, so it is compositor-friendly
 * and needs no animation library.
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

  // `useLayoutEffect` so the first paint already has the indicator in place —
  // with `useEffect` it renders at 0 and then slides in, which looks like a bug.
  useLayoutEffect(() => {
    const track = trackRef.current
    const active = itemRefs.current.get(value)
    if (!track || !active) return

    const measure = () => {
      const trackBox = track.getBoundingClientRect()
      const activeBox = active.getBoundingClientRect()
      setIndicator({
        left: activeBox.left - trackBox.left,
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
    <fieldset
      className={cn(
        "relative inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1",
        className
      )}
      ref={trackRef}
    >
      <legend className="sr-only">{label}</legend>

      {/* Hidden until measured: a bar at left 0 with width 0 flashing into
          position on mount reads as a glitch. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 rounded-md bg-primary",
          "transition-[transform,width,opacity] duration-300 ease-out",
          "motion-reduce:transition-none"
        )}
        style={{
          transform: `translateX(${indicator?.left ?? 0}px)`,
          width: indicator?.width ?? 0,
          opacity: indicator ? 1 : 0
        }}
      />

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
                "block whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-sm",
                // Only the COLOUR transitions here. The background is the
                // sliding bar behind it, so the two never fight.
                "transition-colors duration-200",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground peer-hover:text-foreground",
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
    </fieldset>
  )
}
