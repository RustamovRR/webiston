"use client"

import type { DirectionPreference } from "@webiston/transliteration"
import {
  SegmentedControl,
  type SegmentedOption
} from "@webiston/ui/composites/SegmentedControl"
import { useTranslations } from "next-intl"

/**
 * Auto / → Cyrillic / → Latin.
 *
 * Three options, not two. The old control offered only the two directions and
 * guessed between them behind the user's back; "Avto" makes the guess a
 * visible, overridable choice — and it is the model the extension popup has
 * always used, so the two surfaces finally agree.
 *
 * The control itself is `SegmentedControl` from `@webiston/ui`, which is where
 * the sliding indicator and the radio-group semantics live. This file is only
 * the three labels and the hint.
 */

const OPTION_VALUES: readonly DirectionPreference[] = [
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

  const options: SegmentedOption<DirectionPreference>[] = OPTION_VALUES.map(
    (option) => ({ value: option, label: t(LABEL_KEY[option]) })
  )

  return (
    <div className="flex items-center gap-3">
      <SegmentedControl
        options={options}
        value={value}
        onChange={onChange}
        label={t("direction.label")}
      />

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
