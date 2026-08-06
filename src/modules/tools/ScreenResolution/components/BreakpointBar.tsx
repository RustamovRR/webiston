"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { BASE_BREAKPOINT, TAILWIND_BREAKPOINTS } from "../constants"
import { activeBreakpoint } from "../utils/metrics"

/**
 * Which Tailwind prefix is winning right now.
 *
 * `min-width` queries stack, so at 1400px `sm:` through `xl:` are all matching
 * and only `xl:` decides a conflict. The row shows both facts at once: every
 * passed breakpoint is marked, and the deciding one is the emphasised cell.
 * A single "current breakpoint" label would hide the stacking, which is
 * exactly the part people get wrong.
 *
 * The widths come from `constants/index.ts`, which was checked against
 * `src/styles/tokens.css` rather than recalled — this site declares no
 * `--breakpoint-*` token, so Tailwind v4's defaults are the real values.
 */

interface BreakpointBarProps {
  viewportWidth: number
}

export function BreakpointBar({ viewportWidth }: BreakpointBarProps) {
  const t = useTranslations("ScreenResolutionPage.breakpoints")
  const active = activeBreakpoint(viewportWidth)

  const cells = [{ name: BASE_BREAKPOINT, min: 0 }, ...TAILWIND_BREAKPOINTS]

  return (
    <ToolCard title={t("title")}>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {cells.map((cell) => {
          const passed = viewportWidth >= cell.min
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
                    isActive
                      ? "text-foreground"
                      : passed
                        ? "text-foreground"
                        : "text-muted-foreground"
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
      <p className="mt-3 text-muted-foreground text-sm">
        {t("explainer", { active })}
      </p>
    </ToolCard>
  )
}
