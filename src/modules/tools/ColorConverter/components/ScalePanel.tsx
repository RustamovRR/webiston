"use client"

import { useTranslations } from "next-intl"

import type { ShadeStep } from "../types"
import type { RampReadability } from "../utils/contrast"
import { CopySwatch } from "./CopySwatch"
import { ExportPanel } from "./ExportPanel"

/**
 * The 50–950 scale — the tool's production artefact, and the workbench's
 * default view because it is what most visitors came to build.
 *
 * The one-line readability sentence under the ramp replaces uicolors' 121-cell
 * contrast matrix. The ramp is monotonic by construction, so the honest answer
 * really is two boundaries rather than a grid — and one line of type is the
 * owner's rule applied: structure from hierarchy, no ornament.
 */

interface ScalePanelProps {
  baseColor: string
  shades: readonly ShadeStep[]
  ramp: RampReadability
  tokenName: string
}

export function ScalePanel({
  baseColor,
  shades,
  ramp,
  tokenName
}: ScalePanelProps) {
  const t = useTranslations("ColorConverterPage.TailwindShades")

  if (shades.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {ramp.whiteFrom !== null || ramp.blackTo !== null
            ? t("readability", {
                white: ramp.whiteFrom ?? "—",
                black: ramp.blackTo ?? "—"
              })
            : t("readabilityNone")}
        </p>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {baseColor}
        </span>
      </div>

      {/* One track per step, stretched — a ramp reads as a ramp only when the
          steps are adjacent and equal. Phones keep the wrapping grid. */}
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2.5 md:grid-cols-[repeat(var(--shade-count),minmax(0,1fr))]"
        style={{ "--shade-count": shades.length } as React.CSSProperties}
      >
        {shades.map(({ shade, hex }) => (
          <CopySwatch
            key={shade}
            color={hex}
            swatchClassName="aspect-square"
            caption={
              <span className="mt-1.5 block">
                <span className="block font-medium text-foreground text-xs tabular-nums">
                  {shade}
                </span>
                <span className="block font-mono text-[10px] text-muted-foreground">
                  {hex}
                </span>
              </span>
            }
          />
        ))}
      </div>

      <ExportPanel shades={shades} defaultName={tokenName} />
    </div>
  )
}
