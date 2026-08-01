"use client"

import { useTranslations } from "next-intl"

import { PRESET_COLORS } from "../constants"
import type { ColorFormats } from "../hooks/useColorConverter"
import { getColorName } from "../hooks/useColorConverter"

/**
 * The colour being inspected: picker, free-form input, opacity, presets.
 *
 * The version this replaces wrapped the card in four layers of ambient glow
 * divs and a dynamic-coloured terminal frame. All of it is gone: the swatch,
 * the presets and the preview ARE colour — the card around them stays plain,
 * which is the suite's rule everywhere else.
 */

interface ColorInputPanelProps {
  inputColor: string
  colorFormats: ColorFormats | null
  colorName: string
  /** Live typing — updates the colour, records nothing. */
  onInput: (color: string) => void
  /** A deliberate pick — preset, picker — records into history too. */
  onChoose: (color: string) => void
  /** Typing finished (blur): record what stands, if valid. */
  onCommit: () => void
}

export function ColorInputPanel({
  inputColor,
  colorFormats,
  colorName,
  onInput,
  onChoose,
  onCommit
}: ColorInputPanelProps) {
  const t = useTranslations("ColorConverterPage.ColorInput")
  const isValid = colorFormats !== null

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-border border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-[2px] bg-border-strong"
          />
          <h2 className="font-medium text-base text-foreground">
            {t("title")}
          </h2>
        </div>
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
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={
              isValid ? colorFormats.hex.slice(0, 7) : inputColor.slice(0, 7)
            }
            onChange={(event) => onChoose(event.target.value)}
            className="h-12 w-16 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            aria-label={t("colorPicker")}
          />
          <input
            type="text"
            value={inputColor}
            onChange={(event) => onInput(event.target.value)}
            onBlur={onCommit}
            spellCheck={false}
            className="w-full min-w-0 flex-1 rounded-lg border border-border bg-input px-4 py-3 font-mono text-foreground text-sm outline-none transition-colors focus:border-ring"
            placeholder={t("placeholder")}
            aria-label={t("title")}
          />
        </div>

        {isValid && colorFormats.opacity < 1 && (
          <label className="block text-sm">
            <span className="text-muted-foreground">
              {t("opacity")}: {Math.round(colorFormats.opacity * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={colorFormats.opacity}
              onChange={(event) => {
                const { r, g, b } = colorFormats.rgbValues
                const alpha = Number(event.target.value)
                onInput(
                  alpha === 1
                    ? colorFormats.hex.slice(0, 7)
                    : `rgba(${r}, ${g}, ${b}, ${alpha})`
                )
              }}
              className="mt-2 w-full accent-primary"
            />
          </label>
        )}

        {isValid && (
          <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
            <span
              className="size-16 shrink-0 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: inputColor }}
              aria-hidden="true"
            />
            <div className="min-w-0 font-mono text-muted-foreground text-xs leading-relaxed">
              <div className="text-foreground">
                {colorFormats.hex}
                {colorName && (
                  <span className="ml-2 font-sans text-muted-foreground">
                    {colorName}
                  </span>
                )}
              </div>
              <div>
                rgb {colorFormats.rgbValues.r}, {colorFormats.rgbValues.g},{" "}
                {colorFormats.rgbValues.b}
              </div>
              <div>
                hsl {colorFormats.hslValues.h}° {colorFormats.hslValues.s}%{" "}
                {colorFormats.hslValues.l}%
              </div>
            </div>
          </div>
        )}

        <div>
          <span className="mb-2.5 block text-muted-foreground text-sm">
            {t("presetColors")}
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => {
              const active = inputColor.toLowerCase() === preset.toLowerCase()
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChoose(preset)}
                  aria-pressed={active}
                  title={getColorName(preset) || preset}
                  className={`size-9 cursor-pointer rounded-lg border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active ? "border-ring ring-2 ring-ring/40" : "border-border"
                  }`}
                  style={{ backgroundColor: preset }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
