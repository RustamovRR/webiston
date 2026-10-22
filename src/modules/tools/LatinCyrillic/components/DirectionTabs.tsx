"use client"

import {
  SegmentedControl,
  type SegmentedOption
} from "@webiston/ui/composites/SegmentedControl"
import { useTranslations } from "next-intl"

import { SCRIPT_PREFERENCES } from "../constants"
import type { ScriptPreference } from "../types"

/**
 * Avto / → Кирилл / → Lotin / → Yangi lotin.
 *
 * "Avto" makes the Latin ↔ Cyrillic guess a visible, overridable choice — the
 * model the extension popup has always used. The other three are
 * destinations, not directions: the engine reads any of the three alphabets,
 * so there is never a "from" to set. The new alphabet is one more destination
 * in the SAME control rather than a second switch beside it — one question,
 * "into which alphabet?", gets one answer.
 *
 * The control itself is `SegmentedControl` from `@webiston/ui`, which is where
 * the sliding indicator and the radio-group semantics live. This file is only
 * the labels and the hint.
 */

const LABEL_KEY: Record<ScriptPreference, string> = {
  auto: "direction.auto",
  cyrillic: "direction.toCyrillic",
  latin: "direction.toLatin",
  "latin-2027": "direction.toLatin2027"
}

interface DirectionTabsProps {
  value: ScriptPreference
  onChange: (value: ScriptPreference) => void
  /** What "auto" currently resolves to, shown so the guess is never hidden. */
  resolvedHint?: string
}

export function DirectionTabs({
  value,
  onChange,
  resolvedHint
}: DirectionTabsProps) {
  const t = useTranslations("LatinCyrillicPage")

  // The arrow is drawn, not translated, and only from `sm` up. Four options
  // with arrows measured 342px in Uzbek and 386px in Russian against the
  // 328px a 360px phone leaves inside the gutter — the page scrolled
  // sideways. At 16px an arrow, dropping them is what makes all four fit
  // (uz 292px, en 290px, ru 296px) without shrinking the control every other
  // tool shares. `aria-hidden`, so the accessible name is the same at every
  // width: the legend already says these are directions.
  const options: SegmentedOption<ScriptPreference>[] = SCRIPT_PREFERENCES.map(
    (option) => ({
      value: option,
      label:
        option === "auto" ? (
          t(LABEL_KEY[option])
        ) : (
          <>
            <span aria-hidden="true" className="max-sm:hidden">
              →{" "}
            </span>
            {t(LABEL_KEY[option])}
          </>
        )
    })
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
