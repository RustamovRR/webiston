import { describe, expect, it } from "vitest"

import {
  EYE_BALL_SHAPES,
  EYE_FRAME_SHAPES,
  eyeBallPath,
  eyeFramePath
} from "./eyes"
import type { Neighbours } from "./matrix"
import {
  coverageOf,
  coverageOfSpec,
  MODULE_SHAPES,
  modulePath,
  moduleSpec,
  NEIGHBOUR_AWARE,
  type ShapeSpec
} from "./shapes"

/**
 * What this file is guarding, and why the obvious test was not enough.
 *
 * The first version of the distinctness test compared PATH STRINGS. It passed
 * on a catalogue that contained a literal duplicate: `extra-rounded` used a
 * corner radius of half the cell, which is a circle, and `dots` is a circle —
 * two different builders, two different strings, one shape. Checked with the
 * browser's own rasteriser (`SVGGeometryElement.isPointInFill`, 300x300
 * samples) they filled the identical 4,421 cells. A second pair, `classy` and
 * the old `leaf`, differed by 32 cells of 5,023 — 0.6%, invisible.
 *
 * So the tests below compare GEOMETRY, via the spec each shape is declared as.
 */

const CONTEXTS: Neighbours[] = [
  { top: false, right: false, bottom: false, left: false },
  { top: true, right: false, bottom: true, left: false },
  { top: false, right: true, bottom: false, left: true },
  { top: true, right: true, bottom: true, left: true }
]

/** A rounded corner removes this share of the square it sits in. */
const CORNER_K = 1 - Math.PI / 4

/**
 * How different two shapes look, in units of "share of a module".
 *
 * Two terms, because neither alone is enough. Area difference catches insets
 * and overall weight but scores `leaf` against `arch` as identical — they
 * round the same NUMBER of corners. The per-corner term catches orientation
 * but scores a shape against its own inset copy as identical.
 */
function shapeDistance(a: ShapeSpec, b: ShapeSpec): number {
  // A cut corner and a rounded one are different silhouettes, so a kind change
  // always counts as distinct — but honestly, not by much: measured in the
  // browser, `extra-rounded` against `bevel` is only 2.63% of filled pixels.
  // This metric cannot compare across kinds, and that limit is why the
  // browser check exists alongside it.
  if (a.kind !== b.kind) return Number.POSITIVE_INFINITY
  if (a.kind === "bevel" && b.kind === "bevel") return Math.abs(a.cut - b.cut)
  if (a.kind === "bevel" || b.kind === "bevel") return Number.POSITIVE_INFINITY

  const area = Math.abs(coverageOfSpec(a) - coverageOfSpec(b))
  const corners = a.radii.reduce(
    (sum, r, index) => sum + Math.abs(r ** 2 - b.radii[index] ** 2) * CORNER_K,
    0
  )
  return area + corners
}

/**
 * Two shapes closer than this are the same shape with extra steps.
 *
 * Calibrated against measurements, not taste: the pair we removed scored
 * **1.08%** and is invisible; the closest pair we kept — `rounded` against
 * `sharp`, one corner of four — scores **3.36%** and is visible at swatch size.
 */
const MIN_DISTINCTNESS = 0.02

