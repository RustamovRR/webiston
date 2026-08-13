"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "../utils/cn"
import { buttonVariants } from "./button"

/**
 * The calendar, on `react-day-picker` v10.
 *
 * Written against the INSTALLED version's `UI` enum rather than copied from
 * the shadcn registry: that snippet targets v9, whose class keys differ
 * (`nav_button_previous` became `button_previous`, `head_cell` became
 * `weekday`, `cell`/`day` split into `day`/`day_button`). A v9 class map
 * compiles fine and silently styles nothing.
 *
 * Every colour is a semantic token, so dark mode is automatic and no `dark:`
 * variant appears anywhere in this file.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "relative flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center px-8",
        caption_label: "font-medium text-foreground text-sm",
        nav: "flex items-center justify-between absolute inset-x-0 top-0 h-8 px-0.5",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-7 text-muted-foreground hover:text-foreground"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-7 text-muted-foreground hover:text-foreground"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md font-normal text-[0.7rem] text-muted-foreground uppercase",
        weeks: "",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 rounded-md p-0 font-normal",
          "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary"
        ),
        today: "font-semibold text-primary",
        outside: "text-muted-foreground/50",
        disabled: "pointer-events-none text-muted-foreground/40",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" {...rest} />
          ) : (
            <ChevronRightIcon className="size-4" {...rest} />
          )
      }}
      {...props}
    />
  )
}

export { Calendar }
