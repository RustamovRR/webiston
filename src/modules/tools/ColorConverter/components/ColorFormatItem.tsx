"use client"

import { Check, Copy } from "lucide-react"

import { useCopyFeedback } from "../hooks/useCopyFeedback"

/**
 * One format row: name, what the format is for, the value, click-to-copy.
 *
 * Two lines, not three. Measured at three lines the nine rows came to 984px
 * against a 657px left column, so the panel needed an inner scrollbar next to
 * a page that already scrolls. The name and its one-line description share a
 * row; the value — the thing being copied — gets the emphasis line.
 *
 * The names used to cycle through the chart tokens — HEX blue, RGB green, HSL
 * orange — which encoded nothing. Nine differently coloured labels in a column
 * read as a legend the visitor then goes looking for a key to. Type hierarchy
 * carries the structure instead.
 */

interface ColorFormatItemProps {
  title: string
  value: string
  description: string
}

export function ColorFormatItem({
  title,
  value,
  description
}: ColorFormatItemProps) {
  // Keyed on the value: these rows are keyed by FORMAT, so one instance serves
  // every colour the visitor picks and the badge would outlive its own value.
  const { copied, copy } = useCopyFeedback(value)

  return (
    <button
      type="button"
      onClick={() => void copy(value)}
      aria-label={`${title}: ${value}`}
      className="group w-full cursor-pointer rounded-lg border border-border bg-muted/40 p-3 text-left transition-colors hover:border-border-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-baseline gap-2">
        <h3 className="shrink-0 font-semibold text-foreground text-sm">
          {title}
        </h3>
        <span className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
          {description}
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {copied ? (
            <Check size={14} className="text-success" />
          ) : (
            <Copy size={14} />
          )}
        </span>
      </div>
      <div className="mt-1 break-all font-mono text-foreground text-sm">
        {value}
      </div>
    </button>
  )
}
