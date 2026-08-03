"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Pipette, Shuffle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { rgbToHex } from "@/lib/utils"

import { DEFAULT_COLOR, PRESET_COLORS } from "../constants"
import type { ColorFormats } from "../types"
import { getColorName } from "../utils/exports"

/**
 * The only card on the page where the visitor AUTHORS anything: picker,
 * free-text field, eyedropper, random, opacity, presets.
 *
 * The identity block — the big swatch, the hex readout, the colour name — used
 * to live here too. It moved to the pinned summary, because a card that both
 * takes input and reports the answer means two swatches and two copies of the
 * hex on one screen, which is the same "two cards, one dataset" charge that
 * the monochromatic palette was guilty of.
 */

interface ColorControlsProps {
  inputColor: string
  colorFormats: ColorFormats | null
  /** Live typing — updates the colour, records nothing. */
  onInput: (color: string) => void
  /** A deliberate pick — preset, picker, eyedropper — records to history too. */
  onChoose: (color: string) => void
  /** Typing finished (blur): record what stands, if valid. */
  onCommit: () => void
  onOpacityChange: (alpha: number) => void
}

export function ColorControls({
  inputColor,
  colorFormats,
  onInput,
  onChoose,
  onCommit,
  onOpacityChange
}: ColorControlsProps) {
  const t = useTranslations("ColorConverterPage.ColorInput")
  const isValid = colorFormats !== null

  /**
   * `<input type="color">` accepts nothing but a 6-digit hex — the DOM coerces
   * anything else to `#000000`. Measured: typing a single stray character
   * flipped the picker to black and it stayed there. Holding the last valid
   * colour keeps the swatch honest while the text is mid-edit.
   */
  const [lastValidHex, setLastValidHex] = useState(DEFAULT_COLOR)
  useEffect(() => {
    if (colorFormats) setLastValidHex(colorFormats.hexOpaque)
  }, [colorFormats])
  const pickerHex = colorFormats?.hexOpaque ?? lastValidHex

  // Chromium only. A button that opens nothing is worse than no button.
  const [canPick, setCanPick] = useState(false)
  useEffect(() => setCanPick(typeof window.EyeDropper === "function"), [])

  const pickFromScreen = async () => {
    const Picker = window.EyeDropper
    if (!Picker) return
    try {
      const { sRGBHex } = await new Picker().open()
      onChoose(sRGBHex)
    } catch {
      // The visitor pressed Escape. Nothing to report.
    }
  }

  const randomColor = () => {
    // Math.random is fine here — a colour suggestion is not a secret.
    const channel = () => Math.floor(Math.random() * 256)
    onChoose(rgbToHex(channel(), channel(), channel()))
  }

  const opacity = colorFormats?.opacity ?? 1

  return (
    <ToolCard
      tone="muted"
      title={t("title")}
      actions={
        <span
          className={`flex items-center gap-1.5 text-xs ${
            isValid ? "text-success" : "text-destructive"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${
              isValid ? "bg-success" : "bg-destructive"
            }`}
          />
          {isValid ? t("validFormat") : t("invalidFormat")}
        </span>
      }
      bodyClassName="space-y-4 p-5"
    >
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={pickerHex}
          onChange={(event) => onChoose(event.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-border bg-clip-padding bg-transparent p-0.5"
          aria-label={t("colorPicker")}
        />
        <input
          type="text"
          value={inputColor}
          onChange={(event) => onInput(event.target.value)}
          onBlur={onCommit}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className="h-11 w-full min-w-0 flex-1 rounded-lg border border-border bg-input px-4 font-mono text-foreground text-sm outline-none transition-colors focus:border-ring"
          placeholder={t("placeholder")}
          aria-label={t("title")}
        />
        {canPick && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0"
            onClick={pickFromScreen}
            aria-label={t("pickFromScreen")}
            title={t("pickFromScreen")}
          >
            <Pipette aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex items-end gap-4">
        <label className="block min-w-0 flex-1 text-sm">
          <span className="flex items-center justify-between text-muted-foreground">
            {t("opacity")}
            <span className="font-mono tabular-nums">
              {Math.round(opacity * 100)}%
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(opacity * 100)}
            disabled={!isValid}
            onChange={(event) =>
              onOpacityChange(Number(event.target.value) / 100)
            }
            className="mt-2 w-full accent-primary disabled:opacity-40"
          />
        </label>
        {/* Labelled, not an icon: Android has no tooltip, so an icon-only
            shuffle is a guess on the one platform most visitors are on. */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={randomColor}
        >
          <Shuffle aria-hidden="true" />
          {t("random")}
        </Button>
      </div>

      <div>
        <span className="mb-2.5 block text-muted-foreground text-sm">
          {t("presetColors")}
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const active =
              colorFormats?.hexOpaque.toLowerCase() === preset.toLowerCase()
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChoose(preset)}
                aria-pressed={active}
                aria-label={getColorName(preset) || preset}
                title={getColorName(preset) || preset}
                className={`size-9 cursor-pointer rounded-lg border bg-clip-padding transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "border-ring ring-2 ring-ring/40" : "border-border"
                }`}
                style={{ backgroundColor: preset }}
              />
            )
          })}
        </div>
      </div>
    </ToolCard>
  )
}
