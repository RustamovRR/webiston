"use client"

import { cn } from "@webiston/ui"
import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { BASE_BREAKPOINT, FRAMEWORKS } from "../constants"
import type { FrameworkId } from "../types"
import { activeBreakpoint } from "../utils/metrics"

/**
 * Which prefix is winning, in the framework you actually use.
 *
 * Two things every free tool in this category gets wrong.
 *
 * **It answers for one framework.** Usually a generic 320/768/1024 list that
 * belongs to none of them. Bootstrap's `lg` starts at 992 and Tailwind's at
 * 1024; MUI's `md` is 900 where Tailwind's is 768. A developer on Bootstrap
 * reading a Tailwind cheat sheet is translating every number in their head,
 * and the 24- and 132-pixel gaps are exactly where a layout breaks.
 *
 * **It shows only the active breakpoint.** `min-width` queries STACK: at
 * 1400px, `sm:` through `xl:` are all matching at once, and `xl:` decides a
 * conflict by source order rather than because the others stopped applying.
 * Every passed cell is marked here, and the deciding one is emphasised — the
 * stacking is the part people get wrong, so hiding it would be the one
 * simplification that costs the reader something.
 */

interface BreakpointBarProps {
  width: number | null
  framework: FrameworkId
  onFrameworkChange: (framework: FrameworkId) => void
  /** True when `width` came from the probe rather than the real window. */
  isPreview: boolean
}

export function BreakpointBar({
  width,
  framework,
  onFrameworkChange,
  isPreview
}: BreakpointBarProps) {
  const t = useTranslations("ScreenResolutionPage.breakpoints")

  const scale =
    FRAMEWORKS.find((entry) => entry.id === framework) ?? FRAMEWORKS[0]
  const active =
    width === null ? null : activeBreakpoint(width, scale.breakpoints)
  const cells = [{ name: BASE_BREAKPOINT, min: 0 }, ...scale.breakpoints]

  return (
    <ToolCard
      title={t("title")}
      actions={
        <SegmentedControl
          label={t("frameworkLabel")}
          value={framework}
          onChange={onFrameworkChange}
          options={FRAMEWORKS.map((entry) => ({
            value: entry.id,
            label: entry.label
          }))}
        />
      }
    >
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {cells.map((cell) => {
          const passed = width !== null && width >= cell.min
          const isActive = cell.name === active
          return (
            <li key={cell.name}>
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-center",
                  isActive
                    ? "border-primary bg-primary/10"
                    : passed
                      ? "border-border-strong bg-card"
                      : "border-border bg-card"
                )}
              >
                <div
                  className={cn(
                    "font-mono text-sm",
                    passed ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {cell.name}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {cell.min === 0 ? "0" : `≥${cell.min}`}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {active ? (
        <p className="mt-3 text-muted-foreground text-sm">
          {isPreview
            ? t("explainerPreview", { active, width: String(width) })
            : t("explainer", { active })}
        </p>
      ) : null}
    </ToolCard>
  )
}
