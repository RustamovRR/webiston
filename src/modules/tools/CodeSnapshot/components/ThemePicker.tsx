"use client"

import { useId } from "react"

import type { ThemePalette } from "../types"

interface ThemePickerProps {
  label: string
  /** Featured first; the component preserves the order it is given. */
  themes: readonly ThemePalette[]
  value: string
  onChange: (id: string) => void
  /** Sits beside the label — the count is the headline number for this tool. */
  hint: string
}

/**
 * Pick a theme by looking at it.
 *
 * A dropdown listing "Kanagawa Wave" and "Poimandres" asks the visitor to
 * already know what those look like, and 65 entries makes that worse rather
 * than better. Each swatch is a miniature of the real thing: the theme's
 * `editor.background` with bars in its own keyword, identifier, string and
 * comment colours — the same colours `paint.ts` will draw, because both come
 * from one `codeToTokens` pass (see `scripts/theme-palette.mjs`).
 *
 * **Native radios, not buttons with `role="radio"`.** A hand-rolled radiogroup
 * owes the visitor arrow-key navigation and a roving tabindex, and 65 items is
 * exactly where a tab-through-everything picker becomes unusable. A visually
 * hidden `<input type="radio">` under a styled `<label>` gets all of that from
 * the platform, and the label text becomes the accessible name for free.
 *
 * The grid scrolls in its own box: 65 swatches would otherwise set the height
 * of the page and push the picture off screen.
 */
export function ThemePicker({
  label,
  themes,
  value,
  onChange,
  hint
}: ThemePickerProps) {
  const groupName = useId()

  return (
    <fieldset className="min-w-0">
      {/* A `<legend>` names the group for assistive tech, which is the whole
          reason for the fieldset. Left as an inline flow container — a legend
          with `display: flex` sizes unpredictably across engines. */}
      {/* The count is NOT dimmed further. `text-muted-foreground/70` measured
          3.08:1 against the card in light mode — below AA for small text —
          while the token on its own is 5.88:1. The `ml-2` gap already does
          the separating that the opacity was there for. */}
      <legend className="mb-1.5 text-muted-foreground text-xs">
        {label}
        <span className="ml-2">{hint}</span>
      </legend>

      <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-md border border-border bg-background/40 p-2">
        {themes.map((theme) => (
          <label
            key={theme.id}
            title={theme.label}
            className="relative min-w-0 cursor-pointer"
          >
            {/* Invisible, but NOT `sr-only`.
                Tailwind's `sr-only` collapses the input to 1×1px with
                `clip-path: inset(50%)` — zero visible area. Focus moves to it
                on click, the browser tries to scroll a zero-area element into
                view, and the arithmetic runs away: measured on the running
                page, picking a theme jumped the window **906px** down, and
                `input.focus()` on its own moved it **1135px**. The same call
                with `{ preventScroll: true }` moved it 0, which is what named
                the cause.
                Covering the swatch at full size instead makes the focused
                element the box you can already see, so scrolling it into view
                is a no-op. */}
            <input
              type="radio"
              name={groupName}
              value={theme.id}
              checked={theme.id === value}
              onChange={() => onChange(theme.id)}
              className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none opacity-0"
            />
            {/* The ring goes on the wrapper, not the swatch: a border drawn
                inside the swatch disappears into a theme whose background is
                close to it, and half of these are near-black or near-white. */}
            <span className="block rounded-md p-0.5 ring-1 ring-border transition-shadow peer-checked:ring-2 peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
              <span
                className="flex h-11 flex-col justify-center gap-1 rounded-[4px] px-2"
                style={{ backgroundColor: theme.bg }}
              >
                {/* Three rows of bars — a keyword next to a name, a string, a
                    comment. Not decoration: it is the only way to see whether a
                    theme actually separates the things it claims to separate. */}
                <span className="flex items-center gap-1">
                  <span
                    className="h-[3px] w-3 rounded-full"
                    style={{ backgroundColor: theme.keyword }}
                  />
                  <span
                    className="h-[3px] w-5 rounded-full"
                    style={{ backgroundColor: theme.identifier }}
                  />
                </span>
                <span
                  className="h-[3px] w-8 rounded-full"
                  style={{ backgroundColor: theme.string }}
                />
                <span
                  className="h-[3px] w-4 rounded-full"
                  style={{ backgroundColor: theme.comment }}
                />
              </span>
              <span className="mt-1 block truncate px-0.5 text-[11px] text-muted-foreground">
                {theme.label}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
