import { COLOR_NAMES } from "@/constants/color-names"
import { hexToRgb, oklabToOklch, rgbToOklab } from "@/lib/utils"

import { DEFAULT_TOKEN_NAME } from "../constants"
import type {
  ExportNotation,
  ExportTarget,
  GradientDraft,
  GradientStop,
  ShadeStep
} from "../types"

/**
 * Everything the tool hands to the clipboard, as pure functions.
 *
 * These used to be built inline inside the components, which meant the only
 * way to find out whether the Tailwind snippet was valid was to paste it into
 * a project. The gradient one was not: it emitted `bg-linear-to-r` for a
 * RADIAL gradient, so choosing "radial" and copying the Tailwind class gave a
 * linear gradient in the destination.
 */

/* ------------------------------------------------------------------ names */

interface NamedColor {
  name: string
  oklab: { l: number; a: number; b: number }
}

/** hex → name, for the handful of inputs that land exactly on a CSS colour. */
const NAME_BY_HEX: ReadonlyMap<string, string> = new Map(
  Object.entries(COLOR_NAMES).map(([name, hex]) => [hex.toLowerCase(), name])
)

/**
 * The same registry in OKLab, built once, for nearest-match.
 *
 * The registry holds duplicates by design — `gray`/`grey`, `cyan`/`aqua`,
 * `magenta`/`fuchsia` — so it is keyed by HEX here and the first spelling wins.
 * Otherwise the same colour competes with itself for the nearest slot.
 */
const NAMED_COLORS: readonly NamedColor[] = Array.from(
  new Map(
    Object.entries(COLOR_NAMES).map(([name, hex]) => [hex.toLowerCase(), name])
  )
)
  .map(([hex, name]) => {
    const rgb = hexToRgb(hex)
    return rgb ? { name, oklab: rgbToOklab(rgb.r, rgb.g, rgb.b) } : null
  })
  .filter((entry): entry is NamedColor => entry !== null)

/**
 * How far a colour may sit from a named one and still borrow its name.
 *
 * OKLab distance is perceptual, so this is roughly "a person would call these
 * the same colour". Without a ceiling every input gets a name and the label
 * stops meaning anything.
 */
const NEAREST_NAME_LIMIT = 0.12

/**
 * The name of a colour, exactly or approximately.
 *
 * This was an exact-hex `Map` lookup, which meant it returned `""` for
 * essentially every real input — the site's own `#0d5a6b` included. It is
 * called in three places and the export panel's token-name default depends on
 * it, so the feature was dead in all four. Exact match stays the fast path;
 * anything else falls back to the nearest name in OKLab, which is the space
 * that makes "nearest" mean what a person means by it.
 */
/**
 * Answers are cached because the callers ask in bulk and ask again every
 * render: twelve preset swatches in the controls card and up to twenty palette
 * swatches, each one a full 139-entry OKLab scan on any colour that is not
 * itself a CSS keyword — which is nearly all of them. The registry is frozen at
 * module load, so a hex has exactly one answer for the life of the page.
 */
const NAME_CACHE = new Map<string, string>()

export const getColorName = (hex: string): string => {
  const opaque = hex.slice(0, 7).toLowerCase()

  const exact = NAME_BY_HEX.get(opaque)
  if (exact) return exact

  const cached = NAME_CACHE.get(opaque)
  if (cached !== undefined) return cached

  const rgb = hexToRgb(opaque)
  if (!rgb) return ""

  const target = rgbToOklab(rgb.r, rgb.g, rgb.b)
  let best = ""
  let bestDistance = Number.POSITIVE_INFINITY

  for (const candidate of NAMED_COLORS) {
    const distance = Math.hypot(
      candidate.oklab.l - target.l,
      candidate.oklab.a - target.a,
      candidate.oklab.b - target.b
    )
    if (distance < bestDistance) {
      bestDistance = distance
      best = candidate.name
    }
  }

  const name = bestDistance <= NEAREST_NAME_LIMIT ? best : ""
  NAME_CACHE.set(opaque, name)
  return name
}

/** `Dark Slate Gray` → `dark-slate-gray`, safe as a CSS custom-property stem. */
export const toTokenName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || DEFAULT_TOKEN_NAME

/* ----------------------------------------------------------------- shades */

/**
 * Tailwind v4's own palette is authored in OKLCH, so a `@theme` block full of
 * hex reads as dated beside the framework's own tokens. Both notations are
 * free — the conversions are already in `lib/utils` and test-pinned.
 */
