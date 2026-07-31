"use client"

import type { DirectionPreference } from "@webiston/transliteration"
import { cn } from "@webiston/ui/utils"
import { useTranslations } from "next-intl"

/**
 * Auto / → Cyrillic / → Latin.
 *
 * Three options, not two. The old control offered only the two directions and
 * tried to guess between them behind the user's back; "Avto" makes the guess a
 * visible, overridable choice — and it is the model the extension popup has
 * always used, so the two surfaces finally agree.
 *
 * A radio group rather than buttons: these are mutually exclusive states, and
 * arrow-key navigation between them comes free.
 */

const OPTIONS: readonly DirectionPreference[] = [
  "auto",
  "latin-to-cyrillic",
  "cyrillic-to-latin"
]

const LABEL_KEY: Record<DirectionPreference, string> = {
  auto: "direction.auto",
  "latin-to-cyrillic": "direction.toCyrillic",
  "cyrillic-to-latin": "direction.toLatin"
}

interface DirectionTabsProps {
  value: DirectionPreference
  onChange: (value: DirectionPreference) => void
  /** What "auto" currently resolves to, shown so the guess is never hidden. */
  resolvedHint?: string
}

export function DirectionTabs({
  value,
  onChange,
  resolvedHint
}: DirectionTabsProps) {
  const t = useTranslations("LatinCyrillicPage")

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-label={t("direction.label")}
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1"
      >
        {OPTIONS.map((option) => {
          const isActive = value === option
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 font-medium text-sm transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(LABEL_KEY[option])}
            </button>
          )
        })}
      </div>

      {value === "auto" && resolvedHint && (
        <span
          aria-live="polite"
          className="hidden font-mono text-[11px] text-muted-foreground sm:inline"
        >
          {resolvedHint}
        </span>
      )}
    </div>
  )
}
