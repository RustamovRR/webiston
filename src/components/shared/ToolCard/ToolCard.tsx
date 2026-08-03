import { cn } from "@webiston/ui"
import { useId } from "react"

/**
 * The suite's panel: a bordered card with a titled header rule.
 *
 * The markup was copied by hand into thirteen places across the refactored
 * tools — six of them inside the colour converter alone — which is well past
 * the point where a shared component is the cheaper option. Extracted at the
 * sixth consumer, byte-identical to what it replaces, so nothing shifts
 * visually.
 *
 * Two things it adds over the copies:
 *
 * - The heading NAMES the region. A `<section>` with no accessible name is not
 *   a landmark at all, so the hand-rolled `<section>`s were invisible to
 *   screen-reader region navigation.
 * - The dot's colour carries a rule instead of a habit: `primary` for a panel
 *   the tool derives on its own, `muted` for one the visitor authors. Before
 *   this, the same tool used both for no stated reason.
 */

interface ToolCardProps {
  title: string
  /** `primary`: derived output. `muted`: the visitor drives this panel. */
  tone?: "primary" | "muted"
  /** Header row, right-hand side — a copy button, a count, a reset. */
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Replaces the default body padding when a panel needs its own. */
  bodyClassName?: string
}

export function ToolCard({
  title,
  tone = "primary",
  actions,
  children,
  className,
  bodyClassName
}: ToolCardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={cn("rounded-xl border border-border bg-card", className)}
    >
      <div className="flex min-h-[52px] items-center justify-between gap-3 border-border border-b px-5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "size-[6px] shrink-0 rounded-[2px]",
              tone === "primary" ? "bg-primary" : "bg-border-strong"
            )}
          />
          <h2
            id={titleId}
            className="truncate font-medium text-base text-foreground"
          >
            {title}
          </h2>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>

      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  )
}
