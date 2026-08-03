"use client"

import { Check, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import type { ContrastGrades } from "@/lib/utils"

import { BLACK, DEFAULT_COMPARISON_BACKDROP, WHITE } from "../constants"
import type { ContrastReading, PassingShade } from "../utils/contrast"
import { hexContrast } from "../utils/contrast"

/**
 * Is this colour legible? — the one question a converter could always answer
 * and never did, and this tool's only real differentiator over RapidTables and
 * W3Schools. It stays a visible card and never becomes a tab.
 *
 * Contrast is symmetric, so the two numbers carry both readings a developer
 * needs: "my colour as text on white/black" and "white/black text on my
 * colour". The samples are painted on literal white and black rather than on
 * theme tokens, because WCAG is defined against those two backdrops — a
 * preview drawn on `bg-card` would show a ratio nobody measured.
 *
 * The verdict SENTENCE lives in the pinned summary, not here: printing it in
 * both places made one number appear three times on one screen.
 */

interface ContrastPanelProps {
  contrast: ContrastReading | null
  /** Already alpha-aware: an 8-digit hex composites over the sample backdrop. */
  color: string
  /** The nearest step of the visitor's own scale that clears AA, if any. */
  passingShade: PassingShade | null
  onAdoptShade: (hex: string) => void
}

interface GradeRowProps {
  ratio: number
  grades: ContrastGrades
  backdrop: string
  color: string
  label: string
  sample: string
  labels: { aa: string; aaa: string; large: string; nonText: string }
}

function GradeRow({
  ratio,
  grades,
  backdrop,
  color,
  label,
  sample,
  labels
}: GradeRowProps) {
  const badges = [
    { key: "aa", label: labels.aa, passes: grades.aa },
    { key: "aaa", label: labels.aaa, passes: grades.aaa },
    { key: "large", label: labels.large, passes: grades.aaLarge },
    // SC 1.4.11. `color-contrast.ts` has always returned this grade and the
    // panel discarded it — the one a developer needs for an icon or a border,
    // and the row Coolors omits and WebAIM does not.
    { key: "nonText", label: labels.nonText, passes: grades.nonText }
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className="font-mono text-foreground text-sm tabular-nums">
          {ratio.toFixed(2)}:1
        </span>
      </div>

      {/* `bg-clip-padding`: the token border is a translucent white, and the
          default clip paints the backdrop under it — so the black sample tile
          carried a pale rim and the sample was not sitting on the pure black
          the ratio above it was measured against. */}
      <div
        className="mt-2 space-y-1 rounded-lg border border-border bg-clip-padding px-3 py-3"
        style={{ backgroundColor: backdrop }}
      >
        <p className="truncate font-medium text-base" style={{ color }}>
          {sample}
        </p>
        {/* Large text graded at the size it is graded AT — 24px — so "large
            text passes" is something the eye can falsify. */}
        <p
          className="truncate font-medium text-2xl leading-tight"
          style={{ color }}
        >
          {sample}
        </p>
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {badges.map((badge) => (
          <li
            key={badge.key}
            className={`flex items-center gap-1 text-xs ${
              badge.passes ? "text-success" : "text-muted-foreground"
            }`}
          >
            {badge.passes ? (
              <Check size={12} aria-hidden="true" />
            ) : (
              <X size={12} aria-hidden="true" />
            )}
            {badge.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ContrastPanel({
  contrast,
  color,
  passingShade,
  onAdoptShade
}: ContrastPanelProps) {
  const t = useTranslations("ColorConverterPage.Contrast")
  const [backdrop, setBackdrop] = useState(DEFAULT_COMPARISON_BACKDROP)
  const [comparing, setComparing] = useState(false)

  const labels = {
    aa: t("aa"),
    aaa: t("aaa"),
    large: t("aaLarge"),
    nonText: t("nonText")
  }

  return (
    <ToolCard title={t("title")} bodyClassName="space-y-5 p-5">
      {contrast ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <GradeRow
              label={t("onWhite")}
              ratio={contrast.white}
              grades={contrast.whiteGrades}
              backdrop={WHITE}
              color={color}
              sample={t("sample")}
              labels={labels}
            />
            <GradeRow
              label={t("onBlack")}
              ratio={contrast.black}
              grades={contrast.blackGrades}
              backdrop={BLACK}
              color={color}
              sample={t("sample")}
              labels={labels}
            />
          </div>

          <p className="text-muted-foreground text-xs">{t("largeTextNote")}</p>

          {/* The fix belongs at the site of the failure. WebAIM makes you drag
              a slider and DevTools gives you one button; for us it is a lookup
              over the ramp the tool has already computed. */}
          {passingShade && (
            <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">{t("repairLead")}</span>{" "}
              <button
                type="button"
                onClick={() => onAdoptShade(passingShade.hex)}
                className="cursor-pointer font-mono text-foreground underline decoration-dotted underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {passingShade.shade} · {passingShade.hex}
              </button>{" "}
              <span className="font-mono text-muted-foreground tabular-nums">
                {passingShade.ratio.toFixed(2)}:1
              </span>
            </p>
          )}

          <details
            open={comparing}
            onToggle={(event) =>
              setComparing((event.target as HTMLDetailsElement).open)
            }
          >
            <summary className="cursor-pointer list-none py-1 text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {t("otherBackdrop")}
            </summary>
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2.5 text-sm">
                <input
                  type="color"
                  value={backdrop}
                  onChange={(event) => setBackdrop(event.target.value)}
                  aria-label={t("otherBackdrop")}
                  className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-clip-padding bg-transparent p-0.5"
                />
                <span className="font-mono text-muted-foreground text-xs">
                  {backdrop}
                </span>
              </label>
              <GradeRow
                label={t("customBackdrop")}
                ratio={hexContrast(color, backdrop)}
                grades={{
                  aa: hexContrast(color, backdrop) >= 4.5,
                  aaLarge: hexContrast(color, backdrop) >= 3,
                  aaa: hexContrast(color, backdrop) >= 7,
                  aaaLarge: hexContrast(color, backdrop) >= 4.5,
                  nonText: hexContrast(color, backdrop) >= 3
                }}
                backdrop={backdrop}
                color={color}
                sample={t("sample")}
                labels={labels}
              />
            </div>
          </details>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">{t("empty")}</p>
      )}
    </ToolCard>
  )
}
