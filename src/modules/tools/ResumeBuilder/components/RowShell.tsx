"use client"

import { Button } from "@webiston/ui/primitives/button"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, ChevronDown, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ROW_MOTION } from "../constants"

/**
 * The chrome around one row of a repeating section: collapse, reorder, remove.
 *
 * Two things here were reported as confusing and both were the same mistake —
 * one icon standing for the wrong idea:
 *
 * - Reordering used CHEVRONS, which everywhere else on the web mean
 *   expand/collapse. So the owner clicked them expecting a panel to open and
 *   got a row swap. Reordering is now ARROWS, which mean movement and nothing
 *   else, and the chevron means only what it means everywhere: collapse.
 * - There was no collapse at all, so a form with four jobs was ~1,600px of
 *   open fields to scroll past. A collapsed row is ~44px and still says which
 *   job it is.
 *
 * Reordering is buttons rather than drag on purpose: this form is filled on a
 * phone as often as a laptop, and drag-and-drop on touch is the interaction
 * people fail at.
 */
export function RowShell({
  title,
  summary,
  index,
  count,
  onMove,
  onRemove,
  children
}: {
  title: string
  /** What the row IS, shown when it is collapsed — "Katta savdo maslahatchisi". */
  summary?: string
  index: number
  count: number
  onMove: (by: -1 | 1) => void
  onRemove: () => void
  children: React.ReactNode
}) {
  const t = useTranslations("ResumePage.form")
  const [open, setOpen] = useState(true)

  return (
    <motion.fieldset
      layout="position"
      initial={ROW_MOTION.initial}
      animate={ROW_MOTION.animate}
      exit={ROW_MOTION.exit}
      transition={ROW_MOTION.transition}
      className="flex min-w-0 flex-col rounded-lg border border-border bg-card/40"
    >
      <legend className="sr-only">{`${title} ${index + 1}`}</legend>

      <div className="flex items-center gap-1 p-2 pl-3">
        {/* The whole caption is the toggle, not just the chevron: a 16px
            target is a miss on a phone, and the row header is the thing
            people aim at anyway. */}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "" : "-rotate-90"
            }`}
            aria-hidden="true"
          />
          <span className="min-w-0 truncate font-medium text-muted-foreground text-xs">
            {summary?.trim() ? summary : `${title} ${index + 1}`}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={t("moveUp")}
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label={t("moveDown")}
          >
            <ArrowDown className="size-4" aria-hidden="true" />
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

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ROW_MOTION.transition}
            // `overflow-hidden` is what makes the height animation read as a
            // collapse instead of a squash — without it the fields shrink.
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 p-3 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
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
