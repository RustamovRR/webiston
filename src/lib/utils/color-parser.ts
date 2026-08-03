/**
 * Universal colour parser.
 *
 * Accepts the syntax CSS Color 4 actually defines, not just the legacy comma
 * forms. The version this replaces understood `rgb(255, 0, 0)` and rejected
 * `rgb(255 0 0)` — the form every modern devtool, Figma export and Tailwind v4
 * token emits — so pasting a colour straight out of Chrome's inspector showed
 * "invalid format". It also let out-of-range channels through unclamped, so
 * `rgb(300, 0, 0)` produced a seven-digit hex downstream.
 *
 * Everything funnels into one shape: 8-bit sRGB channels plus alpha 0–1.
 */

import { getColorByName } from "@/constants/color-names"
import { hslToRgb } from "./color-conversions"
import { labToRgb, lchToLab, oklabToRgb, oklchToOklab } from "./color-spaces"

export interface ParsedColor {
  r: number
  g: number
  b: number
  a: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** `oklch(l 100% h)` means full chroma, and full chroma is 0.4 per spec. */
const OKLCH_CHROMA_AT_100_PERCENT = 0.4

/** One regex for every functional notation: `name(everything inside)`. */
const FUNCTIONAL = /^([a-z]+)\(([^()]*)\)$/

const isPercentage = (token: string) => token.endsWith("%")

const asNumber = (token: string) => Number.parseFloat(token)

/** 0–255, from either `128` or `50%`. */
const asChannel = (token: string) =>
  clamp(
    Math.round(isPercentage(token) ? asNumber(token) * 2.55 : asNumber(token)),
    0,
    255
  )

/** 0–1, from `0.5`, `50%`, or nothing at all. */
const asAlpha = (token: string | undefined) => {
  if (token === undefined) return 1
  const value = isPercentage(token) ? asNumber(token) / 100 : asNumber(token)
  return Number.isFinite(value) ? clamp(value, 0, 1) : 1
}

interface FunctionalNotation {
  name: string
  /** The arguments before any `/`, already split on commas or whitespace. */
  args: string[]
  alpha: number
}

/**
 * Splits `rgb(255 0 0 / 50%)` and `rgba(255, 0, 0, 0.5)` into the same shape.
 * The slash form is authoritative when present; otherwise a fourth positional
 * argument is the alpha, which is how the legacy `rgba()`/`hsla()` forms and
 * the modern comma form both spell it.
 */
const readFunctional = (input: string): FunctionalNotation | null => {
  const match = input.match(FUNCTIONAL)
  if (!match) return null

  const [body, alphaToken] = match[2].split("/")
  const args = body
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
  if (args.length === 0) return null

  if (alphaToken !== undefined) {
    return { name: match[1], args, alpha: asAlpha(alphaToken.trim()) }
  }
  if (args.length === 4) {
    return { name: match[1], args: args.slice(0, 3), alpha: asAlpha(args[3]) }
  }
  return { name: match[1], args, alpha: 1 }
}

const expandShorthandHex = (hex: string) =>
  hex.length <= 4
    ? hex
        .split("")
        .map((char) => char + char)
        .join("")
    : hex

const parseHex = (input: string): ParsedColor | null => {
  const match = input.match(/^#([a-f0-9]{3,8})$/)
  if (!match) return null

  const hex = expandShorthandHex(match[1])
  if (hex.length !== 6 && hex.length !== 8) return null

  const channel = (offset: number) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16)

  return {
    r: channel(0),
    g: channel(2),
    b: channel(4),
    a: hex.length === 8 ? channel(6) / 255 : 1
  }
}

/**
 * `lab(50% 20 30)` and `oklab(0.5 0.1 0.1)` both write lightness first, but on
 * different scales — Lab is 0–100, OKLab is 0–1. A percentage always means
 * "this fraction of the space", so it needs scaling per space, not one shared
 * divisor.
 */
const asLightness = (token: string, scale: 1 | 100) =>
  isPercentage(token) ? (asNumber(token) / 100) * scale : asNumber(token)

const parseFunctional = (notation: FunctionalNotation): ParsedColor | null => {
  const { name, args, alpha } = notation
  const [first, second, third] = args

  switch (name) {
    case "rgb":
    case "rgba": {
      if (args.length < 3) return null
      return {
        r: asChannel(first),
        g: asChannel(second),
        b: asChannel(third),
        a: alpha
      }
    }
    case "hsl":
    case "hsla": {
      if (args.length < 3) return null
      // `200deg` and `200` are the same hue; parseFloat drops the unit.
      const rgb = hslToRgb(
        ((asNumber(first) % 360) + 360) % 360,
        clamp(asNumber(second), 0, 100),
        clamp(asNumber(third), 0, 100)
      )
      return { ...rgb, a: alpha }
    }
    case "lab": {
      if (args.length < 3) return null
      const rgb = labToRgb(
        asLightness(first, 100),
        asNumber(second),
        asNumber(third)
      )
      return { ...rgb, a: alpha }
    }
    case "lch": {
      if (args.length < 3) return null
      const lab = lchToLab(
        asLightness(first, 100),
        asNumber(second),
        asNumber(third)
      )
      const rgb = labToRgb(lab.l, lab.a, lab.b)
      return { ...rgb, a: alpha }
    }
    case "oklab": {
      if (args.length < 3) return null
      const rgb = oklabToRgb(
        asLightness(first, 1),
        asNumber(second),
        asNumber(third)
      )
      return { ...rgb, a: alpha }
    }
    case "oklch": {
      if (args.length < 3) return null
      const chroma = isPercentage(second)
        ? (asNumber(second) / 100) * OKLCH_CHROMA_AT_100_PERCENT
        : asNumber(second)
      const oklab = oklchToOklab(asLightness(first, 1), chroma, asNumber(third))
      const rgb = oklabToRgb(oklab.l, oklab.a, oklab.b)
      return { ...rgb, a: alpha }
    }
    default:
      return null
  }
}

export const parseColorInput = (input: string): ParsedColor | null => {
  const cleanInput = input.trim().toLowerCase()
  if (!cleanInput) return null

  // The one keyword that is not a hue: fully transparent black.
  if (cleanInput === "transparent") return { r: 0, g: 0, b: 0, a: 0 }

  const hex = parseHex(cleanInput)
  if (hex) return hex

  const notation = readFunctional(cleanInput)
  if (notation) {
    const parsed = parseFunctional(notation)
    if (parsed) return parsed
  }

  const namedHex = getColorByName(cleanInput)
  return namedHex ? parseHex(namedHex.toLowerCase()) : null
}

/** Check if input is a valid colour in any supported format. */
export const isValidColor = (input: string): boolean =>
  parseColorInput(input) !== null
