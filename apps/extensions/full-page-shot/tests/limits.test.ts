import { describe, expect, it } from "vitest"

import {
  MAX_CANVAS_AREA,
  MAX_CANVAS_SIDE,
  MAX_TILE_DEVICE_PX,
  maxCaptureHeight,
  planCapture,
  planTiles
} from "../lib/limits"

/**
 * The ceilings are invisible until they are hit, and when they are hit the
 * renderer does not error — it returns a truncated or blank image. Every case
 * here is a page shape that would otherwise produce one silently.
 *
 * The units are the whole point: these are DEVICE-pixel ceilings, and a page
 * is measured in CSS pixels. Getting that conversion wrong is not a rounding
 * error, it is a factor of two on every Retina machine.
 */

describe("planTiles", () => {
  it("takes the single-shot path for an ordinary page", () => {
    // Arrange / Act / Assert — no canvas, no stitching, no seams.
    expect(planTiles(4000, MAX_TILE_DEVICE_PX)).toEqual([
      { y: 0, height: 4000, lead: 0 }
    ])
    expect(planTiles(MAX_TILE_DEVICE_PX, MAX_TILE_DEVICE_PX)).toHaveLength(1)
  })

  it("splits a page past one capture, with no gap and no overlap", () => {
    // Arrange
    const budget = MAX_TILE_DEVICE_PX
    const height = budget * 2 + 1234

    // Act
    const tiles = planTiles(height, budget)

    // Assert — the slices must tile the page exactly.
    expect(tiles).toHaveLength(3)
    expect(tiles[0].y).toBe(0)
    for (let i = 1; i < tiles.length; i++) {
      expect(tiles[i].y).toBe(tiles[i - 1].y + tiles[i - 1].height)
    }
    const covered = tiles.reduce((sum, tile) => sum + tile.height, 0)
    expect(covered).toBe(height)
  })

  it("returns nothing for a page with no height", () => {
    // Arrange / Act / Assert — the caller turns this into a clear error
    // rather than sending a zero-sized clip to the renderer.
    expect(planTiles(0, MAX_TILE_DEVICE_PX)).toEqual([])
    expect(planTiles(-10, MAX_TILE_DEVICE_PX)).toEqual([])
  })
})

describe("maxCaptureHeight", () => {
  it("is bounded by the canvas SIDE at every realistic page width", () => {
    // Arrange / Act / Assert — this is the case that actually occurs. An
    // earlier version of this test claimed the AREA limit binds at 2560px; it
    // does not, and the assertion failing is what corrected the model.
    for (const width of [375, 768, 1440, 2560, 3840]) {
      expect(maxCaptureHeight(width), String(width)).toBe(MAX_CANVAS_SIDE)
    }
  })

  it("is bounded by the canvas AREA once a row exceeds 4,096 pixels", () => {
    // Arrange — the crossover: above this the area cap bites first.
    const width = 8000

    // Act
    const capped = maxCaptureHeight(width)

    // Assert
    expect(capped).toBe(Math.floor(MAX_CANVAS_AREA / width))
    expect(capped).toBeLessThan(MAX_CANVAS_SIDE)
    expect(capped * width).toBeLessThanOrEqual(MAX_CANVAS_AREA)
  })

  it("halves the CSS ceiling on a Retina display", () => {
    // Arrange / Act / Assert — the bug this file was rewritten for. At DPR 2
    // a 32,768px page is already 65,536 image pixels, one past the canvas
    // side limit; the old model said 65,535 CSS px were fine at any ratio and
    // stitched the result into a canvas half the size of its own tiles.
    expect(maxCaptureHeight(1512, 2)).toBe(Math.floor(MAX_CANVAS_SIDE / 2))
    expect(maxCaptureHeight(1512, 1)).toBe(MAX_CANVAS_SIDE)
  })

  it("applies the AREA cap to the DEVICE row, not the CSS row", () => {
    // Arrange / Act / Assert — 1440 CSS at DPR 2 is a 2,880px row, still
    // under the 4,096 crossover, so the side limit governs and only the ratio
    // divides it. 2560 at 4x is 10,240 and the area cap bites.
    expect(maxCaptureHeight(1440, 2)).toBe(Math.floor(MAX_CANVAS_SIDE / 2))
    expect(maxCaptureHeight(2560, 4)).toBeLessThan(maxCaptureHeight(2560, 1))
  })
})

