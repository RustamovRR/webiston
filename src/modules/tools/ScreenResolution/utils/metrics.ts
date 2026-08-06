import {
  BASE_BREAKPOINT,
  DEVICE_PRESETS,
  MAX_PROBE_WIDTH,
  MIN_PROBE_WIDTH,
  NAMED_RATIOS,
  PRESET_TOLERANCE,
  RATIO_TOLERANCE,
  TAILWIND_BREAKPOINTS
} from "../constants"
import type {
  AspectRatio,
  Breakpoint,
  DevicePreset,
  Framework,
  ScreenMetrics
} from "../types"

/**
 * A width the visitor typed, or `null` if it cannot be used.
 *
 * Kept here rather than in the input component so the bounds are testable and
 * the component stays presentational. Rejects rather than clamps: silently
 * turning "50" into 240 would make the readout disagree with the field, and a
 * field that argues with you is worse than one that waits.
 */
export function parseProbeWidth(raw: string): number | null {
  const value = Number.parseInt(raw.trim(), 10)
  if (!Number.isFinite(value)) return null
  if (value < MIN_PROBE_WIDTH || value > MAX_PROBE_WIDTH) return null
  return value
}

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
 * The prefix that applies at this width, in the given breakpoint scale.
 *
 * Returns the LAST breakpoint whose minimum the width has passed, because
 * `min-width` queries stack: at 1400px, `sm:`, `md:`, `lg:` and `xl:` are all
 * active and `xl:` is the one that wins a conflict.
 *
 * The scale is a parameter rather than a constant because the same width sits
 * in different breakpoints depending on the framework — 1000px is `md` in
 * Tailwind, `lg` in Bootstrap and `md` in MUI.
 */
export function activeBreakpoint(
  viewportWidth: number,
  breakpoints: readonly Breakpoint[] = TAILWIND_BREAKPOINTS
): string {
  let active = BASE_BREAKPOINT
  for (const breakpoint of breakpoints) {
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
 * A media query that matches the given width, ready to paste.
 *
 * The range form (`min-width` AND `max-width`) rather than a bare `min-width`,
 * because the reason to copy this is almost always "reproduce what I am
 * looking at right now", and an open-ended query also matches every width
 * above it.
 */
export function mediaQuerySnippet({
  width,
  height,
  pixelRatio,
  framework
}: {
  width: number
  height: number
  pixelRatio: number
  framework: Framework
}): string {
  const breakpoint = activeBreakpoint(width, framework.breakpoints)
  const current = framework.breakpoints.find((b) => b.name === breakpoint)
  const next = framework.breakpoints.find((b) => b.min > (current?.min ?? 0))
  const first = framework.breakpoints[0]?.min ?? 640

  const lines = [
    `/* ${width} x ${height} CSS px, DPR ${pixelRatio} */`,
    current
      ? `@media (min-width: ${current.min}px)${next ? ` and (max-width: ${next.min - 1}px)` : ""} {`
      : `@media (max-width: ${first - 1}px) {`,
    `  /* ${framework.label}: ${current ? `${breakpoint}:` : "no prefix"} */`,
    "}"
  ]

  if (pixelRatio > 1) {
    lines.push(
      "",
      `@media (min-resolution: ${pixelRatio}dppx) {`,
      "  /* high-density assets */",
      "}"
    )
  }

  return lines.join("\n")
}

/** The whole snapshot as JSON, for copy and download. */
export function metricsToJson(metrics: ScreenMetrics): string {
  const ratio = describeAspectRatio(metrics.screenWidth, metrics.screenHeight)
  const deviceWidth = toDevicePixels(metrics.screenWidth, metrics.pixelRatio)
  const deviceHeight = toDevicePixels(metrics.screenHeight, metrics.pixelRatio)

  return JSON.stringify(
    {
      screen: {
        css: `${metrics.screenWidth}x${metrics.screenHeight}`,
        device: `${deviceWidth}x${deviceHeight}`,
        available: `${metrics.availWidth}x${metrics.availHeight}`,
        aspectRatio: ratio.label,
        // Device pixels, matching the panel. These disagreed until now: the
        // panel counted device pixels and the export counted CSS pixels, so a
        // Retina Mac reported 8.3 MP on screen and 2.1 MP in the file.
        megapixels: megapixels(deviceWidth, deviceHeight)
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
