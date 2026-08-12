import { describe, expect, it } from "vitest"

import { DEFAULT_THEME, THEME_PALETTES } from "."

/**
 * The generated palette, checked as data.
 *
 * `scripts/theme-palette.mjs` throws when it cannot find a colour, so this is
 * not re-testing the generator — it is guarding the file that is COMMITTED,
 * which is what actually ships. A hand-edit, a bad merge or a half-written file
 * would otherwise reach the browser as swatches that are flat rectangles, and
 * a flat rectangle looks like a design choice rather than a broken build.
 */

/**
 * Every hex form CSS accepts: 3, 4, 6 or 8 digits.
 *
 * All four are really in the bundle and a stricter pattern is simply wrong —
 * Vesper's foreground is `#FFF`, Vitesse Black's background is `#000`, and
 * Andromeeda's comment is `#A0A1A7CC` with an alpha byte. Canvas `fillStyle`
 * and an inline `background-color` both take all of them.
 */
const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const COLOUR_FIELDS = [
  "bg",
  "fg",
  "comment",
  "keyword",
  "identifier",
  "string"
] as const

describe("theme palette", () => {
  it("covers every theme Shiki bundles", () => {
    // Arrange / Act / Assert — 65 is the number the tool's own copy claims in
    // three languages. If Shiki ships more, the copy is now a lie and this is
    // where that gets noticed.
    expect(THEME_PALETTES).toHaveLength(65)
  })

  it("gives every theme a real colour in every slot", () => {
    // Arrange
    const broken: string[] = []

    // Act
    for (const theme of THEME_PALETTES) {
      for (const field of COLOUR_FIELDS) {
        if (!HEX.test(theme[field])) broken.push(`${theme.id}.${field}`)
      }
    }

    // Assert
    expect(broken).toEqual([])
  })

  it("lists each theme once", () => {
    // Arrange / Act
    const ids = THEME_PALETTES.map((theme) => theme.id)

    // Assert — a duplicate would render two radios sharing a value, and
    // clicking either would highlight both.
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("puts the default theme first", () => {
    // Arrange / Act / Assert — the featured order is the whole reason the list
    // is not alphabetical, and the default has to be the one the eye lands on.
    expect(THEME_PALETTES[0].id).toBe(DEFAULT_THEME)
  })

  it("keeps both a dark and a light selection available", () => {
    // Arrange / Act
    const dark = THEME_PALETTES.filter((theme) => theme.isDark)
    const light = THEME_PALETTES.filter((theme) => !theme.isDark)

    // Assert — `isDark` is read straight from the theme's own `type`; an
    // extraction that lost it would silently collapse the list to one mood.
    expect(dark.length).toBeGreaterThan(0)
    expect(light.length).toBeGreaterThan(0)
  })
})
