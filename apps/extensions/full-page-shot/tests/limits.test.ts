import { describe, expect, it } from "vitest"

import {
  MAX_CANVAS_AREA,
  MAX_CANVAS_SIDE,
  MAX_TILE_PX,
  maxCaptureHeight,
  planCapture,
  planTiles
} from "../lib/limits"

/**
 * The ceilings are invisible until they are hit, and when they are hit the
 * renderer does not error — it returns a truncated or blank image. Every case
 * here is a page shape that would otherwise produce one silently.
 */

describe("planTiles", () => {
  it("takes the single-shot path for an ordinary page", () => {
    // Arrange / Act / Assert — no canvas, no stitching, no seams.
    expect(planTiles(4000)).toEqual([{ y: 0, height: 4000 }])
    expect(planTiles(MAX_TILE_PX)).toHaveLength(1)
  })

  it("splits a page past one GPU texture, with no gap and no overlap", () => {
    // Arrange
    const height = MAX_TILE_PX * 2 + 1234

    // Act
    const tiles = planTiles(height)

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
    expect(planTiles(0)).toEqual([])
    expect(planTiles(-10)).toEqual([])
  })
})

describe("maxCaptureHeight", () => {
  it("is bounded by the canvas SIDE at every realistic page width", () => {
    // Arrange / Act / Assert — this is the case that actually occurs. The
    // first version of this test claimed the AREA limit binds at 2560px; it
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

  it("shrinks once the scale pushes a row past that crossover", () => {
    // Arrange / Act / Assert — 1440 at 2x is still only 2,880 pixels a row,
    // so it is unchanged; 2560 at 4x is 10,240 and the area cap applies.
    expect(maxCaptureHeight(1440, 2)).toBe(maxCaptureHeight(1440, 1))
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
    for (const height of [1, 999, MAX_TILE_PX + 1, 120_000]) {
      const budget = planCapture(1280, height)
      const end = budget.tiles.reduce((sum, tile) => sum + tile.height, 0)
      expect(end).toBe(budget.height)
    }
  })
})
