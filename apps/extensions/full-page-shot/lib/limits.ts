/**
 * What the renderer will actually give back, and why the numbers are these.
 *
 * Every "full page" screenshot tool eventually meets the same two ceilings,
 * and the difference between a good one and a broken one is whether it knows
 * about them BEFORE it hands the user a blank image.
 *
 * EVERY LIMIT HERE IS IN DEVICE PIXELS. That sentence is the whole file.
 * `Page.captureScreenshot` returns an image at the tab's device pixel ratio —
 * measured on a real DPR-2 browser, a clip of 1512x8000 CSS came back as a
 * 3024x16000 PNG with `clip.scale` left at 1. An earlier version of this file
 * compared CSS pixels against these ceilings, so on any Retina display it was
 * wrong by exactly 2x: a 35,977px page reported "not clamped" and then
 * stitched its tiles into a canvas half the size they were drawn at.
 */

/**
 * One `Page.captureScreenshot` call has a ceiling, and past it the call does
 * not error — it returns a truncated or empty image, which is the worst
 * possible failure. MEASURED on this renderer: at 48,000 device pixels tall
 * the bottom band still held 162 distinct colours; at 71,954 it held ONE,
 * i.e. blank.
 *
 * 30,000 is deliberately well inside that: it is also exactly what the
 * extension has been asking for on a Retina display since it shipped
 * (15,000 CSS x DPR 2), so it is the one value with real-hardware evidence
 * behind it rather than a measurement taken under software rendering.
 */
export const MAX_TILE_DEVICE_PX = 30_000

/**
 * The stitched result is a canvas, and a canvas has its own two limits: no
 * side may exceed 65,535px, and the total AREA is capped (Chromium allows
 * roughly 268M pixels before `convertToBlob` starts returning null).
 *
 * So the real ceiling depends on how wide the page is — a 600px-wide phone
 * layout can go far taller than a 2,560px desktop one — and on the device
 * pixel ratio, which doubles both dimensions on a Retina screen.
 */
export const MAX_CANVAS_SIDE = 65_535
export const MAX_CANVAS_AREA = 268_435_456

/**
 * The tallest page, in CSS pixels, that can come back as one image.
 *
 * `deviceScale` is the device pixel ratio times any extra `clip.scale` — i.e.
 * how many image pixels one CSS pixel becomes.
 */
export function maxCaptureHeight(cssWidth: number, deviceScale = 1): number {
  const deviceWidth = Math.max(1, Math.round(cssWidth * deviceScale))
  const deviceCeiling = Math.min(
    MAX_CANVAS_SIDE,
    Math.floor(MAX_CANVAS_AREA / deviceWidth)
  )
  return Math.floor(deviceCeiling / Math.max(deviceScale, Number.EPSILON))
}

export interface Tile {
  /** CSS-pixel offset of the first row this tile CONTRIBUTES. */
  y: number
  /** CSS pixels this tile contributes. */
  height: number
  /**
   * Extra CSS pixels captured ABOVE `y` and then thrown away.
   *
   * `position: sticky` and `position: fixed` boxes are painted at the CLIP'S
   * ORIGIN, not the document's — so every tile after the first gets the site
   * header, and any stuck sidebar, stamped across whatever real content
   * happens to be at its top edge. Measured on webiston.uz: the header sat on
   * top of footnotes 1 and 2 at the seam.
   *
   * Leading in by a full viewport puts the stamp in a band that is discarded,
   * because nothing can stick further down than one viewport from where the
   * scrollport starts.
   */
  lead: number
}

/**
 * Split a page into capture slices.
 *
 * A page shorter than one tile returns exactly ONE tile — the common case
 * takes the single-shot path and never touches a canvas, which is both faster
 * and immune to every stitching artefact.
 *
 * The last tile is short rather than overlapping: `captureBeyondViewport`
 * renders from a real layout, so slices line up exactly and an overlap would
 * only add a seam to blend.
 */
