import { describe, expect, it } from "vitest"

import {
  compositeOver,
  contrastRatio,
  gradeContrast,
  relativeLuminance
} from "./color-contrast"

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }

describe("contrastRatio", () => {
  it("anchors at the two ends WCAG defines", () => {
    // Arrange + Act + Assert
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 1)
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5)
  })

  it("is symmetric — order of the pair cannot change the verdict", () => {
    // Arrange
    const teal = { r: 13, g: 90, b: 107 }

    // Act + Assert
    expect(contrastRatio(teal, WHITE)).toBeCloseTo(
      contrastRatio(WHITE, teal),
      6
    )
  })

  it("puts the brand teal above AA on white", () => {
    // Arrange + Act
    const ratio = contrastRatio({ r: 13, g: 90, b: 107 }, WHITE)

    // Assert
    expect(ratio).toBeGreaterThan(4.5)
  })
})

describe("relativeLuminance", () => {
  it("orders the primaries the way the human eye does", () => {
    // Arrange + Act
    const red = relativeLuminance({ r: 255, g: 0, b: 0 })
    const green = relativeLuminance({ r: 0, g: 255, b: 0 })
    const blue = relativeLuminance({ r: 0, g: 0, b: 255 })

    // Assert — green carries ~72% of perceived luminance, blue ~7%
    expect(green).toBeGreaterThan(red)
    expect(red).toBeGreaterThan(blue)
    expect(green).toBeCloseTo(0.7152, 3)
  })
})

describe("compositeOver", () => {
  it("resolves a translucent colour against its backdrop", () => {
    // Arrange
    const halfBlack = { r: 0, g: 0, b: 0, a: 0.5 }

    // Act
    const onWhite = compositeOver(halfBlack, WHITE)

    // Assert — 50% black on white is mid grey, not black
    expect(onWhite).toEqual({ r: 128, g: 128, b: 128 })
  })

  it("makes a fully transparent colour take the backdrop exactly", () => {
    // Arrange + Act
    const invisible = compositeOver({ ...BLACK, a: 0 }, WHITE)

    // Assert — reporting 21:1 for something nobody can see is the bug this
    // prevents
    expect(invisible).toEqual(WHITE)
    expect(contrastRatio(invisible, WHITE)).toBeCloseTo(1, 5)
  })
})

describe("gradeContrast", () => {
  it("draws the WCAG lines at the published thresholds", () => {
    // Arrange + Act
    const justUnderAa = gradeContrast(4.49)
    const exactlyAa = gradeContrast(4.5)
    const aaa = gradeContrast(7)

    // Assert
    expect(justUnderAa.aa).toBe(false)
    expect(justUnderAa.aaLarge).toBe(true)
    expect(exactlyAa.aa).toBe(true)
    expect(exactlyAa.aaa).toBe(false)
    expect(aaa.aaa).toBe(true)
  })
})
