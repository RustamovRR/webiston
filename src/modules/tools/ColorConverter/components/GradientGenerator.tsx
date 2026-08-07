"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Check, Copy, Minus, Plus, Shuffle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { hslToRgb, rgbToHex } from "@/lib/utils"

import {
  GRADIENT_TYPES,
  MAX_GRADIENT_STOPS,
  MIN_GRADIENT_STOPS
} from "../constants"
import { useCopyFeedback } from "../hooks/useCopyFeedback"
import { useColorDraftStore } from "../stores/colorDraftStore"
import type { GradientType } from "../types"
import {
  buildGradientCss,
  buildGradientTailwind,
  nextStop
} from "../utils/exports"

/**
 * CSS gradients from the chosen colour.
 *
 * The exports are pure functions in `utils/exports.ts` now, which is how the
 * Tailwind one was found to be wrong: it emitted `bg-linear-to-r` whatever the
 * type, so choosing "radial" and copying the class produced a linear gradient
 * in the destination, and any stop between the first and last was dropped in
 * silence.
 */

interface GradientGeneratorProps {
  /** The tool's colour, which the first stop follows. */
  baseColor: string
  isValid: boolean
}

export function GradientGenerator({
  baseColor,
  isValid
}: GradientGeneratorProps) {
  const t = useTranslations("ColorConverterPage.GradientGenerator")
  const gradient = useColorDraftStore((state) => state.gradient)
  const updateGradient = useColorDraftStore((state) => state.updateGradient)
  const setStops = useColorDraftStore((state) => state.setStops)
  const addStop = useColorDraftStore((state) => state.addStop)
  // Keyed on the draft itself: any edit — type, angle, a stop — rewrites both
  // snippets, so an outstanding tick is about a string that no longer exists.
  const { copied, copy } = useCopyFeedback(gradient)

  const { type, angle, stops } = gradient

  /**
   * The first stop follows the tool's colour — the gradient is OF the colour
   * being inspected, not a separate document. Guarded, because writing an
   * identical value would still hand the store a new array on every render.
   */
  useEffect(() => {
    if (!isValid) return
    const current = useColorDraftStore.getState().gradient.stops
    if (current[0].color === baseColor) return
    useColorDraftStore
      .getState()
      .setStops([{ ...current[0], color: baseColor }, ...current.slice(1)])
  }, [baseColor, isValid])

  if (!isValid) return null

  const css = buildGradientCss(gradient)
  const tailwind = buildGradientTailwind(gradient)

  const randomise = () => {
    const count = MIN_GRADIENT_STOPS + Math.floor(Math.random() * 3)
    setStops(
      Array.from({ length: count }, (_, index) => {
        const rgb = hslToRgb(
          Math.floor(Math.random() * 360),
          50 + Math.floor(Math.random() * 50),
          30 + Math.floor(Math.random() * 40)
        )
        return {
          id: index + 1,
          color: rgbToHex(rgb.r, rgb.g, rgb.b),
          position: Math.round((100 / (count - 1)) * index)
        }
      })
    )
    updateGradient({ angle: Math.floor(Math.random() * 360) })
  }

  const patchStop = (
    id: number,
    patch: { color?: string; position?: number }
  ) =>
    setStops(
      stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop))
    )

  return (
    // A workbench panel now, not a card: the ToolCard wrapper moved up to the
    // Workbench, which owns one card for all four views.
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={randomise}>
          <Shuffle aria-hidden="true" />
          {t("random")}
        </Button>
      </div>

      {/* `bg-clip-padding` is load-bearing on anything that paints a colour
          inside a token border. `--border` is a translucent WHITE in dark mode,
          and the default `border-box` clip paints the colour UNDER it — so the
          border composites on top and lightens the edge. Measured on the first
          stop: rgb(13,90,107) became rgb(42,110,125), a visible pale line down
          the left side of every gradient. Clipping to the padding box lets the
          border sit on the CARD, which is what a border is meant to look like.

          `backgroundImage`, NOT the `background` shorthand: a shorthand resets
          every longhand it does not name, `background-clip` included, and an
          inline style outranks the class. With `background:` here the element
          still measured `border-box` after `bg-clip-padding` was added. */}
      <div
        className="h-28 w-full rounded-lg border border-border bg-clip-padding"
        style={{ backgroundImage: css }}
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SegmentedControl<GradientType>
          label={t("type")}
          value={type}
          onChange={(next) => updateGradient({ type: next })}
          options={GRADIENT_TYPES.map((option) => ({
            value: option,
            label: t(`types.${option}`)
          }))}
        />
        {/* A radial gradient has no direction to set. */}
        {type !== "radial" && (
          <label className="block flex-1 text-sm sm:max-w-64">
            <span className="flex items-center justify-between text-muted-foreground">
              {t("direction")}
              <span className="font-mono tabular-nums">{angle}°</span>
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(event) =>
                updateGradient({ angle: Number(event.target.value) })
              }
              className="mt-2 w-full accent-primary"
            />
          </label>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {t("colorStops")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={stops.length >= MAX_GRADIENT_STOPS}
            onClick={() => addStop((id) => nextStop(stops, id))}
          >
            <Plus aria-hidden="true" />
            {t("addColor")}
          </Button>
        </div>

        {stops.map((stop, index) => (
          <div key={stop.id} className="flex items-center gap-2.5">
            <input
              type="color"
              value={stop.color}
              onChange={(event) =>
                patchStop(stop.id, { color: event.target.value })
              }
              aria-label={t("stopColor", { index: index + 1 })}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            />
            <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground text-xs">
              {stop.color}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={stop.position}
              onChange={(event) =>
                patchStop(stop.id, {
                  position: Math.max(
                    0,
                    Math.min(100, Number(event.target.value) || 0)
                  )
                })
              }
              aria-label={t("stopPosition", { index: index + 1 })}
              className="w-16 rounded-md border border-border bg-input px-2 py-1.5 text-foreground text-sm outline-none focus:border-ring"
            />
            <span aria-hidden="true" className="text-muted-foreground text-sm">
              %
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={stops.length <= MIN_GRADIENT_STOPS}
              onClick={() =>
                setStops(stops.filter((candidate) => candidate.id !== stop.id))
              }
              aria-label={t("removeColor")}
              className="text-muted-foreground hover:text-destructive"
            >
              <Minus aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copy(`background: ${css};`, "css")}
          >
            {copied === "css" ? (
              <Check aria-hidden="true" className="text-success" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            CSS
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copy(tailwind, "tailwind")}
          >
            {copied === "tailwind" ? (
              <Check aria-hidden="true" className="text-success" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            Tailwind
          </Button>
        </div>
        <code className="block overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-foreground text-xs">
          {`background: ${css};`}
        </code>
      </div>
    </div>
  )
}
