import { describe, expect, it } from "vitest"
import { DEFAULT_STYLE } from "../constants"
import { buildMatrix } from "./matrix"
import { buildQrModel, modelToSvg, STANDARD_QUIET_ZONE } from "./render"

const style = { ...DEFAULT_STYLE }

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

describe("logo footprint", () => {
  // The logo is drawn on top; anything still painted under it is data the
  // error correction was never told it would lose.
  it.each([
    [1, 0.1],
    [1, 0.3],
    [4, 0.22],
    [4, 0.3],
    [8, 0.22],
    [8, 0.3]
  ])(
    "drops every module under the logo (quiet zone %i, logo %f)",
    (quietZone, logoSize) => {
      // Arrange
      const model = buildQrModel({
        matrix: buildMatrix("hi", "H"),
        style: {
          ...style,
          logo: "data:image/png;base64,AA",
          logoSize,
          quietZone
        },
        extent: 320,
        quietZone
      })
      const logo = model.logo
      expect(logo).toBeDefined()
      if (!logo) return

      // Act — where every painted module starts
      const starts = [
        ...model.dataPath.matchAll(/M(-?[\d.]+),(-?[\d.]+)/g)
      ].map((match) => [Number(match[1]), Number(match[2])] as const)

      // Assert
      const under = starts.filter(
        ([x, y]) =>
          x >= logo.x &&
          x <= logo.x + logo.size &&
          y >= logo.y &&
          y <= logo.y + logo.size
      )
      expect(under).toHaveLength(0)
    }
  )

  it("hides nothing when there is no logo", () => {
    const withLogo = buildQrModel({
      matrix: buildMatrix("webiston.uz", "H"),
      style: { ...style, logo: "data:image/png;base64,AA" },
      extent: 320,
      quietZone: 4
    })
    const without = buildQrModel({
      matrix: buildMatrix("webiston.uz", "H"),
      style,
      extent: 320,
      quietZone: 4
    })

    expect(without.dataPath.length).toBeGreaterThan(withLogo.dataPath.length)
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
