/** Shapes the colour converter passes between its hook, store and panels. */

export type PaletteType = "monochromatic" | "analogous" | "complementary"

/** The four jobs the workbench switches between. */
export type WorkbenchView = "scale" | "palette" | "gradient" | "saved"

export type GradientType = "linear" | "radial" | "conic"

/**
 * Stops carry an `id` because they are reorderable and removable. Keyed by
 * array index, React reuses the wrong row's state when a middle stop is
 * deleted — the colour input keeps the removed stop's value.
 */
export interface GradientStop {
  id: number
  color: string
  position: number
}

export interface GradientDraft {
  type: GradientType
  /** Degrees. Ignored by `radial`, which has no direction. */
  angle: number
  stops: GradientStop[]
}

export interface ShadeStep {
  shade: number
  hex: string
}

/** Where a scale lands: a file, a stylesheet, a preprocessor. */
export type ExportTarget = "css" | "tailwind" | "scss"

/** How each value inside it is written. */
export type ExportNotation = "hex" | "oklch"

/**
 * Every notation of the current colour, ready to render.
 *
 * RGB and HSL carry their own alpha in the CSS Color 4 slash form, which is why
 * there are no separate RGBA/HSLA entries: `rgb(13 90 107)` opaque,
 * `rgb(13 90 107 / 0.6)` translucent. One syntax family across all seven rows —
 * the old panel printed the legacy comma form for two rows and the modern space
 * form for five, which reads as two different tools.
 */
export interface ColorFormats {
  /** Uppercase, 8 digits when the colour is translucent. */
  hex: string
  /** Always 6 digits — for `<input type="color">` and gradient stops. */
  hexOpaque: string
  rgb: string
  hsl: string
  lab: string
  lch: string
  oklab: string
  oklch: string
  rgbValues: { r: number; g: number; b: number; a: number }
  hslValues: { h: number; s: number; l: number }
  /** 0–1. */
  opacity: number
}

/** The rows the pinned summary shows without being asked. */
export type PrimaryFormatKey = "hex" | "rgb" | "hsl" | "oklch"

/** The rows behind the disclosure. */
export type SecondaryFormatKey = "oklab" | "lch" | "lab"

export type FormatKey = PrimaryFormatKey | SecondaryFormatKey
