"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

/**
 * A colour square that copies itself on click — the idiom the palette, the
 * shade scale and the history all share (third consumer is what earned the
 * extraction). The caption slots render under the square.
 */

interface CopySwatchProps {
  color: string
  /** Extra click behaviour besides the copy, e.g. "make this the input". */
  onSelect?: () => void
  caption?: React.ReactNode
  swatchClassName?: string
  title?: string
}

export function CopySwatch({
  color,
  onSelect,
  caption,
  swatchClassName = "h-16",
  title
}: CopySwatchProps) {
  const [copied, setCopied] = useState(false)

  const activate = async () => {
    onSelect?.()
    try {
      await navigator.clipboard.writeText(color)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={activate}
      title={title ?? color}
      aria-label={`${color}`}
      className="group cursor-pointer rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative block">
        <span
          className={`block w-full rounded-lg border border-border transition-colors group-hover:border-border-strong ${swatchClassName}`}
          style={{ backgroundColor: color }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="flex items-center gap-1 rounded-full bg-foreground/75 px-2 py-0.5 font-medium text-[11px] text-background shadow-sm">
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "OK" : ""}
          </span>
        </span>
      </span>
      {caption}
    </button>
  )
}
