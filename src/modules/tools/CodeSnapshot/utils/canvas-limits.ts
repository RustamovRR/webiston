import type { ExportScale } from "../constants"
import { EXPORT_SCALES, PROBE_INK } from "../constants"

/**
 * How big a canvas this browser will actually give us.
 *
 * There is a hard per-side cap and it is silent: over it, `getContext` still
 * returns a context, `fillRect` still returns, and only the pixels are missing
 * — so `toBlob` hands back a blank or `null` and the visitor downloads a broken
 * PNG with no error anywhere. Measured in Chrome on this machine: **65,518**.
 * Firefox caps at 32,767 and iOS Safari far lower.
 *
 * That is not a theoretical limit. At the defaults (14px, line-height 1.6 →
 * 22px a line) a 1,000-line paste is 22,208 CSS px tall, which is 44,416 at
 * the default 2x — already past Firefox — and 66,624 at 3x, past Chrome.
 * People paste files.
 */

/**
 * The real caps, largest first. A ladder, not a binary search: every engine's
 * limit is one of these, so five allocations of a 1px-wide canvas settle it
 * and there is nothing to tune.
 */
const KNOWN_LIMITS = [65535, 32767, 16384, 8192, 4096] as const

/** Conservative answer for the server, where there is no canvas to ask. */
const SSR_FALLBACK = 8192

let cached: number | null = null

function canAllocate(side: number): boolean {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = side
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  // Draw at the far edge and read it back: allocation failures do not throw,
  // so the only reliable probe is whether ink survives.
  ctx.fillStyle = PROBE_INK
  ctx.fillRect(0, side - 1, 1, 1)
  try {
    return ctx.getImageData(0, side - 1, 1, 1).data[3] === 255
  } catch {
    return false
  }
}

/** Probed once per session; the answer cannot change under us. */
export function maxCanvasSide(): number {
  if (cached !== null) return cached
  if (typeof document === "undefined") return SSR_FALLBACK

  cached = KNOWN_LIMITS.find(canAllocate) ?? SSR_FALLBACK
  return cached
}

/**
 * The largest offered scale whose output this browser can actually hold.
 *
 * Returns `null` when even 1x does not fit — around 3,000 lines at the
 * defaults. That is a real state and the UI has to say so, because the
 * alternative is a download button that produces nothing.
 */
export function fittingScale(
  width: number,
  height: number,
  wanted: ExportScale,
  limit: number = maxCanvasSide()
): ExportScale | null {
  const longest = Math.max(width, height)
  if (longest <= 0) return wanted

  const fits = (scale: number) => Math.ceil(longest * scale) <= limit
  if (fits(wanted)) return wanted

  // Step down through the offered scales rather than computing a fractional
  // one: the UI only has 1x, 2x and 3x, and an export labelled "2x" has to be
  // exactly twice the size.
  const smaller = [...EXPORT_SCALES]
    .filter((scale) => scale < wanted)
    .sort((a, b) => b - a)

  return smaller.find(fits) ?? null
}

/** Reset between tests; the probe is a module-level cache. */
export function __resetCanvasLimitCache() {
  cached = null
}
