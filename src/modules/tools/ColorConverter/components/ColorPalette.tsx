"use client"

import { useTranslations } from "next-intl"

import type { PaletteType } from "../constants"
import { getColorName } from "../hooks/useColorConverter"
import { CopySwatch } from "./CopySwatch"

/**
 * The generated palette. A swatch click copies the hex AND makes it the new
 * input colour — walking a palette is how a scheme is actually explored.
 */

interface ColorPaletteProps {
  palette: readonly string[]
  paletteType: PaletteType
  onColorSelect: (color: string) => void
}

export function ColorPalette({
  palette,
  paletteType,
  onColorSelect
}: ColorPaletteProps) {
  const t = useTranslations("ColorConverterPage.ColorPalette")

  if (palette.length === 0) return null

  return (
    <section className="mt-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-border border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-[2px] bg-primary"
          />
          <h2 className="font-medium text-base text-foreground">
            {t(paletteType)}
          </h2>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {palette.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
        {palette.map((color) => (
          <CopySwatch
            key={color}
            color={color}
            onSelect={() => onColorSelect(color)}
            caption={
              <span className="mt-1.5 block">
                <span className="block font-mono text-[11px] text-foreground">
                  {color}
                </span>
                {getColorName(color) && (
                  <span className="block text-[11px] text-muted-foreground">
                    {getColorName(color)}
                  </span>
                )}
              </span>
            }
          />
        ))}
      </div>
    </section>
  )
}
