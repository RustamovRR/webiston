import { describe, expect, it } from "vitest"

import { isValidColor, parseColorInput } from "./color-parser"

/**
 * The parser is the tool's front door: everything downstream — formats,
 * palette, shades, contrast — is derived from what comes out of here, and a
 * rejected input is a blank screen. The modern-syntax cases are the ones that
 * used to fail, and they are exactly what Chrome devtools, Figma and Tailwind
 * v4 put on the clipboard.
 */

describe("parseColorInput — hex", () => {
  it("reads every hex length", () => {
    // Arrange + Act + Assert
    expect(parseColorInput("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColorInput("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColorInput("#ff000080")?.a).toBeCloseTo(0.502, 2)
    expect(parseColorInput("#f008")?.a).toBeCloseTo(0.533, 2)
  })

  it("rejects lengths that are not a colour", () => {
    // Arrange + Act + Assert
    expect(parseColorInput("#ff00")).not.toBeNull() // 4-digit is legal
    expect(parseColorInput("#ff000")).toBeNull()
    expect(parseColorInput("#zzz")).toBeNull()
    expect(parseColorInput("")).toBeNull()
  })
})

describe("parseColorInput — modern CSS Color 4 syntax", () => {
  it("reads space-separated rgb, the form devtools copies", () => {
    // Arrange + Act + Assert
    expect(parseColorInput("rgb(255 0 0)")).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1
    })
  })

  it("reads the slash alpha in both number and percentage form", () => {
    // Arrange + Act
    const half = parseColorInput("rgb(255 0 0 / 50%)")
    const point5 = parseColorInput("rgb(255 0 0 / 0.5)")

    // Assert
    expect(half?.a).toBeCloseTo(0.5, 3)
    expect(point5?.a).toBeCloseTo(0.5, 3)
  })

  it("reads percentage channels", () => {
    // Arrange + Act + Assert
    expect(parseColorInput("rgb(100% 0% 0%)")).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1
    })
  })

  it("reads a hue written with its unit", () => {
    // Arrange + Act
    const withUnit = parseColorInput("hsl(200deg 50% 40%)")
    const without = parseColorInput("hsl(200, 50%, 40%)")

    // Assert
    expect(withUnit).toEqual(without)
  })

  it("reads oklch, the format tokens.css is written in", () => {
    // Arrange + Act
    const parsed = parseColorInput("oklch(0.433 0.074 217)")

    // Assert — back to the brand teal it came from
    expect(parsed?.r).toBeCloseTo(13, -1)
    expect(parsed?.g).toBeCloseTo(90, -1)
    expect(parsed?.b).toBeCloseTo(107, -1)
  })

  it("keeps the legacy comma forms working", () => {
    // Arrange + Act + Assert
    expect(parseColorInput("rgba(1, 2, 3, 0.25)")).toEqual({
      r: 1,
      g: 2,
      b: 3,
      a: 0.25
    })
    expect(parseColorInput("hsla(0, 0%, 0%, 1)")).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1
    })
  })
})

describe("parseColorInput — guards", () => {
  it("clamps out-of-range channels instead of passing them on", () => {
    // Arrange + Act
    const parsed = parseColorInput("rgb(300, -20, 0)")

    // Assert — unclamped, this produced a seven-digit hex downstream
    expect(parsed).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it("understands transparent and named colours", () => {
    // Arrange + Act + Assert
    expect(parseColorInput("transparent")).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    expect(parseColorInput("Teal")).toEqual({ r: 0, g: 128, b: 128, a: 1 })
  })

  it("does not treat an unknown function as a colour", () => {
    // Arrange + Act + Assert
    expect(parseColorInput("hwb(200 30% 40%)")).toBeNull()
    expect(parseColorInput("rgb(1 2)")).toBeNull()
    expect(isValidColor("not a colour")).toBe(false)
  })
})
