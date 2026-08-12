"use client"

import { useId } from "react"

import type { Background } from "../types"

interface BackgroundOption {
  id: string
  label: string
  value: Background
}

interface BackgroundPickerProps {
  label: string
  options: readonly BackgroundOption[]
  /** The id of the option currently applied, or null for a custom value. */
  value: string | null
  onChange: (background: Background) => void
}

/**
 * The CSS the chip is painted with.
 *
 * Deliberately mirrors `paint.ts`: CSS reads gradient angles clockwise from
 * "to top", which is the convention `Background.angle` is documented in and
 * the one the canvas painter converts FROM. So the same number produces the
 * same picture here and in the export, and there is nothing to keep in sync.
 */
function chipStyle(background: Background) {
  if (background.kind === "none") return undefined
  if (background.kind === "gradient" && background.to) {
    return {
      backgroundImage: `linear-gradient(${background.angle ?? 135}deg, ${background.from}, ${background.to})`
    }
  }
  return { backgroundColor: background.from }
}

/**
 * Pick a background by looking at it.
 *
 * "Yarim tun" and "Shafaq" are two words that mean nothing until you have seen
 * them; a gradient chip means all of it at a glance. The names stay under the
 * chips anyway — they are how you ask someone for the one you used.
 *
 * Native radios for the same reason as `ThemePicker`: arrow keys, roving
 * focus and the accessible name all come from the platform.
 */
export function BackgroundPicker({
  label,
  options,
  value,
  onChange
}: BackgroundPickerProps) {
  const groupName = useId()

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-muted-foreground text-xs">{label}</legend>

      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            title={option.label}
            className="relative min-w-0 cursor-pointer"
          >
            {/* Full-size and transparent, never `sr-only` — see the comment in
                `ThemePicker`. A 1×1px focused element makes the browser scroll
                the window hundreds of pixels trying to reveal it. */}
            <input
              type="radio"
              name={groupName}
              value={option.id}
              checked={option.id === value}
              onChange={() => onChange(option.value)}
              className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none opacity-0"
            />
            <span className="block rounded-md p-0.5 ring-1 ring-border transition-shadow peer-checked:ring-2 peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
              {/* The transparent preset has no colour to show, so it shows the
                  absence: a dashed outline over the page's own surface, which
                  is exactly what a PNG with no background looks like once it
                  lands somewhere. */}
              <span
                className={
                  option.value.kind === "none"
                    ? "block h-8 rounded-[4px] border border-border border-dashed"
                    : "block h-8 rounded-[4px]"
                }
                style={chipStyle(option.value)}
              />
              <span className="mt-1 block truncate px-0.5 text-[11px] text-muted-foreground">
                {option.label}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
