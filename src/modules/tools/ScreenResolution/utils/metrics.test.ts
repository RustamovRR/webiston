import { describe, expect, it } from "vitest"

import type { ScreenMetrics } from "../types"
import {
  activeBreakpoint,
  describeAspectRatio,
  matchingPresets,
  mediaQuerySnippet,
  megapixels,
  metricsToJson,
  toDevicePixels
} from "./metrics"

describe("activeBreakpoint", () => {
  it("returns the base layer below the first breakpoint", () => {
    // Arrange / Act
    const result = activeBreakpoint(390)
    // Assert
    expect(result).toBe("base")
  })

  it("returns the LAST breakpoint passed, not the first", () => {
    // A 1400px viewport matches sm, md, lg and xl at once; xl decides.
    expect(activeBreakpoint(1400)).toBe("xl")
  })

  it("switches exactly at the boundary, not one pixel late", () => {
    expect(activeBreakpoint(767)).toBe("sm")
    expect(activeBreakpoint(768)).toBe("md")
  })

  it("stays at 2xl above the widest breakpoint", () => {
    expect(activeBreakpoint(3840)).toBe("2xl")
  })
})

describe("describeAspectRatio", () => {
  it("names a standard ratio", () => {
    // Arrange / Act
    const result = describeAspectRatio(1920, 1080)
    // Assert
    expect(result.label).toBe("16:9")
    expect(result.standard).toBe(true)
  })

  it("names a ratio that a gcd reduction would have mangled", () => {
    // 1366/768 reduces to 683:384 — correct and unreadable.
    const result = describeAspectRatio(1366, 768)
    expect(result.label).toBe("16:9")
    expect(result.standard).toBe(true)
  })

  it("keeps 16:10 distinct from 16:9", () => {
    expect(describeAspectRatio(1920, 1200).label).toBe("16:10")
  })

  it("recognises a portrait phone ratio", () => {
    expect(describeAspectRatio(430, 932).label).toBe("9:19.5")
  })

  it("falls back to a decimal when nothing standard is close", () => {
    // 1512x982 = 1.5397:1 — between 3:2 (1.5) and 16:10 (1.6), outside
    // tolerance for both, and its gcd reduction is 756:491.
    const result = describeAspectRatio(1512, 982)
    expect(result.standard).toBe(false)
    expect(result.label).toBe("1.54:1")
  })

  it("reports the exact decimal alongside the name", () => {
    expect(describeAspectRatio(1920, 1080).exact).toBe("1.78:1")
  })

  it("does not divide by zero", () => {
    expect(describeAspectRatio(0, 0).label).toBe("—")
  })
})

describe("matchingPresets", () => {
  it("matches a device in portrait", () => {
    // Arrange / Act
    const result = matchingPresets(430, 932)
    // Assert
    expect(result.map((preset) => preset.name)).toContain("iPhone 15 Pro Max")
  })

  it("matches the same device rotated", () => {
    expect(matchingPresets(932, 430).map((p) => p.name)).toContain(
      "iPhone 15 Pro Max"
    )
  })

  it("tolerates a scrollbar's worth of difference", () => {
    expect(matchingPresets(1913, 1080).map((p) => p.name)).toContain(
      "Desktop (FHD)"
    )
  })

  it("returns nothing for a size no listed device has", () => {
    expect(matchingPresets(1111, 777)).toHaveLength(0)
  })
})

describe("toDevicePixels", () => {
  it("multiplies CSS pixels by the ratio", () => {
    expect(toDevicePixels(430, 3)).toBe(1290)
  })

  it("rounds a fractional ratio", () => {
    // Pixel 8 ships devicePixelRatio 2.625.
    expect(toDevicePixels(412, 2.625)).toBe(1082)
  })
})

describe("megapixels", () => {
  it("reports one decimal place", () => {
    expect(megapixels(1920, 1080)).toBe(2.1)
  })

  it("scales to 4K", () => {
    expect(megapixels(3840, 2160)).toBe(8.3)
  })
})

const BASE_METRICS: ScreenMetrics = {
  screenWidth: 1920,
  screenHeight: 1080,
  availWidth: 1920,
  availHeight: 1050,
  viewportWidth: 1280,
  viewportHeight: 800,
  outerWidth: 1280,
  outerHeight: 900,
  pixelRatio: 2,
  colorDepth: 24,
  orientation: "landscape",
  isFullscreen: false
}

describe("mediaQuerySnippet", () => {
  it("emits a bounded range for the active breakpoint", () => {
    // Arrange / Act — 1280 is xl, and 2xl starts at 1536.
    const result = mediaQuerySnippet(BASE_METRICS)
    // Assert
    expect(result).toContain(
      "@media (min-width: 1280px) and (max-width: 1535px)"
    )
  })

  it("leaves the top breakpoint open-ended", () => {
    const result = mediaQuerySnippet({ ...BASE_METRICS, viewportWidth: 1600 })
    expect(result).toContain("@media (min-width: 1536px) {")
    expect(result).not.toContain("max-width")
  })

  it("uses a max-width query below the first breakpoint", () => {
    const result = mediaQuerySnippet({ ...BASE_METRICS, viewportWidth: 390 })
    expect(result).toContain("@media (max-width: 639px)")
  })

  it("adds a resolution query only on a high-density display", () => {
    expect(mediaQuerySnippet(BASE_METRICS)).toContain("min-resolution: 2dppx")
    expect(mediaQuerySnippet({ ...BASE_METRICS, pixelRatio: 1 })).not.toContain(
      "min-resolution"
    )
  })
})

describe("metricsToJson", () => {
  it("reports CSS and device pixels separately", () => {
    // Arrange / Act
    const parsed = JSON.parse(metricsToJson(BASE_METRICS))
    // Assert
    expect(parsed.screen.css).toBe("1920x1080")
    expect(parsed.screen.device).toBe("3840x2160")
  })

  it("carries the active breakpoint", () => {
    const parsed = JSON.parse(metricsToJson(BASE_METRICS))
    expect(parsed.viewport.breakpoint).toBe("xl")
  })
})
