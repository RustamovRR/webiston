import { describe, expect, it } from "vitest"

import { LIVE_REFRESH_INTERVAL, RETOKENISE_DELAY } from "../constants"
import { retokeniseDelay } from "./schedule"

/**
 * The schedule for the documents too big to re-highlight inside a frame.
 *
 * Tested here rather than through the tool because the defect it prevents is a
 * property of the CLOCK: keystrokes arriving faster than the debounce, for
 * longer than a person is willing to look at a stale picture. jsdom cannot
 * type that fast and a browser tab in the background clamps every timer to a
 * second, so the arithmetic is the only place the guarantee can be pinned down.
 */

describe("retokeniseDelay", () => {
  it("makes a deliberate choice wait for nothing", () => {
    // Arrange / Act / Assert — a theme or a language is one decision, not a
    // burst. 120ms of debounce on it was measured as part of the gap between a
    // preset landing and the colours catching up.
    expect(retokeniseDelay(false, 0)).toBe(0)
    expect(retokeniseDelay(false, 10_000)).toBe(0)
  })

  it("collapses a burst of keystrokes into one pass", () => {
    // Arrange / Act / Assert — straight after a frame there is nothing overdue,
    // so the full debounce applies.
    expect(retokeniseDelay(true, 0)).toBe(RETOKENISE_DELAY)
  })

  /**
   * The defect, stated as arithmetic.
   *
   * A plain trailing debounce returns the same delay however long the picture
   * has been stale, so a typist who never pauses for `RETOKENISE_DELAY` never
   * sees a repaint at all. With a ceiling the delay decays to zero instead.
   */
  it("shrinks as the picture goes stale, and reaches zero", () => {
    // Arrange
    const halfway = LIVE_REFRESH_INTERVAL - RETOKENISE_DELAY / 2

    // Act / Assert
    expect(retokeniseDelay(true, halfway)).toBe(RETOKENISE_DELAY / 2)
    expect(retokeniseDelay(true, LIVE_REFRESH_INTERVAL)).toBe(0)
  })

  it("never returns a negative delay for a long-overdue frame", () => {
    // Arrange / Act / Assert — `setTimeout` treats a negative delay as 0, so
    // this is about the number being honest rather than about the behaviour.
    expect(retokeniseDelay(true, LIVE_REFRESH_INTERVAL * 10)).toBe(0)
  })

  it("keeps the ceiling above the debounce, or it would do nothing", () => {
    // Arrange / Act / Assert — the two constants are independent knobs and a
    // ceiling below the debounce collapses this into "always fire now",
    // silently discarding the burst-collapsing the debounce exists for.
    expect(LIVE_REFRESH_INTERVAL).toBeGreaterThan(RETOKENISE_DELAY)
  })
})
