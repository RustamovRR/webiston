import { describe, expect, it } from "vitest"
import { DEFAULT_STYLE } from "../constants"
import type { QrStyle } from "../types"
import { checkScannability } from "./contrast"
import { EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "./eyes"
import { isPresetActive, PRESETS, presetThumbnails } from "./presets"
import { MODULE_SHAPES } from "./shapes"

describe("style presets", () => {
  it("has a unique id per preset", () => {
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length)
  })

  // A preset is a recommendation, so it must never be the thing that breaks a
  // visitor's code. This is the test that keeps a pretty-but-pale palette out.
  it.each(PRESETS)("$id scans without a warning", (preset) => {
    // Act
    const verdict = checkScannability(
      preset.style.foregroundColor,
      preset.style.backgroundColor,
      preset.style.gradientColor
    )

    // Assert
    expect(verdict.risk).toBe("ok")
  })

  it.each(PRESETS)("$id only uses shapes that exist", (preset) => {
    expect(MODULE_SHAPES).toContain(preset.style.dotType)
    expect(EYE_FRAME_SHAPES).toContain(preset.style.cornerSquareType)
    expect(EYE_BALL_SHAPES).toContain(preset.style.cornerDotType)
  })

  it("applies exactly, so the applied preset reports itself as active", () => {
    // Arrange — a visitor with a frame and a caption already set
    const withContent: QrStyle = {
      ...DEFAULT_STYLE,
      frame: "label-bottom",
      frameLabel: "SCAN ME"
    }

    for (const preset of PRESETS) {
      // Act
      const applied: QrStyle = { ...withContent, ...preset.style }

      // Assert — the preset matches, and the visitor's own content survived
      expect(isPresetActive(preset, applied)).toBe(true)
      expect(applied.frame).toBe("label-bottom")
      expect(applied.frameLabel).toBe("SCAN ME")
    }
  })

  it("clears a previous gradient when a flat preset is applied", () => {
    // Arrange
    const gradient = PRESETS.find((p) => p.style.gradientColor)
    const flat = PRESETS.find((p) => !p.style.gradientColor)
    expect(gradient).toBeDefined()
    expect(flat).toBeDefined()

    // Act
    const applied = { ...DEFAULT_STYLE, ...gradient?.style, ...flat?.style }

    // Assert — otherwise a teal gradient survives under "Klassik"
    expect(applied.gradientColor).toBeUndefined()
  })

  it("draws every thumbnail from the shared matrix", () => {
    // Act
    const thumbs = presetThumbnails()

    // Assert
    expect(thumbs).toHaveLength(PRESETS.length)
    for (const { model } of thumbs) {
      expect(model.dataPath.length).toBeGreaterThan(0)
      expect(model.eyeFrames).toHaveLength(3)
      expect(model.eyeBalls).toHaveLength(3)
      expect(model.moduleCount).toBe(21)
    }
  })

  it("gives each gradient its own <defs> id", () => {
    // Two codes on one page must not share an id — SVG ids are document-global
    const ids = presetThumbnails()
      .map((t) => t.model.gradient?.id)
      .filter(Boolean)

    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("scannability", () => {
  it("judges a gradient by its lightest stop", () => {
    // Arrange — a dark first stop hiding a pale second one
    const verdict = checkScannability("#000000", "#ffffff", "#7dd3fc")

    // Assert
    expect(verdict.risk).not.toBe("ok")
  })

  it("separates 'may fail' from 'will fail'", () => {
    expect(checkScannability("#555555", "#ffffff").severe).toBe(false)
    expect(checkScannability("#999999", "#ffffff").severe).toBe(true)
  })
})
