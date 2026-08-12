import { describe, expect, it } from "vitest"

import { fittingScale } from "./canvas-limits"

/**
 * The limit is passed in rather than probed, so these are arithmetic rather
 * than a description of whichever engine happens to run the suite.
 */
const CHROME = 65535
const FIREFOX = 32767

describe("fittingScale", () => {
  it("keeps the chosen scale when the output fits", () => {
    // Arrange / Act / Assert — a 40-line snippet at 3x is nowhere near.
    expect(fittingScale(1200, 1100, 3, CHROME)).toBe(3)
  })

  /**
   * The failure this prevents: over the cap the canvas is silently unusable —
   * no throw, no error event, `toBlob` returns null — and the visitor
   * downloads nothing while the button appears to work.
   */
  it("steps down when the chosen scale would exceed the cap", () => {
    // Arrange — 1,000 lines at the defaults is 22,208 CSS px tall.
    const height = 22208

    // Act / Assert — 3x is 66,624 (over Chrome), 2x is 44,416 (fits Chrome,
    // not Firefox), 1x fits both.
    expect(fittingScale(1344, height, 3, CHROME)).toBe(2)
    expect(fittingScale(1344, height, 3, FIREFOX)).toBe(1)
    expect(fittingScale(1344, height, 2, FIREFOX)).toBe(1)
  })

  it("returns null when even 1x cannot fit", () => {
    // Arrange / Act / Assert — roughly 3,000 lines. There is no scale that
    // works, and the UI has to say so rather than offer a dead button.
    expect(fittingScale(1344, 70000, 1, CHROME)).toBeNull()
    expect(fittingScale(1344, 70000, 3, CHROME)).toBeNull()
  })

  it("measures the LONGEST side, not the height", () => {
    // Arrange — a single enormously long line: wide, short.
    // Act / Assert — clamping on height alone would call this fine at 3x.
    expect(fittingScale(30000, 200, 3, CHROME)).toBe(2)
    expect(fittingScale(30000, 200, 2, CHROME)).toBe(2)
  })

  it("never rounds a fractional scale into existence", () => {
    // Arrange / Act — only 1, 2 and 3 are offered, so a 2.4 that would fit is
    // not an answer: an export labelled 2x has to be exactly twice the size.
    const result = fittingScale(1000, 27000, 3, CHROME)

    // Assert
    expect(result).toBe(2)
    expect(Number.isInteger(result)).toBe(true)
  })

  it("does not divide by zero on an empty document", () => {
    // Arrange / Act / Assert
    expect(fittingScale(0, 0, 2, CHROME)).toBe(2)
  })
})
