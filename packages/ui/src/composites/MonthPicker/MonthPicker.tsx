"use client"

import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { Button } from "../../primitives/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../../primitives/popover"
import { cn } from "../../utils/cn"

export interface MonthPickerProps {
  id?: string
  /** ISO `yyyy-mm`, or "" for empty. The only shape callers deal in. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Renders the ISO value the way the reader's language writes a month. */
  format: (value: string) => string
  /** Which language the GRID speaks — month names come from `Intl`. */
  locale?: string
  /** Inclusive bounds, ISO `yyyy-mm`. Months outside are unselectable. */
  min?: string
  max?: string
  disabled?: boolean
  "aria-invalid"?: boolean
  className?: string
}

/** Twelve short month names in the reader's language, from the platform. */
function monthNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { month: "short" })
  return Array.from({ length: 12 }, (_, index) =>
    format.format(new Date(2024, index, 1))
  )
}

const iso = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}`

/**
 * A MONTH field, built from the suite's own Popover and Button — the same
 * composition as `DatePicker`, for the same reason: `<input type="month">`
 * renders as a different control in every browser, ignores the design system
 * entirely, and Safari shows a plain text box with no picker at all.
 *
 * Separate from `DatePicker` rather than a mode on it, because a day grid is
 * the wrong instrument for the question. "Which month did you start this
 * job?" answered by picking the 1st of a month is a click the person should
 * never have to make, and a 12-cell grid answers it in one.
 *
 * The value stays an ISO `yyyy-mm` string end to end; `Date` never escapes
 * this file.
 */
export function MonthPicker({
  id,
  value,
  onChange,
  placeholder,
  format,
  locale = "uz",
  min,
  max,
  disabled,
  className,
  "aria-invalid": ariaInvalid
}: MonthPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = /^\d{4}-\d{2}$/.test(value) ? value : ""

  // The grid opens on the selected year, else on the lower bound, else now.
  const [year, setYear] = useState(() => {
    const source = selected || min || ""
    const parsed = Number(source.slice(0, 4))
    return parsed || new Date().getFullYear()
  })

  const names = monthNames(locale)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Reopening after a change should show where the value IS, not where
        // the visitor last browsed to.
        if (next && selected) setYear(Number(selected.slice(0, 4)))
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start px-3 font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {value ? format(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[248px] p-2">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setYear((current) => current - 1)}
            aria-label={String(year - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="font-medium text-sm tabular-nums">{year}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setYear((current) => current + 1)}
            aria-label={String(year + 1)}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {names.map((name, month) => {
            const candidate = iso(year, month)
            const outOfRange =
              (min && candidate < min) || (max && candidate > max)
            return (
              <Button
                key={name}
                type="button"
                variant={candidate === selected ? "default" : "ghost"}
                size="sm"
                disabled={Boolean(outOfRange)}
                onClick={() => {
                  onChange(candidate)
                  setOpen(false)
                }}
              >
                {name}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
