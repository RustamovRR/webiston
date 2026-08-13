"use client"

import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { enUS, ru, uz } from "react-day-picker/locale"

import { Button } from "../../primitives/button"
import { Calendar } from "../../primitives/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../../primitives/popover"
import { cn } from "../../utils/cn"

export interface DatePickerProps {
  id?: string
  /** ISO `yyyy-mm-dd`, or "" for empty. The only shape callers deal in. */
  value: string
  onChange: (value: string) => void
  /** Shown on the trigger while empty. */
  placeholder?: string
  /** ISO bounds. Days outside them are unselectable, not merely flagged. */
  min?: string
  max?: string
  /** Renders the ISO value the way the reader's language writes a date. */
  format: (iso: string) => string
  /**
   * Which language the CALENDAR speaks — month and weekday names.
   *
   * A code rather than a locale object, so `react-day-picker` stays inside
   * this package: `src/` does not depend on it and must not import from it.
   */
  localeCode?: keyof typeof CALENDAR_LOCALES
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  className?: string
}

/** The three languages the site ships, and nothing else. */
const CALENDAR_LOCALES = { uz, en: enUS, ru } as const

/**
 * Local ISO ↔ Date, without ever going through UTC.
 *
 * `new Date("2026-08-13")` is UTC midnight, which is the 12th in any negative
 * offset, and `toISOString()` has the mirror-image bug going the other way.
 * Both directions are built from the local calendar fields instead.
 */
function fromIso(iso: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return undefined
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function toIso(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-")
}

/**
 * A date field built from the suite's own components — Popover + Calendar,
 * the shadcn composition — rather than `<input type="date">`.
 *
 * The native input was the wrong call: it renders as a different control in
 * every browser, ignores the design system entirely, and shows the date in
 * the BROWSER's locale, so an Uzbek document form was offering "13/08/2026"
 * next to a sheet that writes "2026-yil 13-avgust". This one is the same
 * button, border, radius and popover surface as every other control on the
 * page, and the trigger prints the date in the document's own format.
 *
 * The value stays an ISO string end to end: every caller here stores ISO,
 * every composer reads ISO, and `Date` objects exist only inside this file.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder,
  min,
  max,
  format,
  localeCode = "uz",
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": describedBy
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = fromIso(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid}
          aria-describedby={describedBy}
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
      <PopoverContent>
        <Calendar
          mode="single"
          autoFocus
          locale={CALENDAR_LOCALES[localeCode] ?? CALENDAR_LOCALES.uz}
          selected={selected}
          // Opens on the selected month, or on the lower bound when a field
          // is still empty — never on today when today is out of range.
          defaultMonth={selected ?? fromIso(min ?? "")}
          startMonth={fromIso(min ?? "")}
          disabled={[
            ...(min ? [{ before: fromIso(min) as Date }] : []),
            ...(max ? [{ after: fromIso(max) as Date }] : [])
          ]}
          onSelect={(date) => {
            if (!date) return
            onChange(toIso(date))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
