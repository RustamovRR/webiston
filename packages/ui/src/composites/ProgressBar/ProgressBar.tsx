"use client"

import { useEffect, useRef } from "react"

import { cn } from "../../utils/cn"

/**
 * A determinate progress bar that keeps moving between reports.
 *
 * Real progress arrives in lumps, and every lump is a jump on screen: a DOCX
 * read reports 0 → 50 → 100, a five-page PDF reports in fifths, and a
 * `FileReader` fires `onprogress` in whatever chunk size it feels like. A CSS
 * `transition` cannot smooth that — it animates each lump and then FREEZES
 * until the next one, which is exactly what a stuttering bar looks like.
 *
 * So the value the user sees is animated here instead, on two time constants:
 *
 * - CATCH-UP: when a real report lands, ease toward it quickly.
 * - TRICKLE: when the bar has caught up but the work is not finished, keep
 *   creeping forward, slowly and asymptotically, so it never sits still. The
 *   creep is capped part-way to 100 so it can never run ahead of the truth or
 *   reach the end before the work does.
 *
 * The fill is moved with `transform`, written straight to the node — a
 * per-frame React render would cost more than the animation, and animating
 * `width` puts layout on every frame instead of the compositor.
 */

/** Time to cover ~63% of the distance to a freshly reported value. */
const CATCH_UP_TAU_MS = 200
/** The same, for the idle creep — deliberately an order slower. */
const TRICKLE_TAU_MS = 2600
/** How far past the last real report the creep may go, as a share of what is left. */
const TRICKLE_REACH = 0.4
/** Below this the bar is close enough that another frame would not show. */
const SETTLED_EPSILON = 0.05

export interface ProgressBarProps {
  /** The real, reported percentage (0–100). */
  value: number
  /**
   * Whether there is anything in progress. When false the bar collapses to
   * nothing — height and opacity, so it leaves as smoothly as it arrived.
   */
  active?: boolean
  /** Describes the work for assistive tech. */
  label: string
  className?: string
}

export function ProgressBar({
  value,
  active = true,
  label,
  className
}: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef(0)

  targetRef.current = Math.min(100, Math.max(0, value))

  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return

    // The fill is a full-width bar slid in from the left, so 0% progress is
    // translateX(-100%). Nothing to animate while idle.
    const paint = (percentage: number) => {
      fill.style.transform = `translateX(${percentage - 100}%)`
    }

    // Deliberately does NOT reset the fill: the bar is mid-collapse here, and
    // snapping it back to empty on the way out is one last jump.
    if (!active) return

    paint(0)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(targetRef.current)
      return
    }

    let current = 0
    let frame = 0
    let previous = performance.now()

    const step = (now: number) => {
      // Clamped: a backgrounded tab hands back a delta of seconds, which would
      // snap the bar forward the moment it is looked at again.
      const elapsed = Math.min(now - previous, 100)
      previous = now

      const target = targetRef.current
      const ceiling =
        target >= 100 ? 100 : target + (100 - target) * TRICKLE_REACH
      const goal = current < target ? target : ceiling
      const tau = current < target ? CATCH_UP_TAU_MS : TRICKLE_TAU_MS

      const next = current + (goal - current) * (1 - Math.exp(-elapsed / tau))
      // Monotonic. A late-arriving smaller report must never walk the bar
      // backwards — that reads as work being undone.
      current = Math.max(current, next)

      if (Math.abs(goal - current) > SETTLED_EPSILON) paint(current)
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active])

  return (
    <div
      className={cn(
        "overflow-hidden transition-[height,opacity,margin] duration-300 ease-out motion-reduce:transition-none",
        active ? "h-1 opacity-100" : "h-0 opacity-0",
        className
      )}
    >
      <div
        className="relative h-1 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          ref={fillRef}
          className="absolute inset-0 rounded-full bg-primary will-change-transform"
          style={{ transform: "translateX(-100%)" }}
        />
      </div>
    </div>
  )
}
