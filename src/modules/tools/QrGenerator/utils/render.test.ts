import { describe, expect, it } from "vitest"
import { DEFAULT_STYLE } from "../constants"
import { EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "./eyes"
import { buildMatrix } from "./matrix"
import { buildQrModel, modelToSvg, STANDARD_QUIET_ZONE } from "./render"
import { coverageOf, MODULE_SHAPES, modulePath } from "./shapes"

const style = { ...DEFAULT_STYLE }

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

  // Distinctness has to be measured ACROSS neighbour configurations, not in
  // one: `fluid`, `vertical`, `horizontal` and `extra-rounded` are identical
  // for an isolated module by design — the whole point of a neighbour-aware
  // shape is that it only differs where modules touch.
  it("every shape is distinguishable from every other somewhere", () => {
    // Arrange
    const contexts = [
      { top: false, right: false, bottom: false, left: false },
      { top: true, right: false, bottom: true, left: false },
      { top: false, right: true, bottom: false, left: true },
      { top: true, right: true, bottom: true, left: true }
    ]

    // Act — a shape's signature is its path in every context
    const signatures = MODULE_SHAPES.map((shape) =>
      contexts
        .map((neighbours) =>
          modulePath(shape, { x: 0, y: 0, size: 10, neighbours })
        )
        .join("|")
    )

    // Assert
    expect(new Set(signatures).size).toBe(MODULE_SHAPES.length)
  })
})

describe("quiet zone", () => {
  it("reserves the standard four modules by default", () => {
    // Arrange
    const model = buildQrModel({
      matrix: buildMatrix("webiston.uz", "M"),
      style,
      extent: 320,
      quietZone: STANDARD_QUIET_ZONE
    })

    // Act — where does the first painted module start?
    const firstCoordinate = Number(
      /M([\d.]+),/.exec(model.dataPath)?.[1] ?? "0"
    )

    // Assert
    expect(model.moduleSize * STANDARD_QUIET_ZONE).toBeCloseTo(
      320 * (4 / (model.moduleCount + 8)),
      5
    )
    expect(firstCoordinate).toBeGreaterThanOrEqual(
      model.moduleSize * STANDARD_QUIET_ZONE
    )
  })

  it("scales the margin with the QR version, not with pixels", () => {
    // Arrange — a long payload forces a larger matrix
    const small = buildQrModel({
      matrix: buildMatrix("hi", "M"),
      style,
      extent: 320,
      quietZone: 4
    })
    const large = buildQrModel({
      matrix: buildMatrix("x".repeat(400), "M"),
      style,
      extent: 320,
      quietZone: 4
    })

    // Assert — same four modules, different pixel margins
    expect(large.moduleCount).toBeGreaterThan(small.moduleCount)
    expect(small.moduleSize * 4).toBeGreaterThan(large.moduleSize * 4)
  })
})

describe("neighbour-aware shapes", () => {
  it("rounds fewer corners when modules touch", () => {
    // Arrange
    const alone = modulePath("fluid", {
      x: 0,
      y: 0,
      size: 10,
      neighbours: { top: false, right: false, bottom: false, left: false }
    })
    const inARun = modulePath("fluid", {
      x: 0,
      y: 0,
      size: 10,
      neighbours: { top: true, right: true, bottom: true, left: true }
    })

    // Assert — an isolated module curves, one inside a run is a plain square
    expect(alone).toContain("A")
    expect(inARun).not.toContain("A")
  })
})

describe("the matrix is what the encoder says", () => {
  it("marks the three finder blocks and no fourth", () => {
    // Arrange
    const matrix = buildMatrix("webiston.uz", "M")
    const last = matrix.size - 1

    // Assert
    expect(matrix.isFinder(0, 0)).toBe(true)
    expect(matrix.isFinder(0, last)).toBe(true)
    expect(matrix.isFinder(last, 0)).toBe(true)
    expect(matrix.isFinder(last, last)).toBe(false)
  })
})

describe("export", () => {
  it("serialises a self-contained SVG", () => {
    // Arrange
    const model = buildQrModel({
      matrix: buildMatrix("webiston.uz", "M"),
      style,
      extent: 320,
      quietZone: 4
    })

    // Act
    const svg = modelToSvg(model)

    // Assert
    expect(svg.startsWith("<svg xmlns=")).toBe(true)
    expect(svg.endsWith("</svg>")).toBe(true)
    expect(svg).toContain('viewBox="0 0 320 320"')
    expect(svg).not.toContain("undefined")
  })
})
