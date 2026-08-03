"use client"

import { useTranslations } from "next-intl"

import type { PaletteType } from "../types"
import { getColorName } from "../utils/exports"
import { CopySwatch } from "./CopySwatch"

/**
 * All three harmony schemes at once.
 *
 * The palette-type SegmentedControl is gone. It made the visitor choose before
 * they had seen anything, and the three answers together occupy about the room
 * one of them used to — the monochromatic scheme is five swatches, analogous
 * five, complementary ten. This is the only change in the restructure that
 * REMOVES a decision rather than relocating one.
 *
 * A swatch click copies the hex AND makes it the new input colour — walking a
 * scheme is how one is actually explored.
 */

interface PalettePanelProps {
  palettes: ReadonlyArray<{ type: PaletteType; colors: string[] }>
  onColorSelect: (color: string) => void
}

export function PalettePanel({ palettes, onColorSelect }: PalettePanelProps) {
  const t = useTranslations("ColorConverterPage.ColorPalette")

  if (palettes.length === 0) return null

  return (
    <div className="space-y-5">
      {palettes.map(({ type, colors }) => (
        <div key={type}>
          <div className="mb-2.5 flex items-baseline justify-between gap-2">
            <h3 className="font-medium text-foreground text-sm">{t(type)}</h3>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {colors.length}
            </span>
          </div>
          {/* One track per colour on desktop: a scheme reads as a scheme when
              its members are adjacent and equal. `auto-fill` left five swatches
              in the first five of fifteen tracks. */}
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2.5 md:grid-cols-[repeat(var(--swatch-count),minmax(0,1fr))]"
            style={{ "--swatch-count": colors.length } as React.CSSProperties}
          >
            {colors.map((color) => {
              const name = getColorName(color)
              return (
                <CopySwatch
                  key={color}
                  color={color}
                  onSelect={() => onColorSelect(color)}
                  swatchClassName="h-14"
                  caption={
                    <span className="mt-1.5 block">
                      <span className="block font-mono text-[11px] text-foreground">
                        {color}
                      </span>
                      {name && (
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {name}
                        </span>
                      )}
                    </span>
                  }
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
