import {
  BASE_BREAKPOINT,
  DEVICE_PRESETS,
  NAMED_RATIOS,
  PRESET_TOLERANCE,
  RATIO_TOLERANCE,
  TAILWIND_BREAKPOINTS
} from "../constants"
import type { AspectRatio, DevicePreset, ScreenMetrics } from "../types"

/**
 * Reads every measurement in one pass.
 *
 * One read per frame, not one per consumer: the previous hook exposed nine
 * separate getters, each of which touched `screen` and `window` again, and
 * `innerWidth` forces a layout flush.
 */
export function readMetrics(): ScreenMetrics {
  const { width, height, availWidth, availHeight, colorDepth } = window.screen

  return {
    screenWidth: width,
    screenHeight: height,
    availWidth,
    availHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    pixelRatio: window.devicePixelRatio,
    colorDepth,
    orientation: readOrientation(),
    isFullscreen: document.fullscreenElement !== null
  }
}

/**
 * Portrait or landscape.
 *
 * `screen.orientation.type` where it exists, because it reports what the OS
 * believes rather than what the numbers imply. The old rule was
 * `screen.width > screen.height`, which is right for a phone and wrong for a
 * rotated tablet whose `screen` dimensions do not swap on every engine.
 */
function readOrientation(): "portrait" | "landscape" {
  const type = window.screen.orientation?.type
  if (type) return type.startsWith("portrait") ? "portrait" : "landscape"
  return window.screen.width >= window.screen.height ? "landscape" : "portrait"
}

/**
 * The Tailwind prefix that applies at this width.
 *
 * Returns the LAST breakpoint whose minimum the width has passed, because
 * `min-width` queries stack: at 1400px, `sm:`, `md:`, `lg:` and `xl:` are all
 * active and `xl:` is the one that wins a conflict.
 */
export function activeBreakpoint(viewportWidth: number): string {
  let active = BASE_BREAKPOINT
  for (const breakpoint of TAILWIND_BREAKPOINTS) {
    if (viewportWidth >= breakpoint.min) active = breakpoint.name
  }
  return active
}

/**
 * Names a ratio, and says whether the name is real.
 *
 * A reduced fraction is only useful when it reduces to small numbers. 1920×1080
 * gives 16:9; 1366×768 gives 683:384, which tells a reader nothing. So the
 * measured ratio is matched against the standards first, and the reduced
 * fraction is the fallback — kept only while both sides stay under 40, past
 * which a decimal is more honest.
 */
export function describeAspectRatio(
  width: number,
  height: number
): AspectRatio {
  if (width <= 0 || height <= 0) {
    return { label: "—", exact: "—", standard: false }
  }

  const value = width / height
  const exact = `${value.toFixed(2)}:1`

  const nearest = NAMED_RATIOS.find(
    (ratio) => Math.abs(value - ratio.value) / ratio.value <= RATIO_TOLERANCE
  )
  if (nearest) return { label: nearest.label, exact, standard: true }

  const divisor = greatestCommonDivisor(width, height)
  const w = width / divisor
  const h = height / divisor
  if (w <= 40 && h <= 40) {
    return { label: `${w}:${h}`, exact, standard: false }
  }

  return { label: exact, exact, standard: false }
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

/**
 * Which known device this viewport looks like.
 *
 * Both orientations are tried, so a phone held sideways still matches itself.
 * Returns every match rather than the first: 1024×1366 is an iPad Pro 13" and
 * nothing else, but plenty of laptop windows land on a phone's width.
 */
export function matchingPresets(
  viewportWidth: number,
  viewportHeight: number
): DevicePreset[] {
  const near = (a: number, b: number) => Math.abs(a - b) <= PRESET_TOLERANCE

  return DEVICE_PRESETS.filter(
    (preset) =>
      (near(preset.width, viewportWidth) &&
        near(preset.height, viewportHeight)) ||
      (near(preset.height, viewportWidth) && near(preset.width, viewportHeight))
  )
}

/** Device pixels behind a CSS-pixel measurement. */
export function toDevicePixels(cssPixels: number, pixelRatio: number): number {
  return Math.round(cssPixels * pixelRatio)
}

/** Total pixels, in megapixels, to one decimal. */
export function megapixels(width: number, height: number): number {
  return Math.round((width * height) / 100_000) / 10
}

/**
 * A media query that matches the current viewport, ready to paste.
 *
 * The range form (`min-width` AND `max-width`) rather than a bare `min-width`,
 * because the reason to copy this is almost always "reproduce what I am
 * looking at right now", and an open-ended query does not do that.
 */
export function mediaQuerySnippet(metrics: ScreenMetrics): string {
  const breakpoint = activeBreakpoint(metrics.viewportWidth)
  const current = TAILWIND_BREAKPOINTS.find((b) => b.name === breakpoint)
  const next = TAILWIND_BREAKPOINTS.find((b) => b.min > (current?.min ?? 0))

  const lines = [
    `/* ${metrics.viewportWidth} x ${metrics.viewportHeight} CSS px, DPR ${metrics.pixelRatio} */`,
    current
      ? `@media (min-width: ${current.min}px)${next ? ` and (max-width: ${next.min - 1}px)` : ""} {`
      : `@media (max-width: ${(TAILWIND_BREAKPOINTS[0]?.min ?? 640) - 1}px) {`,
    "  /* Tailwind: " + (current ? `${breakpoint}:` : "no prefix") + " */",
    "}"
  ]

  if (metrics.pixelRatio > 1) {
    lines.push(
      "",
      `@media (min-resolution: ${metrics.pixelRatio}dppx) {`,
      "  /* high-density assets */",
      "}"
    )
  }

  return lines.join("\n")
}

/** The whole snapshot as JSON, for copy and download. */
export function metricsToJson(metrics: ScreenMetrics): string {
  const ratio = describeAspectRatio(metrics.screenWidth, metrics.screenHeight)

  return JSON.stringify(
    {
      screen: {
        css: `${metrics.screenWidth}x${metrics.screenHeight}`,
        device: `${toDevicePixels(metrics.screenWidth, metrics.pixelRatio)}x${toDevicePixels(metrics.screenHeight, metrics.pixelRatio)}`,
        available: `${metrics.availWidth}x${metrics.availHeight}`,
        aspectRatio: ratio.label,
        megapixels: megapixels(metrics.screenWidth, metrics.screenHeight)
      },
      viewport: {
        css: `${metrics.viewportWidth}x${metrics.viewportHeight}`,
        outer: `${metrics.outerWidth}x${metrics.outerHeight}`,
        breakpoint: activeBreakpoint(metrics.viewportWidth)
      },
      display: {
        pixelRatio: metrics.pixelRatio,
        colorDepth: metrics.colorDepth,
        orientation: metrics.orientation,
        fullscreen: metrics.isFullscreen
      }
    },
    null,
    2
  )
}
