import { describe, expect, it } from "vitest"
import {
  hexToRgb,
  hslToRgb,
  isValidHex,
  rgbToHex,
  rgbToHsl
} from "./color-conversions"

/**
 * First tests in `src/`. These functions were chosen because they are pure and
 * shipped: the Color Converter tool, the palette generator and the gradient
 * generator all sit on top of them.
 *
 * Writing them surfaced a live defect — see the `rgbToHex` block.
 */

describe("hexToRgb", () => {
  it("expands 3-digit shorthand the same way CSS does", () => {
    // Arrange / Act
    const short = hexToRgb("#abc")
    const long = hexToRgb("#aabbcc")
    // Assert
    expect(short).toEqual({ r: 170, g: 187, b: 204 })
    expect(short).toEqual(long)
  })

  it("accepts a missing '#'", () => {
    expect(hexToRgb("fff")).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 })
  })

  it("is case-insensitive", () => {
    expect(hexToRgb("#AABBCC")).toEqual(hexToRgb("#aabbcc"))
  })

  it("returns null rather than a wrong colour for malformed input", () => {
    // A 4- or 8-digit hex carries alpha, which this function does not model —
    // null is correct, silently dropping the alpha would not be.
    expect(hexToRgb("#abcd")).toBeNull()
    expect(hexToRgb("zzz")).toBeNull()
    expect(hexToRgb("#GG0000")).toBeNull()
    expect(hexToRgb("")).toBeNull()
  })
})

describe("rgbToHex", () => {
  it("pads single-digit channels to two hex digits", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000")
    expect(rgbToHex(1, 2, 3)).toBe("#010203")
  })

  it("round-trips with hexToRgb", () => {
    for (const hex of ["#000000", "#ffffff", "#ff0000", "#1a2b3c"]) {
      const rgb = hexToRgb(hex)
      expect(rgb).not.toBeNull()
      expect(rgbToHex(rgb!.r, rgb!.g, rgb!.b)).toBe(hex)
    }
  })

  // REGRESSION — this was a live bug, not a hypothetical.
  //
  // `parseColorInput` does not clamp channels, so `rgb(300, 0, 0)` typed into
  // the Color Converter reached rgbToHex and rendered "#12C0000": seven hex
  // digits, invalid CSS, shown to the user as the answer.
  it("always returns a valid 6-digit hex, whatever the input", () => {
    const cases: Array<[number, number, number]> = [
      [300, 0, 0], // above range
      [-1, 0, 0], // below range
      [255.5, 0, 0], // fractional
      [Number.NaN, 0, 0] // not a number at all
    ]
    for (const [r, g, b] of cases) {
      const hex = rgbToHex(r, g, b)
      expect(hex, `rgbToHex(${r}, ${g}, ${b})`).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it("clamps out-of-range channels to the nearest valid byte", () => {
    expect(rgbToHex(300, 0, 0)).toBe("#ff0000")
    expect(rgbToHex(-1, 0, 0)).toBe("#000000")
    expect(rgbToHex(255.5, 0, 0)).toBe("#ff0000")
  })
})

describe("rgbToHsl", () => {
  it("reports the primaries at the expected hues", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 })
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 })
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 })
  })

  it("treats greys as achromatic — hue and saturation both zero", () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 })
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 })
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 })
  })
})

describe("hslToRgb", () => {
  it("inverts rgbToHsl for the primaries", () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
    expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })
    expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
  })

  it("returns a grey when saturation is zero, whatever the hue", () => {
    expect(hslToRgb(0, 0, 50)).toEqual(hslToRgb(200, 0, 50))
  })

  it("round-trips hue through rgbToHsl within rounding error", () => {
    for (const hue of [0, 60, 120, 180, 240, 300]) {
      const { r, g, b } = hslToRgb(hue, 100, 50)
      expect(rgbToHsl(r, g, b).h, `hue ${hue}`).toBe(hue)
    }
  })
})

describe("isValidHex", () => {
  it("accepts 3- and 6-digit hex with a leading '#'", () => {
    expect(isValidHex("#fff")).toBe(true)
    expect(isValidHex("#FFFFFF")).toBe(true)
  })

  it("requires the '#' — note hexToRgb does not", () => {
    // Documenting a real asymmetry between the two helpers, so a future change
    // to either one breaks this test instead of surprising a caller.
    expect(isValidHex("fff")).toBe(false)
    expect(hexToRgb("fff")).not.toBeNull()
  })

  it("rejects alpha and malformed values", () => {
    expect(isValidHex("#abcd")).toBe(false)
    expect(isValidHex("#12345")).toBe(false)
    expect(isValidHex("#gggggg")).toBe(false)
  })
})
