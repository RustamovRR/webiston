import { describe, expect, it } from "vitest"

import {
  labToLch,
  oklabToOklch,
  oklabToRgb,
  oklchToOklab,
  rgbToOklab
} from "./color-spaces"

/**
 * The reference values are Björn Ottosson's own published sRGB primaries, the
 * same numbers every other implementation is checked against. They exist here
 * because the previous implementation described itself as a "simplified
 * approximation" and was in fact a different space entirely — it reported the
 * site's brand teal as `oklch(0.29 0.19 216)` against a true
 * `oklch(0.404 0.055 218)`, a 3.5× error in chroma with no test to catch it.
 */

describe("rgbToOklab", () => {
  it("matches the published sRGB primaries", () => {
    // Arrange + Act
    const red = rgbToOklab(255, 0, 0)
    const green = rgbToOklab(0, 255, 0)
    const blue = rgbToOklab(0, 0, 255)

    // Assert
    expect(red.l).toBeCloseTo(0.628, 2)
    expect(red.a).toBeCloseTo(0.225, 2)
    expect(red.b).toBeCloseTo(0.126, 2)

    expect(green.l).toBeCloseTo(0.866, 2)
    expect(green.a).toBeCloseTo(-0.234, 2)
    expect(green.b).toBeCloseTo(0.179, 2)

    expect(blue.l).toBeCloseTo(0.452, 2)
    expect(blue.a).toBeCloseTo(-0.032, 2)
    expect(blue.b).toBeCloseTo(-0.312, 2)
  })

  it("puts white at L=1 and black at L=0, both with no chroma", () => {
    // Arrange + Act
    const white = rgbToOklab(255, 255, 255)
    const black = rgbToOklab(0, 0, 0)

    // Assert
    expect(white.l).toBeCloseTo(1, 2)
    expect(white.a).toBeCloseTo(0, 2)
    expect(white.b).toBeCloseTo(0, 2)
    expect(black.l).toBeCloseTo(0, 2)
  })

  it("names the brand teal the way tokens.css does", () => {
    // Arrange — #0d5a6b, the colour the tool opens on. The expected value was
    // computed by hand from the matrices above: oklch(0.433 0.073 217).
    // Act
    const oklab = rgbToOklab(13, 90, 107)
    const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)

    // Assert — the old code answered oklch(0.29 0.19 216) here
    expect(oklch.l).toBeCloseTo(0.433, 3)
    expect(oklch.c).toBeCloseTo(0.073, 3)
    expect(oklch.h).toBe(217)
  })
})

describe("oklabToRgb", () => {
  it("inverts rgbToOklab across the gamut", () => {
    // Arrange
    const samples = [
      [13, 90, 107],
      [255, 0, 0],
      [34, 197, 94],
      [0, 0, 0],
      [255, 255, 255],
      [128, 128, 128]
    ] as const

    for (const [r, g, b] of samples) {
      // Act
      const oklab = rgbToOklab(r, g, b)
      const back = oklabToRgb(oklab.l, oklab.a, oklab.b)

      // Assert — three decimals of storage costs at most a channel of drift
      expect(Math.abs(back.r - r)).toBeLessThanOrEqual(2)
      expect(Math.abs(back.g - g)).toBeLessThanOrEqual(2)
      expect(Math.abs(back.b - b)).toBeLessThanOrEqual(2)
    }
  })
})

describe("oklchToOklab", () => {
  it("round-trips with oklabToOklch on the same scale", () => {
    // Arrange — the mismatched `/ 100` used to shrink chroma a hundredfold
    const oklab = rgbToOklab(13, 90, 107)

    // Act
    const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)
    const back = oklchToOklab(oklch.l, oklch.c, oklch.h)

    // Assert
    expect(back.a).toBeCloseTo(oklab.a, 2)
    expect(back.b).toBeCloseTo(oklab.b, 2)
  })
})

describe("neutral hues", () => {
  it("reports no hue for a grey instead of 0° red", () => {
    // Arrange + Act
    const oklab = rgbToOklab(128, 128, 128)
    const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)

    // Assert
    // Full precision leaves a rounding crumb; what matters is that nothing
    // survives to three decimals, and that the hue is not reported as red.
    expect(oklch.c).toBeLessThan(0.0005)
    expect(oklch.h).toBe(0)
    expect(labToLch(50, 0, 0).h).toBe(0)
  })
})
