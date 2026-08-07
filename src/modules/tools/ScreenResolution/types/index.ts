/**
 * Tool-scoped types.
 */

/**
 * Every number this page reports, in the units the browser gives them.
 *
 * CSS pixels and device pixels are kept SEPARATE and never mixed. The tool
 * this replaces computed `innerWidth / screen.width * 100` and called the
 * result a "viewport ratio" — a CSS-pixel width divided by a device-pixel
 * width, which on any Retina display is off by a factor of `pixelRatio`.
 */
export interface ScreenMetrics {
  /** `screen.width/height` — the whole display, in CSS pixels. */
  screenWidth: number
  screenHeight: number
  /** `screen.availWidth/availHeight` — display minus OS chrome (dock, taskbar). */
  availWidth: number
  availHeight: number
  /** `innerWidth/innerHeight` — what CSS media queries measure. */
  viewportWidth: number
  viewportHeight: number
  /** `outerWidth/outerHeight` — the browser window including its own chrome. */
  outerWidth: number
  outerHeight: number
  /** Device pixels per CSS pixel. 2 or 3 on most phones and Retina Macs. */
  pixelRatio: number
  colorDepth: number
  orientation: "portrait" | "landscape"
  isFullscreen: boolean
}

/** A named CSS breakpoint and the width at which it starts applying. */
export interface Breakpoint {
  name: string
  /** Minimum viewport width in CSS pixels — a `min-width` media query. */
  min: number
}

export type FrameworkId = "tailwind" | "bootstrap" | "mui"

/** A CSS framework's breakpoint scale. */
export interface Framework {
  id: FrameworkId
  label: string
  breakpoints: readonly Breakpoint[]
}

/**
 * A width the visitor is asking about instead of their own.
 *
 * Kept separate from `ScreenMetrics` on purpose: the readout must never stop
 * telling the truth about the real window. Everything DERIVED from a width —
 * the breakpoint, the device match, the media query — answers for this when it
 * is set, and the page says so.
 */
export interface Preview {
  width: number
  height: number
  /** Set when the width came from a device row rather than the input. */
  source?: string
}

/** A device to compare the current viewport against. */
export interface DevicePreset {
  name: string
  /** Viewport size in CSS pixels, portrait orientation. */
  width: number
  height: number
  pixelRatio: number
  kind: "phone" | "tablet" | "laptop" | "desktop"
}

/**
 * An aspect ratio, described two ways.
 *
 * `label` is the name a human uses ("16:9"); `exact` is the honest decimal.
 * The old code returned `width/gcd : height/gcd`, which is only readable when
 * the numbers happen to share a large divisor — 1920×1080 gave "16:9", but
 * 1366×768 gave **"683:384"**, and 1512×982 gave "756:491". Both are
 * arithmetically correct and useless.
 */
export interface AspectRatio {
  label: string
  exact: string
  /** True when `label` is a recognised standard rather than a reduced fraction. */
  standard: boolean
}
