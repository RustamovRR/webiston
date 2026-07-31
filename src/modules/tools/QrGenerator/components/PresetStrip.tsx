"use client"

import { cn } from "@webiston/ui/utils"
import { useTranslations } from "next-intl"
import { useId } from "react"

import type { QrStyle } from "../types"
import { isPresetActive, PRESETS, presetThumbnails } from "../utils/presets"

/**
 * Eight opinions, one click each.
 *
 * The single highest-value control on the page, and the reason is arithmetic:
 * the shape catalogues expose 1,728 combinations, and a visitor making one
 * code for one poster has no way to judge them. Every competitor that charges
 * money sells exactly this — saved design templates — and it is the one
 * premium feature that costs nothing to give away.
 *
 * Each thumbnail is a REAL code drawn by the real renderer with the real
 * preset, so the picture is a promise the click keeps.
 */

interface PresetStripProps {
  style: QrStyle
  onChange: (patch: Partial<QrStyle>) => void
}

export function PresetStrip({ style, onChange }: PresetStripProps) {
  const t = useTranslations("QrGeneratorPage.presets")
  const thumbnails = presetThumbnails()
  // Named by the visible label rather than by a duplicate `sr-only` legend.
  const labelId = useId()

  return (
    <fieldset aria-labelledby={labelId}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span id={labelId} className="text-muted-foreground text-sm">
          {t("title")}
        </span>
        <span className="text-muted-foreground text-xs">{t("hint")}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {PRESETS.map((preset, index) => {
          const active = isPresetActive(preset, style)
          const { model } = thumbnails[index]

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.style)}
              aria-pressed={active}
              className={cn(
                "group flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-border-strong hover:bg-accent/50"
              )}
            >
              <svg
                viewBox={`0 0 ${model.extent} ${model.extent}`}
                className="w-full"
                aria-hidden="true"
              >
                <title>{preset.id}</title>
                {model.gradient && (
                  <defs>
                    {model.gradient.type === "radial" ? (
                      <radialGradient id={model.gradient.id}>
                        <stop offset="0" stopColor={model.gradient.from} />
                        <stop offset="1" stopColor={model.gradient.to} />
                      </radialGradient>
                    ) : (
                      <linearGradient
                        id={model.gradient.id}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0" stopColor={model.gradient.from} />
                        <stop offset="1" stopColor={model.gradient.to} />
                      </linearGradient>
                    )}
                  </defs>
                )}
                <rect
                  width={model.extent}
                  height={model.extent}
                  rx={model.background.radius}
                  fill={model.background.fill}
                />
                <path d={model.dataPath} fill={model.ink} />
                {model.eyeFrames.map((d) => (
                  <path key={d} d={d} fill={model.ink} fillRule="evenodd" />
                ))}
                {model.eyeBalls.map((d) => (
                  <path key={d} d={d} fill={model.ink} />
                ))}
              </svg>
              <span
                className={cn(
                  "text-[11px] leading-none",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t(`names.${preset.id}`)}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