describe("planCapture", () => {
  it("leaves an ordinary page untouched", () => {
    // Arrange / Act
    const budget = planCapture(1440, 8000)

    // Assert
    expect(budget.clamped).toBe(false)
    expect(budget.height).toBe(8000)
    expect(budget.tiles).toHaveLength(1)
  })

  it("reports what the FILE will measure, not what the page measured", () => {
    // Arrange / Act — the viewer prints these, and printed the CSS numbers
    // until now: a 3024x6806 screenshot was labelled "1512x3403".
    const budget = planCapture(1512, 3403, 2)

    // Assert
    expect(budget.width).toBe(1512)
    expect(budget.deviceWidth).toBe(3024)
    expect(budget.deviceHeight).toBe(6806)
  })

  it("halves the CSS tile height on a Retina display", () => {
    // Arrange — 9,000 CSS px is one capture at DPR 1 and two at DPR 2,
    // because the ceiling that matters is 30,000 DEVICE pixels.
    const tall = MAX_TILE_DEVICE_PX / 2 + 1000

    // Act / Assert
    expect(planCapture(1512, tall, 1).tiles).toHaveLength(1)
    expect(planCapture(1512, tall, 2).tiles.length).toBeGreaterThan(1)
  })

  it("splits the tail off when one clip would reach the document end", () => {
    // Arrange — MEASURED on webiston.uz: a clip that starts at 0 AND reaches
    // the end comes back with its last viewport painted from the TOP of the
    // page. Starting the clip below the fold does not. So the tail gets its
    // own capture.
    const budget = planCapture(1512, 9079, 1, 813)

    // Assert — the tail takes the last TWO viewports: splitting at exactly
    // `height - viewport` puts the seam on the maximum scroll offset, which
    // measured just as broken.
    expect(budget.tiles).toHaveLength(2)
    expect(budget.tiles[1].y).toBe(9079 - 2 * 813)
    expect(budget.tiles[0].y + budget.tiles[0].height).toBe(budget.tiles[1].y)
  })

  it("leaves a page under four viewports on the single-shot path", () => {
    // Arrange / Act / Assert — there is no split that both stops short of the
    // last viewport AND leaves the tail an origin below the fold. Measured
    // clean at 2.0 and 6.4 viewports with a sticky header and sidebar.
    expect(planCapture(1512, 2400, 1, 813).tiles).toHaveLength(1)
  })

  it("leads every tile after the first in by a viewport, and discards it", () => {
    // Arrange / Act — sticky and fixed boxes are painted at the CLIP's origin,
    // so without this the site header lands on top of whatever real content
    // sits at each seam. Nothing can stick more than one viewport down.
    const budget = planCapture(1512, 9079, 1, 813)

    // Assert
    expect(budget.tiles[0].lead).toBe(0)
    expect(budget.tiles[1].lead).toBe(813)
    // …and that origin is itself a viewport below the fold.
    expect(budget.tiles[1].y - budget.tiles[1].lead).toBeGreaterThanOrEqual(813)
  })

  it("keeps a page that fits in one viewport on the single-shot path", () => {
    // Arrange / Act / Assert — no canvas, no seam, nothing to discard.
    const budget = planCapture(1512, 700, 1, 813)
    expect(budget.tiles).toEqual([{ y: 0, height: 700, lead: 0 }])
  })

  it("never leads in past the top of the document", () => {
    // Arrange / Act — a tile 100px down cannot lead in by a whole viewport.
    const tiles = planTiles(2000, 900, 800)

    // Assert
    for (const tile of tiles) expect(tile.lead).toBeLessThanOrEqual(tile.y)
  })

  it("clamps an impossible page and SAYS it clamped", () => {
    // Arrange — the whole point: the UI can only warn if this flag is honest.
    const width = 8000
    const absurd = maxCaptureHeight(width) + 10_000

    // Act
    const budget = planCapture(width, absurd)

    // Assert
    expect(budget.clamped).toBe(true)
    expect(budget.requestedHeight).toBe(absurd)
    expect(budget.height).toBe(maxCaptureHeight(width))
    expect(budget.tiles.at(-1)?.y).toBeLessThan(budget.height)
  })

  it("never plans a tile that reaches past what it captures", () => {
    // Arrange / Act / Assert — a clip beyond the layout returns blank pixels.
    for (const scale of [1, 2, 3]) {
      for (const height of [1, 999, MAX_TILE_DEVICE_PX + 1, 120_000]) {
        const budget = planCapture(1280, height, scale, 800)
        const end = budget.tiles.reduce((sum, tile) => sum + tile.height, 0)
        expect(end, `${scale}x ${height}`).toBe(budget.height)
      }
    }
  })
})
