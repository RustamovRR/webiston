import { describe, expect, it } from "vitest"

import { generatePalette, generateTailwindShades } from "./color-palettes"

/**
 * The shade scale is the tool's most-copied output — it goes straight into
 * someone's `@theme` block — so "it looked fine for teal" is not evidence. The
 * ramp shipped non-monotonic: the absolute floors (`600 = max(l - 15, 35)`)
 * lifted a dark base's later steps ABOVE it, so the scale went light → dark →
 * light → dark and nobody noticed because the default colour hid it.
 */

const lightnessOf = (hsl: string) => Number(hsl.match(/(\d+)%\)/)?.[1] ?? -1)

/** Bases chosen to hit every branch: dark, mid, grey, near-white, near-black. */
const BASES = ["#0d5a6b", "#3b82f6", "#808080", "#f5f5dc", "#111111", "#ef4444"]

describe("generateTailwindShades", () => {
  it("only ever gets darker, at any base lightness", () => {
    for (const base of BASES) {
      // Arrange + Act
      const ramp = generateTailwindShades(base).map((step) =>
        lightnessOf(step.hsl)
      )

      // Assert — strictly decreasing, not merely non-increasing
      for (let i = 1; i < ramp.length; i++) {
        expect(
          ramp[i],
          `${base}: step ${i} (${ramp[i]}%) is not darker than ${ramp[i - 1]}%`
        ).toBeLessThan(ramp[i - 1])
      }
    }
  })

  it("gives eleven distinct colours", () => {
    for (const base of BASES) {
      // Arrange + Act
      const hexes = generateTailwindShades(base).map((step) => step.hex)

      // Assert — a near-white base used to collapse 100 and 200 onto 96%
      expect(new Set(hexes).size, `${base} produced a duplicate step`).toBe(11)
    }
  })

  it("puts the visitor's colour at 500", () => {
    // Arrange + Act
    const ramp = generateTailwindShades("#3b82f6")

    // Assert — the panel's caption promises this
    const base = ramp.find((step) => step.shade === 500)
    expect(base?.hex).toBe("#3b82f6")
  })

  it("keeps a grey scale grey", () => {
    // Arrange + Act
    const ramp = generateTailwindShades("#808080")

    // Assert — absolute saturation floors used to tint a pure grey red
    for (const { hex } of ramp) {
      const [r, g, b] = [1, 3, 5].map((offset) =>
        Number.parseInt(hex.slice(offset, offset + 2), 16)
      )
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(1)
    }
  })

  it("documents the one case that cannot be strict: pure white and black", () => {
    // Arrange + Act — there is no step lighter than white
    const white = generateTailwindShades("#ffffff").map((step) => step.hex)

    // Assert — the steps above the anchor tie at #ffffff instead of wrapping
    // around into a colour. Known and deliberate; re-anchoring the base at the
    // nearest step (the uicolors model) is the fix if this ever matters.
    expect(white[0]).toBe("#ffffff")
    expect(white[white.length - 1]).not.toBe("#ffffff")
  })
})

describe("generatePalette", () => {
  it("no longer returns the shade scale under another name", () => {
    // Arrange + Act
    const scheme = generatePalette("#0d5a6b", "monochromatic")
    const ramp = generateTailwindShades("#0d5a6b").map((step) => step.hex)

    // Assert — these were byte-identical, so the page rendered two full-width
    // cards of the same eleven colours on its default setting
    expect(scheme).not.toEqual(ramp)
    expect(scheme.length).toBeLessThan(ramp.length)
  })

  it("returns distinct colours for every scheme", () => {
    for (const type of [
      "monochromatic",
      "analogous",
      "complementary"
    ] as const) {
      // Arrange + Act — an achromatic base makes hue rotation a no-op
      const scheme = generatePalette("#808080", type)

      // Assert
      expect(new Set(scheme).size, `${type} repeated a colour`).toBe(
        scheme.length
      )
      expect(scheme.length).toBeGreaterThan(0)
    }
  })

  it("keeps a monochromatic scheme on one hue", () => {
    // Arrange + Act
    const scheme = generatePalette("#3b82f6", "monochromatic")

    // Assert — every entry is the same hue family, just lighter or darker
    for (const hex of scheme) {
      const [r, g, b] = [1, 3, 5].map((offset) =>
        Number.parseInt(hex.slice(offset, offset + 2), 16)
      )
      expect(b, `${hex} is not blue-dominant`).toBeGreaterThanOrEqual(r)
    }
  })
})