const writeValue = (hex: string, notation: ExportNotation): string => {
  if (notation === "hex") return hex
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const oklab = rgbToOklab(rgb.r, rgb.g, rgb.b)
  const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)
  const round = (value: number) => Math.round(value * 1000) / 1000
  // A neutral has no meaningful hue; `oklch(0.5 0 0)` is the conventional form.
  return `oklch(${round(oklch.l)} ${round(oklch.c)} ${oklch.c < 0.0005 ? 0 : oklch.h})`
}

export interface ScaleExportOptions {
  shades: readonly ShadeStep[]
  name: string
  notation: ExportNotation
}

const buildCssVariables = ({ shades, name, notation }: ScaleExportOptions) =>
  `:root {\n${shades
    .map(
      ({ shade, hex }) =>
        `  --color-${name}-${shade}: ${writeValue(hex, notation)};`
    )
    .join("\n")}\n}`

/**
 * Tailwind v4 registers colours through `@theme`, not a JS config object. The
 * nested-object form this replaces has not been how Tailwind is configured
 * since v4 shipped — and this repo is itself on v4.
 */
const buildTailwindTheme = ({ shades, name, notation }: ScaleExportOptions) =>
  `@theme {\n${shades
    .map(
      ({ shade, hex }) =>
        `  --color-${name}-${shade}: ${writeValue(hex, notation)};`
    )
    .join("\n")}\n}`

const buildScssVariables = ({ shades, name, notation }: ScaleExportOptions) =>
  shades
    .map(({ shade, hex }) => `$${name}-${shade}: ${writeValue(hex, notation)};`)
    .join("\n")

const BUILDERS: Record<ExportTarget, (options: ScaleExportOptions) => string> =
  {
    css: buildCssVariables,
    tailwind: buildTailwindTheme,
    scss: buildScssVariables
  }

/**
 * The token stem was hardcoded to `primary` in all three builders, so a
 * visitor exporting two scales got two colliding blocks and had to hand-edit
 * one of them.
 */
export const buildScaleExport = (
  target: ExportTarget,
  options: ScaleExportOptions
): string => BUILDERS[target](options)

/** The file extension each target expects when downloaded. */
export const EXPORT_FILENAME: Record<ExportTarget, string> = {
  css: "css",
  tailwind: "css",
  scss: "scss"
}

/* -------------------------------------------------------------- gradient */

const sortStops = (stops: readonly GradientStop[]) =>
  [...stops].sort((a, b) => a.position - b.position)

export const buildGradientCss = ({ type, angle, stops }: GradientDraft) => {
  const list = sortStops(stops)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ")

  if (type === "radial") return `radial-gradient(circle, ${list})`
  if (type === "conic") return `conic-gradient(from ${angle}deg, ${list})`
  return `linear-gradient(${angle}deg, ${list})`
}

/** The four angles Tailwind spells with a keyword rather than a value. */
const CARDINAL_DIRECTIONS: Record<number, string> = {
  0: "to-t",
  90: "to-r",
  180: "to-b",
  270: "to-l"
}

/**
 * Tailwind v4 can express a two- or three-stop linear gradient idiomatically
 * (`bg-linear-to-r from-… via-… to-…`) and nothing else. Rather than emit a
 * class that quietly loses the type or the middle stops, anything outside that
 * shape falls back to the arbitrary-value form — which is exact for every
 * gradient this tool can build.
 */
export const buildGradientTailwind = (draft: GradientDraft): string => {
  const stops = sortStops(draft.stops)
  const direction = CARDINAL_DIRECTIONS[draft.angle]
  const idiomatic =
    draft.type === "linear" && direction !== undefined && stops.length <= 3

  if (!idiomatic) {
    // Tailwind reads a space as the end of the class, so arbitrary values
    // spell one with an underscore.
    return `bg-[${buildGradientCss(draft).replace(/\s+/g, "_")}]`
  }

  const parts = [`bg-linear-${direction}`, `from-[${stops[0].color}]`]
  if (stops.length === 3) parts.push(`via-[${stops[1].color}]`)
  parts.push(`to-[${stops[stops.length - 1].color}]`)
  return parts.join(" ")
}

/**
 * A new stop lands halfway between the last two, not at a fixed 50% carrying a
 * hardcoded brand colour — which is what made "add colour" produce a stop that
 * sat on top of an existing one and belonged to no scheme.
 */
export const nextStop = (
  stops: readonly GradientStop[],
  id: number
): GradientStop => {
  const sorted = sortStops(stops)
  const last = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2] ?? sorted[0]
  return {
    id,
    color: last.color,
    position: Math.round((previous.position + last.position) / 2)
  }
}
