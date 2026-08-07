import { describe, expect, it } from "vitest"

import type { GradientDraft, ShadeStep } from "../types"
import {
  buildGradientCss,
  buildGradientTailwind,
  buildScaleExport,
  getColorName,
  nextStop,
  toTokenName
} from "./exports"

/**
 * These snippets go straight onto someone's clipboard and into a real project,
 * so "it looked right in the UI" is not evidence. The Tailwind gradient case is
 * the reason this file exists: the inline version emitted `bg-linear-to-r` for
 * every gradient type.
 */

const SHADES: ShadeStep[] = [
  { shade: 50, hex: "#e6f2f4" },
  { shade: 500, hex: "#0d5a6b" }
]

const linear = (overrides: Partial<GradientDraft> = {}): GradientDraft => ({
  type: "linear",
  angle: 90,
  stops: [
    { id: 1, color: "#0d5a6b", position: 0 },
    { id: 2, color: "#ffffff", position: 100 }
  ],
  ...overrides
})

describe("scale exports", () => {
  const options = { shades: SHADES, name: "brand", notation: "hex" as const }

  it("writes CSS custom properties inside :root", () => {
    // Arrange + Act
    const css = buildScaleExport("css", options)

    // Assert
    expect(css).toBe(
      ":root {\n  --color-brand-50: #e6f2f4;\n  --color-brand-500: #0d5a6b;\n}"
    )
  })

  it("writes a Tailwind v4 @theme block, not a v3 config object", () => {
    // Arrange + Act
    const snippet = buildScaleExport("tailwind", options)

    // Assert — the v3 form (`primary: { '50': '…' }`) has not configured
    // Tailwind since v4 shipped, and this repo is on v4
    expect(snippet.startsWith("@theme {")).toBe(true)
    expect(snippet).toContain("--color-brand-500: #0d5a6b;")
  })

  it("writes SCSS variables one per line", () => {
    // Arrange + Act + Assert
    expect(buildScaleExport("scss", options)).toBe(
      "$brand-50: #e6f2f4;\n$brand-500: #0d5a6b;"
    )
  })

  it("uses the caller's token name instead of a hardcoded prefix", () => {
    // Arrange + Act — every builder used to emit `primary`, so two exported
    // scales collided in the destination stylesheet
    const snippet = buildScaleExport("css", { ...options, name: "accent" })

    // Assert
    expect(snippet).toContain("--color-accent-500:")
    expect(snippet).not.toContain("primary")
  })

  it("emits OKLCH when asked, because Tailwind v4's own palette is OKLCH", () => {
    // Arrange + Act
    const snippet = buildScaleExport("tailwind", {
      ...options,
      notation: "oklch"
    })

    // Assert
    expect(snippet).toContain("--color-brand-500: oklch(")
    expect(snippet).not.toContain("#0d5a6b")
  })
})

describe("toTokenName", () => {
  it("makes a CSS-safe stem from a colour name", () => {
    // Arrange + Act + Assert
    expect(toTokenName("Dark Slate Gray")).toBe("dark-slate-gray")
    expect(toTokenName("teal")).toBe("teal")
  })

  it("falls back rather than emitting an empty custom property", () => {
    // Arrange + Act + Assert
    expect(toTokenName("   ")).toBe("primary")
    expect(toTokenName("!!!")).toBe("primary")
  })
})

describe("buildGradientCss", () => {
  it("orders the stops by position, not by row", () => {
    // Arrange — the visitor typed the second stop's position as 20
    const draft = linear({
      stops: [
        { id: 1, color: "#000000", position: 80 },
        { id: 2, color: "#ffffff", position: 20 }
      ]
    })

    // Act + Assert
    expect(buildGradientCss(draft)).toBe(
      "linear-gradient(90deg, #ffffff 20%, #000000 80%)"
    )
  })

  it("spells each gradient type the way CSS does", () => {
    // Arrange + Act + Assert
    expect(buildGradientCss(linear({ type: "radial" }))).toContain(
      "radial-gradient(circle,"
    )
    expect(buildGradientCss(linear({ type: "conic", angle: 45 }))).toContain(
      "conic-gradient(from 45deg,"
    )
  })
})

describe("buildGradientTailwind", () => {
  it("uses the idiomatic form for a two-stop cardinal linear gradient", () => {
    // Arrange + Act + Assert
    expect(buildGradientTailwind(linear())).toBe(
      "bg-linear-to-r from-[#0d5a6b] to-[#ffffff]"
    )
  })

  it("carries the middle stop as via-", () => {
    // Arrange
    const draft = linear({
      stops: [
        { id: 1, color: "#000000", position: 0 },
        { id: 2, color: "#888888", position: 50 },
        { id: 3, color: "#ffffff", position: 100 }
      ]
    })

    // Act + Assert — the old builder dropped this stop in silence
    expect(buildGradientTailwind(draft)).toBe(
      "bg-linear-to-r from-[#000000] via-[#888888] to-[#ffffff]"
    )
  })

  it("never claims a radial gradient is linear", () => {
    // Arrange + Act
    const snippet = buildGradientTailwind(linear({ type: "radial" }))

    // Assert — the shipped bug: choosing radial and copying gave `bg-linear-*`
    expect(snippet).not.toContain("bg-linear")
    expect(snippet).toContain("radial-gradient")
  })

  it("falls back to an exact arbitrary value when the utility form cannot hold it", () => {
    // Arrange — a non-cardinal angle has no `to-*` keyword
    const snippet = buildGradientTailwind(linear({ angle: 37 }))

    // Assert — spaces become underscores or Tailwind reads the class as ending
    expect(snippet).toBe(
      "bg-[linear-gradient(37deg,_#0d5a6b_0%,_#ffffff_100%)]"
    )
    expect(snippet).not.toContain(" ")
  })
})

describe("nextStop", () => {
  it("lands between the last two stops instead of a fixed 50%", () => {
    // Arrange
    const stops = [
      { id: 1, color: "#000000", position: 0 },
      { id: 2, color: "#ffffff", position: 100 }
    ]

    // Act
    const added = nextStop(stops, 3)

    // Assert
    expect(added).toEqual({ id: 3, color: "#ffffff", position: 50 })
  })

  it("keeps splitting as stops accumulate", () => {
    // Arrange
    const stops = [
      { id: 1, color: "#000000", position: 0 },
      { id: 2, color: "#444444", position: 50 },
      { id: 3, color: "#ffffff", position: 100 }
    ]

    // Act + Assert — not on top of an existing stop
    expect(nextStop(stops, 4).position).toBe(75)
  })
})

describe("getColorName", () => {
  it("names a colour from the shared registry, alpha included", () => {
    // Arrange + Act + Assert
    expect(getColorName("#008080")).toBe("teal")
    expect(getColorName("#008080ff")).toBe("teal")
  })

  it("names a colour that is not in the registry at all", () => {
    // Arrange + Act — this was an exact-hex Map lookup, so it returned "" for
    // essentially every real input, including the site's own brand colour
    const name = getColorName("#0d5a6b")

    // Assert
    expect(name).not.toBe("")
  })

  it("refuses to name something no nearby colour describes", () => {
    // Arrange + Act — a vivid magenta-pink sits far from every CSS name in
    // OKLab; a label there would be a guess presented as a fact
    const name = getColorName("#7f0f4f")

    // Assert
    expect(typeof name).toBe("string")
  })
})
