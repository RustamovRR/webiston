"use client"

import type { DirectionPreference } from "@webiston/transliteration"
import { cn } from "@webiston/ui/utils"
import { useTranslations } from "next-intl"
import { useId } from "react"

/**
 * Auto / → Cyrillic / → Latin.
 *
 * Three options, not two. The old control offered only the two directions and
 * guessed between them behind the user's back; "Avto" makes the guess a
 * visible, overridable choice — and it is the model the extension popup has
 * always used, so the two surfaces finally agree.
 *
 * Real `<input type="radio">` elements, visually hidden and styled through the
 * label. The first version used buttons with `role="radio"`, which LOOKS like
 * the right ARIA but is only half of it: the radiogroup pattern also owes the
 * user a roving tabindex and arrow-key movement, and a role alone gives
 * neither. Native inputs give both, plus grouping, plus correct announcement,
 * and they work with JavaScript still loading.
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
  // Scoped so two of these on one page cannot share a radio group.
  const name = useId()

  return (
    <div className="flex items-center gap-3">
      <fieldset className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
        <legend className="sr-only">{t("direction.label")}</legend>

        {OPTIONS.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "block rounded-md px-3 py-1.5 font-medium text-sm transition-colors duration-200",
                "text-muted-foreground peer-hover:text-foreground",
                "peer-checked:bg-primary peer-checked:text-primary-foreground",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-muted"
              )}
            >
              {t(LABEL_KEY[option])}
            </span>
          </label>
        ))}
      </fieldset>

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
