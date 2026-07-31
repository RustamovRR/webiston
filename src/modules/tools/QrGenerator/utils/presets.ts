import type { QrStyle } from "../types"
import { buildMatrix } from "./matrix"
import { buildQrModel, type QrModel } from "./render"

/**
 * Ready-made looks.
 *
 * This is the answer to a real problem the shape catalogues created: 16 module
 * shapes x 9 eye frames x 12 eye centres is 1,728 combinations, most of them
 * bad, and a visitor who came to make one code for one poster does not want to
 * audition them. A preset is a designer's opinion — "these three shapes and
 * this ink belong together" — delivered in one click.
 *
 * What a preset does NOT touch is as deliberate as what it sets: the frame,
 * the caption, the logo and the quiet zone survive, because those carry the
 * visitor's own content and intent. A preset restyles; it never discards.
 */

/**
 * Preset INK, not interface colour.
 *
 * Same documented exception as `constants/index.ts`: a QR code is a printed
 * artefact judged against absolute black on absolute white, and it must not
 * follow the site's light/dark scheme — a code that inverted itself in dark
 * mode would stop scanning. Every value here is dark enough to clear the
 * contrast check against white on its own.
 */
const INK = {
  black: "#000000",
  paper: "#ffffff",
  /** Cool near-black; reads as "software" next to true black. */
  slate: "#0f172a",
  /** Warm near-black, for the typographic presets. */
  ink: "#1c1917",
  /**
   * The brand gradient's two stops.
   *
   * Both are measured against white, not picked by eye: 15.1:1 and 7.8:1. The
   * obvious choice — the brand teal `#0ea5b7` — sits at 2.6:1 and the second
   * half of the code would have been unreadable, which is exactly the failure
   * the preset test now catches. Teal-700 `#0e7490` was the next attempt and
   * it failed too, at 5.4:1.
   */
  brandDeep: "#062a33",
  brandTeal: "#0d5a6b"
} as const

/** The fields a preset owns. Everything else is the visitor's. */
export type PresetStyle = Pick<
  QrStyle,
  | "dotType"
  | "cornerSquareType"
  | "cornerDotType"
  | "foregroundColor"
  | "backgroundColor"
  | "gradientType"
  | "backgroundRound"
> & { gradientColor?: string }

export interface QrPreset {
  id: string
  style: PresetStyle
}

export const PRESETS: readonly QrPreset[] = [
  {
    id: "classic",
    style: {
      dotType: "square",
      cornerSquareType: "square",
      cornerDotType: "square",
      foregroundColor: INK.black,
      backgroundColor: INK.paper,
      gradientColor: undefined,
      gradientType: "linear",
      backgroundRound: 0
    }
  },
  {
    id: "modern",
    style: {
      dotType: "fluid",
      cornerSquareType: "extra-rounded",
      cornerDotType: "circle",
      foregroundColor: INK.black,
      backgroundColor: INK.paper,
      gradientColor: undefined,
      gradientType: "linear",
      backgroundRound: 0.08
    }
  },
  {
    id: "soft",
    style: {
      dotType: "fluid-soft",
      cornerSquareType: "rounded",
      cornerDotType: "rounded",
      foregroundColor: INK.slate,
      backgroundColor: INK.paper,
      gradientColor: undefined,
      gradientType: "linear",
      backgroundRound: 0.12
    }
  },
  {
    id: "dotted",
    style: {
      dotType: "dots",
      cornerSquareType: "circle",
      cornerDotType: "circle",
      foregroundColor: INK.black,
      backgroundColor: INK.paper,
      gradientColor: undefined,
      gradientType: "linear",
      backgroundRound: 0.16
    }
  },
  {
    id: "elegant",
    style: {
      dotType: "classy-rounded",
      cornerSquareType: "leaf",
      cornerDotType: "leaf",
      foregroundColor: INK.ink,
      backgroundColor: INK.paper,
      gradientColor: undefined,
      gradientType: "linear",
      backgroundRound: 0.06
    }
  },
  {
    id: "tech",
    style: {
      dotType: "bevel",
      cornerSquareType: "bevel",
      cornerDotType: "bars-v",
      foregroundColor: INK.slate,
      backgroundColor: INK.paper,
      gradientColor: undefined,
      gradientType: "linear",
      backgroundRound: 0
    }
  },
  {
    id: "brand",
    style: {
      dotType: "fluid",
      cornerSquareType: "rounded",
      cornerDotType: "dot-grid",
      foregroundColor: INK.brandDeep,
      backgroundColor: INK.paper,
      gradientColor: INK.brandTeal,
      gradientType: "linear",
      backgroundRound: 0.1
    }
  },
  {
    id: "mosaic",
    style: {
      dotType: "mosaic",
      cornerSquareType: "sharp",
      cornerDotType: "sharp",
      foregroundColor: INK.black,
      backgroundColor: INK.paper,
      gradientColor: undefined,
      gradientType: "linear",
      backgroundRound: 0
    }
  }
]

/**
 * Is this preset what is currently on screen?
 *
 * Compares only the fields a preset owns, so a visitor who applied "Zamonaviy"
 * and then added a frame or a logo still sees "Zamonaviy" as active — which is
 * true, because the preset's own contribution is untouched.
 */
export function isPresetActive(preset: QrPreset, style: QrStyle): boolean {
  return (Object.keys(preset.style) as (keyof PresetStyle)[]).every(
    (key) => preset.style[key] === style[key]
  )
}

/** Payload the thumbnails encode. Short on purpose: version 1, 21x21. */
const SAMPLE = "webiston.uz"

/** Thumbnail edge in user units — the swatch scales it. */
const THUMB_EXTENT = 100

let cache: { id: string; model: QrModel }[] | null = null

/**
 * One model per preset, for the swatch strip.
 *
 * All eight share ONE encode. Measured, encoding is 73% of the cost of
 * drawing a code (0.322 ms of 0.441 ms at this size), so passing the matrix in
 * rather than the text turns eight encodes into one — and the result is cached
 * because the sample text and the presets are both constants.
 */
export function presetThumbnails(): { id: string; model: QrModel }[] {
  if (cache) return cache

  const matrix = buildMatrix(SAMPLE, "M")

  cache = PRESETS.map((preset) => ({
    id: preset.id,
    model: buildQrModel({
      matrix,
      // The thumbnail is drawn by the real renderer with the real preset, so
      // it cannot promise a look the click does not deliver.
      style: {
        ...preset.style,
        logoSize: 0,
        quietZone: 2,
        frame: "none",
        frameLabel: ""
      },
      extent: THUMB_EXTENT,
      // Two modules, not four: at 40px the standard margin would eat a third
      // of the swatch. This is a picture of a style, not a scannable code.
      quietZone: 2,
      // Namespaced, so a thumbnail's <defs> can never shadow the preview's.
      idScope: `preset-${preset.id}`
    })
  }))

  return cache
}
