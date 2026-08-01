"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { Palette } from "lucide-react"
import { useTranslations } from "next-intl"

import type { ColorFormats } from "../hooks/useColorConverter"
import { ColorFormatItem } from "./ColorFormatItem"

/**
 * Every representation of the colour, each row one click from the clipboard.
 * The header's copy button takes ALL of them as JSON — the "give me
 * everything" path a designer handing off to a developer actually uses.
 */

interface ColorFormatsPanelProps {
  colorFormats: ColorFormats | null
}

/** Row accents cycle through the data-visualisation palette. */
const ACCENTS = [
  "text-chart-1",
  "text-chart-2",
  "text-chart-3",
  "text-chart-4",
  "text-chart-5"
] as const

export function ColorFormatsPanel({ colorFormats }: ColorFormatsPanelProps) {
  const t = useTranslations("ColorConverterPage.ColorFormats")

  const rows = colorFormats
    ? [
        {
          title: "HEX",
          value: colorFormats.hex,
          description: t("hexDescription")
        },
        {
          title: "RGB",
          value: colorFormats.rgb,
          description: `R ${colorFormats.rgbValues.r} · G ${colorFormats.rgbValues.g} · B ${colorFormats.rgbValues.b}`
        },
        {
          title: "HSL",
          value: colorFormats.hsl,
          description: `H ${colorFormats.hslValues.h}° · S ${colorFormats.hslValues.s}% · L ${colorFormats.hslValues.l}%`
        },
        {
          title: "RGBA",
          value: colorFormats.rgba,
          description: t("rgbaDescription")
        },
        {
          title: "HSLA",
          value: colorFormats.hsla,
          description: t("hslaDescription")
        },
        {
          title: "Lab",
          value: colorFormats.lab,
          description: `L ${colorFormats.labValues.l} · a ${colorFormats.labValues.a} · b ${colorFormats.labValues.b}`
        },
        {
          title: "LCH",
          value: colorFormats.lch,
          description: `L ${colorFormats.lchValues.l} · C ${colorFormats.lchValues.c} · H ${colorFormats.lchValues.h}°`
        },
        {
          title: "OKLab",
          value: colorFormats.oklab,
          description: `L ${colorFormats.oklabValues.l} · a ${colorFormats.oklabValues.a} · b ${colorFormats.oklabValues.b}`
        },
        {
          title: "OKLCH",
          value: colorFormats.oklch,
          description: `L ${colorFormats.oklchValues.l} · C ${colorFormats.oklchValues.c} · H ${colorFormats.oklchValues.h}°`
        }
      ]
    : []

  const allFormats = colorFormats
    ? JSON.stringify(
        Object.fromEntries(
          rows.map((row) => [row.title.toLowerCase(), row.value])
        ),
        null,
        2
      )
    : ""

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-border border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-[2px] bg-primary"
          />
          <h2 className="font-medium text-base text-foreground">
            {t("title")}
          </h2>
        </div>
        <CopyButton text={allFormats} disabled={!colorFormats} />
      </div>

      {colorFormats ? (
        <div className="max-h-[480px] space-y-2.5 overflow-y-auto p-5">
          {rows.map((row, index) => (
            <ColorFormatItem
              key={row.title}
              title={row.title}
              value={row.value}
              description={row.description}
              accentClass={ACCENTS[index % ACCENTS.length]}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <Palette size={44} className="opacity-40" aria-hidden="true" />
          <p className="mt-3 text-sm">{t("enterValidColor")}</p>
          <p className="mt-1 text-xs opacity-75">{t("formatsWillAppear")}</p>
        </div>
      )}
    </div>
  )
}
