import { describe, expect, it } from "vitest"

import {
  CLIPPING_DBFS,
  dbfsToPercent,
  describeMediaFailure,
  fileExtensionFor,
  levelInDbfs,
  peakInDbfs,
  SILENCE_DBFS,
  timestampedFilename
} from "./media"

/**
 * The classifier and the level maths, which are the two parts of the media
 * plumbing that can be wrong without anybody noticing.
 *
 * A misclassified error shows the wrong advice, and wrong advice on a
 * permission dialog is worse than none — it sends the visitor into browser
 * settings to fix a camera that simply is not plugged in. A wrong level reading
 * moves when you speak, so it looks right while meaning nothing, which is
 * exactly what the implementation this replaces shipped.
 */

/** A DOMException carries only its `name` as far as this code is concerned. */
function rejection(name: string): Error {
  const error = new Error(name)
  error.name = name
  return error
}

/** `length` samples of a sine at `amplitude` (0–1), as the analyser hands it. */
function sine(amplitude: number, length = 2048): Uint8Array {
  const buffer = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    const value = Math.sin((i / length) * Math.PI * 2 * 8) * amplitude
    buffer[i] = Math.round(128 + value * 127)
  }
  return buffer
}

describe("describeMediaFailure", () => {
  it("separates a refused permission from a missing device", () => {
    // Arrange + Act + Assert — the distinction the old single error message
    // erased, and the one that decides whether the advice mentions browser
    // settings or a cable.
    expect(describeMediaFailure(rejection("NotAllowedError"))).toBe("denied")
    expect(describeMediaFailure(rejection("NotFoundError"))).toBe("notFound")
  })

  it("reads the pre-spec error names browsers still throw", () => {
    // Arrange + Act + Assert
    expect(describeMediaFailure(rejection("PermissionDeniedError"))).toBe(
      "denied"
    )
    expect(describeMediaFailure(rejection("DevicesNotFoundError"))).toBe(
      "notFound"
    )
    expect(describeMediaFailure(rejection("TrackStartError"))).toBe("inUse")
  })

  it("calls a device another app is holding busy, not denied", () => {
    // Arrange + Act + Assert — telling somebody to change a permission they
    // already granted is the most confusing thing this page could do.
    expect(describeMediaFailure(rejection("NotReadableError"))).toBe("inUse")
  })

  it("falls back to unknown rather than guessing", () => {
    // Arrange + Act + Assert
    expect(describeMediaFailure(rejection("WeirdError"))).toBe("unknown")
    expect(describeMediaFailure(null)).toBe("unknown")
    expect(describeMediaFailure("a string")).toBe("unknown")
  })
})

describe("levelInDbfs", () => {
  it("reports silence at the floor rather than negative infinity", () => {
    // Arrange — a buffer of the centre value is what a muted input produces.
    const silent = new Uint8Array(2048).fill(128)

    // Act + Assert — a meter has to have a bottom to draw.
    expect(levelInDbfs(silent)).toBe(SILENCE_DBFS)
  })

  it("puts a full-scale sine just under 0 dBFS", () => {
    // Arrange + Act — a sine's RMS is its peak over root two, so full scale
    // reads about -3 dBFS. That is the number a hardware meter shows too.
    const level = levelInDbfs(sine(1))

    // Assert
    expect(level).toBeGreaterThan(-4)
    expect(level).toBeLessThan(-2)
  })

  it("drops by about 6 dB when the amplitude halves", () => {
    // Arrange + Act — the property that makes this a real measurement rather
    // than a number that merely moves: halving a signal is -6.02 dB, always.
    const loud = levelInDbfs(sine(0.8))
    const quiet = levelInDbfs(sine(0.4))

    // Assert
    expect(loud - quiet).toBeGreaterThan(5.5)
    expect(loud - quiet).toBeLessThan(6.5)
  })

  it("reads peak above average, and near clipping at full scale", () => {
    // Arrange
    const buffer = sine(1)

    // Act
    const peak = peakInDbfs(buffer)
    const rms = levelInDbfs(buffer)

    // Assert — the gap between them is what a clipping indicator watches.
    expect(peak).toBeGreaterThan(rms)
    expect(peak).toBeGreaterThan(CLIPPING_DBFS)
  })

  it("handles an empty buffer instead of returning NaN", () => {
    // Arrange + Act + Assert — the analyser hands one back before the first
    // frame, and NaN would render as "NaN dBFS".
    expect(levelInDbfs(new Uint8Array(0))).toBe(SILENCE_DBFS)
    expect(peakInDbfs(new Uint8Array(0))).toBe(SILENCE_DBFS)
  })
})

describe("dbfsToPercent", () => {
  it("maps the floor to empty and full scale to full", () => {
    // Arrange + Act + Assert
    expect(dbfsToPercent(SILENCE_DBFS)).toBe(0)
    expect(dbfsToPercent(0)).toBe(100)
  })

  it("clamps values outside the drawable range", () => {
    // Arrange + Act + Assert — a meter that renders past 100% overflows its
    // track, and one that renders negative width disappears.
    expect(dbfsToPercent(-200)).toBe(0)
    expect(dbfsToPercent(12)).toBe(100)
    expect(dbfsToPercent(Number.NaN)).toBe(0)
  })
})

describe("filenames", () => {
  it("strips the colons that ISO time puts in a filename", () => {
    // Arrange
    const at = new Date("2026-08-07T09:41:07.000Z")

    // Act
    const name = timestampedFilename("audio", "webm", at)

    // Assert — colons are illegal on Windows and meaningful on macOS.
    expect(name).toBe("audio-2026-08-07T09-41-07.webm")
  })

  it("matches the extension to the recorded container", () => {
    // Arrange + Act + Assert
    expect(fileExtensionFor("audio/webm;codecs=opus")).toBe("webm")
    expect(fileExtensionFor("video/mp4;codecs=avc1.42E01E")).toBe("mp4")
    expect(fileExtensionFor("audio/ogg;codecs=opus")).toBe("ogg")
    // A browser that reports no type still has to produce a downloadable name.
    expect(fileExtensionFor(null)).toBe("bin")
  })
})
