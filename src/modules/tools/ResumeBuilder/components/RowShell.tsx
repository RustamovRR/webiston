"use client"

import { Button } from "@webiston/ui/primitives/button"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

/**
 * The chrome around one row of a repeating section.
 *
 * Reordering is a first-class control, not a nicety: a CV is read top-down
 * and recency is the whole convention, so "I added last year's job second"
 * has to be fixable without retyping it. Buttons rather than drag: this form
 * is filled on a phone as often as a laptop, and drag-and-drop on touch is
 * the interaction people fail at.
 */
export function RowShell({
  title,
  index,
  count,
  onMove,
  onRemove,
  children
}: {
  title: string
  index: number
  count: number
  onMove: (by: -1 | 1) => void
  onRemove: () => void
  children: React.ReactNode
}) {
  const t = useTranslations("ResumePage.form")

  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card/40 p-3">
      <legend className="sr-only">{`${title} ${index + 1}`}</legend>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-muted-foreground text-xs">
          {title} {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={t("moveUp")}
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label={t("moveDown")}
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label={t("remove")}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      {children}
    </fieldset>
  )
}
