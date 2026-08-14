"use client"

import { Button } from "@webiston/ui/primitives/button"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { ROW_MOTION } from "../constants"

/**
 * The chrome around one row of a repeating section, and its motion.
 *
 * Reordering is a first-class control, not a nicety: a CV is read top-down
 * and recency is the whole convention, so "I added last year's job second"
 * has to be fixable without retyping it. Buttons rather than drag — this form
 * is filled on a phone as often as a laptop, and drag-and-drop on touch is
 * the interaction people fail at.
 *
 * The row animates in and out, and `layout` makes the rows BELOW a removed
 * one slide up instead of jumping. That only works because rows carry a
 * stable `id` (see `types/index.ts`): keyed by array index, `AnimatePresence`
 * would fade out whichever row happened to land on that index — usually not
 * the one the visitor deleted.
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
    <motion.fieldset
      layout="position"
      initial={ROW_MOTION.initial}
      animate={ROW_MOTION.animate}
      exit={ROW_MOTION.exit}
      transition={ROW_MOTION.transition}
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card/40 p-3"
    >
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
            className="size-7 text-muted-foreground transition-colors hover:text-destructive"
            onClick={onRemove}
            aria-label={t("remove")}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      {children}
    </motion.fieldset>
  )
}

/**
 * The list wrapper every repeating section shares.
 *
 * `AnimatePresence` has to sit OUTSIDE the rows it animates — a row cannot
 * announce its own exit after React has already unmounted it — so this owns
 * the boundary and each section just hands it children.
 */
export function RowList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </div>
  )
}
