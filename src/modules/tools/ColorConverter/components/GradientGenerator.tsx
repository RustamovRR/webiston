"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Check, Copy, Minus, Plus, Shuffle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { hslToRgb, rgbToHex } from "@/lib/utils"

/**
 * CSS gradients from the chosen colour: type, angle, 2–5 stops, one-click
 * CSS. The half-guessed "Tailwind class" export is gone — it mapped every
 * colour to grey and no real project could paste it; the arbitrary-value
 * form (`from-[#…] to-[#…]`) is what Tailwind actually accepts.
 */

interface GradientStop {
  color: string
  position: number
}

type GradientType = "linear" | "radial" | "conic"

const GRADIENT_TYPES: readonly GradientType[] = ["linear", "radial", "conic"]

const MAX_STOPS = 5
const MIN_STOPS = 2

interface GradientGeneratorProps {
  baseColor: string
  isValid: boolean
}

export function GradientGenerator({
  baseColor,
  isValid
}: GradientGeneratorProps) {
  const t = useTranslations("ColorConverterPage.GradientGenerator")
  const [type, setType] = useState<GradientType>("linear")
  const [direction, setDirection] = useState(90)
  const [stops, setStops] = useState<GradientStop[]>([
    { color: baseColor, position: 0 },
    { color: "#ffffff", position: 100 }
  ])
  const [copied, setCopied] = useState<"css" | "tailwind" | null>(null)

  // The first stop follows the tool's colour — the gradient is OF the colour
  // being inspected, not a separate document.
  useEffect(() => {
    if (isValid) {
      setStops((previous) => [
        { ...previous[0], color: baseColor },
        ...previous.slice(1)
      ])
    }
  }, [baseColor, isValid])

  if (!isValid) return null

  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const stopList = sorted
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ")
  const css =
    type === "linear"
      ? `linear-gradient(${direction}deg, ${stopList})`
      : type === "radial"
        ? `radial-gradient(circle, ${stopList})`
        : `conic-gradient(from ${direction}deg, ${stopList})`

  const tailwind = `bg-linear-${
    direction === 0
      ? "to-t"
      : direction === 90
        ? "to-r"
        : direction === 180
          ? "to-b"
          : direction === 270
            ? "to-l"
            : `[${direction}deg]`
  } from-[${sorted[0]?.color}] to-[${sorted[sorted.length - 1]?.color}]`

  const copyValue = async (kind: "css" | "tailwind", value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  const randomise = () => {
    const count = 2 + Math.floor(Math.random() * 3)
    setStops(
      Array.from({ length: count }, (_, index) => {
        const rgb = hslToRgb(
          Math.floor(Math.random() * 360),
          50 + Math.floor(Math.random() * 50),
          30 + Math.floor(Math.random() * 40)
        )
        return {
          color: rgbToHex(rgb.r, rgb.g, rgb.b),
          position: Math.round((100 / (count - 1)) * index)
        }
      })
    )
    setDirection(Math.floor(Math.random() * 360))
  }

  const updateStop = (index: number, patch: Partial<GradientStop>) =>
    setStops((previous) =>
      previous.map((stop, i) => (i === index ? { ...stop, ...patch } : stop))
    )

  return (
    <section className="mt-6 rounded-xl border border-border bg-card">
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
        <Button type="button" variant="outline" size="sm" onClick={randomise}>
          <Shuffle aria-hidden="true" />
          {t("random")}
        </Button>
      </div>

      <div className="space-y-5 p-5">
        <div
          className="h-28 w-full rounded-lg border border-border"
          style={{ background: css }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SegmentedControl<GradientType>
            label={t("type")}
            value={type}
            onChange={setType}
            options={GRADIENT_TYPES.map((option) => ({
              value: option,
              label: t(`types.${option}`)
            }))}
          />
          {type !== "radial" && (
            <label className="block flex-1 text-sm sm:max-w-64">
              <span className="text-muted-foreground">
                {t("direction")}: {direction}°
              </span>
              <input
                type="range"
                min={0}
                max={360}
                value={direction}
                onChange={(event) => setDirection(Number(event.target.value))}
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
              disabled={stops.length >= MAX_STOPS}
              onClick={() =>
                setStops((previous) => [
                  ...previous,
                  { color: "#0d5a6b", position: 50 }
                ])
              }
            >
              <Plus aria-hidden="true" />
              {t("addColor")}
            </Button>
          </div>

          {stops.map((stop, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stops have no identity beyond their slot
            <div key={index} className="flex items-center gap-2.5">
              <input
                type="color"
                value={stop.color}
                onChange={(event) =>
                  updateStop(index, { color: event.target.value })
                }
                aria-label={t("colorStops")}
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
                  updateStop(index, {
                    position: Math.max(
                      0,
                      Math.min(100, Number(event.target.value) || 0)
                    )
                  })
                }
                aria-label="%"
                className="w-16 rounded-md border border-border bg-input px-2 py-1.5 text-foreground text-sm outline-none focus:border-ring"
              />
              <span className="text-muted-foreground text-sm">%</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={stops.length <= MIN_STOPS}
                onClick={() =>
                  setStops((previous) => previous.filter((_, i) => i !== index))
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
              onClick={() => copyValue("css", `background: ${css};`)}
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
              onClick={() => copyValue("tailwind", tailwind)}
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
            background: {css};
          </code>
        </div>
      </div>
    </section>
  )
}
