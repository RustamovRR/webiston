/**
 * What the renderer will actually give back, and why the numbers are these.
 *
 * Every "full page" screenshot tool eventually meets the same two ceilings,
 * and the difference between a good one and a broken one is whether it knows
 * about them BEFORE it hands the user a blank image.
 */

/**
 * One `Page.captureScreenshot` call is a GPU texture, and Chromium's maximum
 * texture dimension is 16,384px on the overwhelming majority of hardware. Ask
 * for more and the call does not error — it returns a truncated or empty
 * image, which is the worst possible failure. 15,000 leaves headroom for the
 * device pixel ratio without getting close to the edge.
 */
export const MAX_TILE_PX = 15_000

/**
 * The stitched result is a canvas, and a canvas has its own two limits: no
 * side may exceed 65,535px, and the total AREA is capped (Chromium allows
 * roughly 268M pixels before `convertToBlob` starts returning null).
 *
 * So the real ceiling depends on how wide the page is — a 600px-wide phone
 * layout can go far taller than a 2,560px desktop one. Deriving it beats
 * picking a round number that is wrong at both ends.
 */
export const MAX_CANVAS_SIDE = 65_535
export const MAX_CANVAS_AREA = 268_435_456

export function maxCaptureHeight(width: number, scale = 1): number {
  const pixels = Math.max(1, Math.round(width * scale))
  return Math.min(MAX_CANVAS_SIDE, Math.floor(MAX_CANVAS_AREA / pixels))
}

export interface Tile {
  /** CSS-pixel offset from the top of the document. */
  y: number
  height: number
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
export function planTiles(totalHeight: number, maxTile = MAX_TILE_PX): Tile[] {
  const height = Math.max(0, Math.floor(totalHeight))
  if (height === 0) return []
  if (height <= maxTile) return [{ y: 0, height }]

  const tiles: Tile[] = []
  for (let y = 0; y < height; y += maxTile) {
    tiles.push({ y, height: Math.min(maxTile, height - y) })
  }
  return tiles
}

/** What the page asked for vs. what can actually be produced. */
export interface CaptureBudget {
  width: number
  /** Height that will be captured — clamped when the page is taller. */
  height: number
  /** The page's real height, so the UI can say what it left out. */
  requestedHeight: number
  clamped: boolean
  tiles: Tile[]
}

export function planCapture(
  width: number,
  height: number,
  scale = 1
): CaptureBudget {
  const ceiling = maxCaptureHeight(width, scale)
  const usable = Math.min(Math.floor(height), ceiling)
  return {
    width: Math.floor(width),
    height: usable,
    requestedHeight: Math.floor(height),
    clamped: usable < Math.floor(height),
    tiles: planTiles(usable)
  }
}