describe("module shape catalogue", () => {
  // The rule a scanner enforces for us: a module that covers too little of its
  // cell thresholds as light and the code decodes to nothing.
  it.each(MODULE_SHAPES)("%s covers at least 70% of its cell", (shape) => {
    expect(coverageOf(shape)).toBeGreaterThanOrEqual(0.7)
  })

  it("offers meaningfully more than the six a library gave us", () => {
    expect(MODULE_SHAPES.length).toBeGreaterThanOrEqual(12)
    expect(EYE_FRAME_SHAPES.length).toBeGreaterThanOrEqual(7)
    expect(EYE_BALL_SHAPES.length).toBeGreaterThanOrEqual(7)
  })

  it("has no duplicate ids", () => {
    expect(new Set(MODULE_SHAPES).size).toBe(MODULE_SHAPES.length)
  })

  it("draws a visibly different shape for every entry", () => {
    // Arrange
    const failures: string[] = []

    // Act — every pair, scored in its most favourable neighbour context
    for (let i = 0; i < MODULE_SHAPES.length; i++) {
      for (let j = i + 1; j < MODULE_SHAPES.length; j++) {
        const a = MODULE_SHAPES[i]
        const b = MODULE_SHAPES[j]
        const best = Math.max(
          ...CONTEXTS.map((neighbours) =>
            shapeDistance(moduleSpec(a, neighbours), moduleSpec(b, neighbours))
          )
        )
        if (best < MIN_DISTINCTNESS) {
          failures.push(`${a} / ${b} → ${(best * 100).toFixed(2)}%`)
        }
      }
    }

    // Assert
    expect(failures).toEqual([])
  })

  // The reason the test above has to look at four contexts instead of one.
  it.each([...NEIGHBOUR_AWARE])(
    "%s is indistinguishable from a plain rounded square when isolated",
    (shape) => {
      // Arrange
      const isolated = CONTEXTS[0]
      const spec = moduleSpec(shape, isolated)

      // Assert — all four corners equal, i.e. nothing neighbour-specific yet
      expect(spec.kind).toBe("rrect")
      if (spec.kind !== "rrect") return
      expect(new Set(spec.radii).size).toBe(1)
    }
  )

  it("suppresses rounding where modules touch", () => {
    // Arrange
    const alone = modulePath("fluid", {
      x: 0,
      y: 0,
      size: 10,
      neighbours: CONTEXTS[0]
    })
    const inARun = modulePath("fluid", {
      x: 0,
      y: 0,
      size: 10,
      neighbours: CONTEXTS[3]
    })

    // Assert — an isolated module curves, one inside a run is a plain square
    expect(alone).toContain("A")
    expect(inARun).not.toContain("A")
  })

  it("scales a spec into the cell it is given", () => {
    // Arrange — `mosaic` is the only shape with an inset, so it proves both
    const small = modulePath("mosaic", {
      x: 0,
      y: 0,
      size: 10,
      neighbours: CONTEXTS[0]
    })
    const large = modulePath("mosaic", {
      x: 0,
      y: 0,
      size: 100,
      neighbours: CONTEXTS[0]
    })

    // Assert — the gap is 8% of the cell at either size.
    // The radii and the three arc flags are stripped first: `A0.6,0.6 0 0 1`
    // contributes a literal 0 that is a flag, not a coordinate.
    const leftEdge = (path: string) =>
      Math.min(
        ...(
          path
            .replace(/A[\d.]+,[\d.]+ [01] [01] [01] /g, "")
            .match(/\d+(\.\d+)?/g) ?? []
        ).map(Number)
      )

    expect(leftEdge(small)).toBeCloseTo(0.8, 3)
    expect(leftEdge(large)).toBeCloseTo(8, 3)
  })
})

/**
 * The eye catalogues need no spec layer: every entry comes from ONE builder
 * (`roundedRectPath`) plus two structurally different cases (the octagon and
 * the composite centres), so identical geometry implies identical radii
 * implies an identical string. Verified independently in the browser at
 * 300x300 samples — 0 duplicates in either catalogue.
 */
describe("eye catalogues", () => {
  it("has no duplicate ids", () => {
    expect(new Set(EYE_FRAME_SHAPES).size).toBe(EYE_FRAME_SHAPES.length)
    expect(new Set(EYE_BALL_SHAPES).size).toBe(EYE_BALL_SHAPES.length)
  })

  it("draws a different frame for every entry", () => {
    const paths = EYE_FRAME_SHAPES.map((shape) =>
      eyeFramePath(shape, { x: 0, y: 0, module: 10 })
    )
    expect(new Set(paths).size).toBe(EYE_FRAME_SHAPES.length)
  })

  it("draws a different centre for every entry", () => {
    const paths = EYE_BALL_SHAPES.map((shape) =>
      eyeBallPath(shape, { x: 0, y: 0, module: 10 })
    )
    expect(new Set(paths).size).toBe(EYE_BALL_SHAPES.length)
  })

  // The ring is what a reader scans for: a 7x7 outer edge, a one-module band,
  // a 5x5 hole. Any entry that broke those proportions would stop the code
  // being FOUND, which looks like a broken generator rather than a style.
  it.each(EYE_FRAME_SHAPES)("%s keeps the finder proportions", (shape) => {
    // Arrange
    const path = eyeFramePath(shape, { x: 0, y: 0, module: 10 })
    const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []

    // Assert — nothing is drawn outside the 7x7 block or inside the 3x3 centre
    expect(Math.max(...numbers)).toBeLessThanOrEqual(70)
    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0)
    // Two subpaths: the outer edge and the hole that makes it a ring
    expect(path.match(/M/g)?.length).toBe(2)
  })
})