export function planTiles(
  totalHeight: number,
  maxClip: number,
  lead = 0
): Tile[] {
  const height = Math.max(0, Math.floor(totalHeight))
  const clip = Math.max(1, Math.floor(maxClip))
  const leadPx = Math.max(0, Math.floor(lead))
  if (height === 0) return []

  const tiles: Tile[] = []
  let y = 0
  while (y < height) {
    // The first tile has nothing above it to lead in from.
    const own = y === 0 ? 0 : Math.min(leadPx, y)
    // `clip` is the whole request — the discarded lead-in counts against it.
    const take = Math.max(1, Math.min(clip - own, height - y))
    tiles.push({ y, height: take, lead: own })
    y += take
  }
  return tiles
}

/** What the page asked for vs. what can actually be produced. */
export interface CaptureBudget {
  /** CSS pixels. */
  width: number
  /** CSS pixels that will be captured — clamped when the page is taller. */
  height: number
  /** The page's real CSS height, so the UI can say what it left out. */
  requestedHeight: number
  clamped: boolean
  /** CSS offsets and heights; the renderer applies `deviceScale` itself. */
  tiles: Tile[]
  /** Image pixels per CSS pixel — the device pixel ratio times `clip.scale`. */
  deviceScale: number
  /** What the finished file will actually measure. */
  deviceWidth: number
  deviceHeight: number
}

/**
 * A clip that starts at y=0 AND reaches the end of the document comes back
 * with its LAST VIEWPORT painted from the TOP of the page.
 *
 * Reported by the owner on a 9,079px article: after the closing paragraph the
 * site header, both sidebars and the title appeared again. Reproduced and
 * narrowed by capturing the same band four ways:
 *
 *   clip 0..H          -> broken        clip 0..H-1        -> broken
 *   no clip at all     -> broken        clip y=1..H        -> broken
 *   clip y=6000..H     -> CORRECT       clip y=H-900, 900  -> CORRECT
 *
 * So the trigger is the origin, not the height: a clip that begins below the
 * fold renders the document end correctly. Splitting the final viewport into
 * its own capture is the whole fix, and it costs one extra small clip.
 */
export function planCapture(
  cssWidth: number,
  cssHeight: number,
  deviceScale = 1,
  viewportHeight = 0
): CaptureBudget {
  const ceiling = maxCaptureHeight(cssWidth, deviceScale)
  const usable = Math.min(Math.floor(cssHeight), ceiling)
  const width = Math.floor(cssWidth)
  // The tile ceiling is a DEVICE-pixel budget, so a Retina display gets half
  // as many CSS pixels per call — the whole point of this file.
  const view = Math.max(0, Math.floor(viewportHeight))
  const tiles = planTiles(usable, MAX_TILE_DEVICE_PX / deviceScale, view)

  // Only a SINGLE tile can start at 0 and reach the end; every multi-tile
  // plan already ends with a tile whose origin is below the fold.
  //
  // FOUR viewports, not one, and the number is doing two jobs. The head must
  // stop short of the last viewport — splitting at exactly `usable - view`
  // still produced the stamp, because that point IS the maximum scroll — so
  // the tail takes the last TWO. And the tail must lead in by a viewport from
  // an origin that is itself below the fold, which needs the head to be at
  // least two viewports long. Under 4 viewports there is no split that
  // satisfies both, and the single shot measured clean on 2.0- and
  // 6.4-viewport pages carrying a sticky header AND a sticky sidebar — the
  // fault is not height, it is what this particular app does when the
  // renderer asks for the whole document at once.
  const reachesEnd = usable >= Math.floor(cssHeight)
  if (tiles.length === 1 && reachesEnd && view > 0 && usable > 4 * view) {
    const split = usable - 2 * view
    tiles.splice(
      0,
      1,
      { y: 0, height: split, lead: 0 },
      { y: split, height: usable - split, lead: view }
    )
  }

  return {
    width,
    height: usable,
    requestedHeight: Math.floor(cssHeight),
    clamped: usable < Math.floor(cssHeight),
    tiles,
    deviceScale,
    deviceWidth: Math.round(width * deviceScale),
    deviceHeight: Math.round(usable * deviceScale)
  }
}
