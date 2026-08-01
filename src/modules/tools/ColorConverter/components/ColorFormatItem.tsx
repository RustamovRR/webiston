"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

/**
 * One format row: name, value, sub-detail, click-to-copy. The format's accent
 * comes from the chart tokens — the data-visualisation palette the design
 * system reserves for exactly this — never from raw palette classes.
 */

interface ColorFormatItemProps {
  title: string
  value: string
  description: string
  /** A `text-chart-*` class chosen by the caller's cycle. */
  accentClass: string
}

export function ColorFormatItem({
  title,
  value,
  description,
  accentClass
}: ColorFormatItemProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${title}: ${value}`}
      className="group w-full cursor-pointer rounded-lg border border-border bg-muted/40 p-3 text-left transition-colors hover:border-border-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className={`font-semibold text-sm ${accentClass}`}>{title}</h3>
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          {copied ? (
            <Check size={14} className="text-success" />
          ) : (
            <Copy size={14} />
          )}
        </span>
      </div>
      <div className="break-all font-mono text-foreground text-sm">{value}</div>
      <div className="mt-1 text-muted-foreground text-xs">{description}</div>
    </button>
  )
}
