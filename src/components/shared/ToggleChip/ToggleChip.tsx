"use client"

import { cn } from "@webiston/ui"

/**
 * A small on/off chip — the shape both media tools use for their settings.
 *
 * Extracted at the second consumer, and for a reason beyond duplication: the
 * two copies had drifted from the suite's own `Button`, which carries
 * `cursor-pointer` in its base class. A hand-rolled `<button>` does not, so
 * these read as inert text under the pointer while every other control on the
 * page reads as clickable. That is the kind of inconsistency nobody reports as
 * a bug and everybody feels.
 *
 * `transition-all`, not `transition-colors`: the border colour, the background
 * and the opacity all change together when a chip is pressed or locked, and
 * animating only one of them is what makes a state change look like a flash.
 */

interface ToggleChipProps {
  pressed: boolean
  onToggle: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function ToggleChip({
  pressed,
  onToggle,
  children,
  disabled,
  className
}: ToggleChipProps) {
  return (
    <button
      type="button"
      // `aria-pressed`, not `role="switch"`: these are toggle buttons within a
      // group, which is exactly what the suite's other toggles use.
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "cursor-pointer rounded-lg border px-3 py-1.5 text-sm",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        pressed
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}
