"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { Link2, Palette } from "lucide-react"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import {
  CHECKERBOARD_STYLE,
  PRIMARY_FORMATS,
  SECONDARY_FORMATS,
  WHITE
} from "../constants"
import { useCopyFeedback } from "../hooks/useCopyFeedback"
import type { ColorFormats } from "../types"
import type { ContrastReading } from "../utils/contrast"
import { ColorFormatItem } from "./ColorFormatItem"

/**
 * The answer, pinned.
 *
 * For a QR code the input and the result are two objects, so the QR generator
 * splits them across two columns. For a COLOUR they are one object — which is
 * why what gets pinned here is the VALUES, not the picker. Measured on the
 * flat version: clicking a shade, a harmony swatch or a saved colour changed
 * the answer at the exact moment the answer had scrolled off the top.
 *
 * Seven format rows do not fit a pinned column, so four are shown and three
 * live in a closed `<details>`. They stay in the DOM either way — indexable,
 * and reachable with the browser's own find.
 */

interface ColorSummaryProps {
  colorFormats: ColorFormats | null
  colorName: string
  contrast: ContrastReading | null
}

export function ColorSummary({
  colorFormats,
  colorName,
  contrast
}: ColorSummaryProps) {
  const t = useTranslations("ColorConverterPage.ColorFormats")
  const tContrast = useTranslations("ColorConverterPage.Contrast")
  const tInput = useTranslations("ColorConverterPage.ColorInput")
  // The link carries `?c=<hex>`, so it changes with the colour.
  const { copied: linkCopied, copy: copyLink } = useCopyFeedback(
    colorFormats?.hex
  )

  const allFormats = colorFormats
    ? JSON.stringify(
        Object.fromEntries(
          [...PRIMARY_FORMATS, ...SECONDARY_FORMATS].map((key) => [
            key,
            colorFormats[key]
          ])
        ),
        null,
        2
      )
    : ""

  if (!colorFormats) {
    return (
      <ToolCard title={t("title")} bodyClassName="p-5">
        <div className="flex min-h-[280px] flex-col items-center justify-center text-center text-muted-foreground">
          <Palette size={44} className="opacity-40" aria-hidden="true" />
          <p className="mt-3 text-sm">{t("enterValidColor")}</p>
          <p className="mt-1 text-xs opacity-75">{t("formatsWillAppear")}</p>
        </div>
      </ToolCard>
    )
  }

  const opacity = colorFormats.opacity

  return (
    <ToolCard
      title={t("title")}
      actions={<CopyButton text={allFormats} />}
      bodyClassName="space-y-4 p-5"
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-clip-padding"
          style={CHECKERBOARD_STYLE}
        >
          <span
            className="block size-full"
            style={{ backgroundColor: colorFormats.hex }}
          />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-foreground text-lg">
            {colorFormats.hex}
          </p>
          {colorName && (
            <p className="mt-0.5 truncate text-muted-foreground text-sm">
              {colorName}
            </p>
          )}
          {opacity < 1 && (
            <p className="mt-0.5 font-mono text-muted-foreground text-xs">
              alpha {Math.round(opacity * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* The verdict travels with the colour. The contrast card below keeps
          the evidence — the two samples and the grade rows — but printing the
          sentence there as well made one number appear three times. */}
      {contrast && (
        <p className="text-foreground text-sm leading-relaxed">
          {tContrast("recommendation", {
            text:
              contrast.readableText === WHITE
                ? tContrast("whiteText")
                : tContrast("blackText")
          })}{" "}
          <span className="font-mono tabular-nums">
            {contrast.readableRatio.toFixed(2)}:1
          </span>
        </p>
      )}

      <div className="space-y-2.5">
        {PRIMARY_FORMATS.map((key) => (
          <ColorFormatItem
            key={key}
            title={key === "hex" ? "HEX" : key.toUpperCase()}
            value={colorFormats[key]}
            description={t(`${key}Description`)}
          />
        ))}
      </div>

      <details className="disclosure group">
        <summary className="cursor-pointer list-none rounded-lg py-1 text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block transition-transform group-open:rotate-90"
            >
              ›
            </span>
            {t("otherSpaces")}
          </span>
        </summary>
        <div className="mt-2.5 space-y-2.5">
          {SECONDARY_FORMATS.map((key) => (
            <ColorFormatItem
              key={key}
              title={key === "oklab" ? "OKLab" : key === "lab" ? "Lab" : "LCH"}
              value={colorFormats[key]}
              description={t(`${key}Description`)}
            />
          ))}
        </div>
      </details>

      <div className="flex items-center justify-between gap-2 border-border border-t pt-3">
        <span className="text-muted-foreground text-xs">
          {tInput("processedLocally")}
        </span>
        <button
          type="button"
          onClick={() => void copyLink(window.location.href)}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground text-xs transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Link2 size={13} aria-hidden="true" />
          {linkCopied ? tInput("linkCopied") : tInput("copyLink")}
        </button>
      </div>
    </ToolCard>
  )
}
