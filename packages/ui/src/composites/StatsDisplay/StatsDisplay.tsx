import { cn } from "../../utils/cn"

/**
 * A row of live counters — characters, words, lines.
 *
 * These are read out PLAINLY, not through `NumberTicker`, and that is the
 * whole point of this file. The ticker drives its text from a framer-motion
 * spring, which is right for a hero stat that counts up once and wrong for a
 * counter that changes on every keystroke: the spring chases each new value
 * with damping, so while someone types the panel shows numbers that were never
 * true — 47, 51, 58 — and settles a beat after they stop. A character count is
 * a fact, and a fact that lags is simply wrong.
 *
 * (The ticker also wrote its own colour as `text-black dark:text-white`, which
 * outranked the muted colour set here — so every count rendered at full
 * contrast beside the muted label it was meant to match.)
 *
 * `tabular-nums` keeps the digits on a fixed pitch, so the row does not shift
 * sideways as the numbers grow.
 */

interface StatItem {
  label: string
  value: number
}

interface StatsDisplayProps {
  stats: StatItem[]
  className?: string
}

export function StatsDisplay({ stats, className }: StatsDisplayProps) {
  return (
    <div
      className={cn("flex gap-4 text-muted-foreground text-sm", className)}
      // The counts change as fast as the user types; announcing each one would
      // make a screen reader unusable. The panels are already `aria-live`.
      aria-hidden="true"
    >
      {stats.map((stat) => (
        <span key={stat.label} className="flex items-center gap-1">
          <span className="font-medium text-foreground tabular-nums">
            {stat.value.toLocaleString("en-US")}
          </span>
          <span>{stat.label}</span>
        </span>
      ))}
    </div>
  )
}
