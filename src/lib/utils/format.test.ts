import { describe, expect, it } from "vitest"
import { formatDuration, formatFileSize } from "./format"

describe("formatDuration", () => {
  it("zero-pads both fields so a column of durations stays aligned", () => {
    // The old AudioGridItem copy padded only the seconds, so "9:05" and "10:05"
    // rendered at different widths in the same list.
    expect(formatDuration(5)).toBe("00:05")
    expect(formatDuration(65)).toBe("01:05")
    expect(formatDuration(605)).toBe("10:05")
  })

  it("switches to h:mm:ss past an hour", () => {
    // The old copies printed "60:00" for an hour, which reads as sixty minutes
    // and collides with the mm:ss format.
    expect(formatDuration(3600)).toBe("1:00:00")
    expect(formatDuration(3661)).toBe("1:01:01")
    expect(formatDuration(7325)).toBe("2:02:05")
  })

  it("floors fractional seconds instead of leaking a decimal", () => {
    // `seconds % 60` on 90.5 produced "01:30.5".
    expect(formatDuration(90.5)).toBe("01:30")
    expect(formatDuration(0.9)).toBe("00:00")
  })

  it("returns N/A for values that cannot be a duration", () => {
    // Previously: -5 -> "-1:-5", NaN -> "NaN:NaN", both rendered to the user.
    expect(formatDuration(-5)).toBe("N/A")
    expect(formatDuration(Number.NaN)).toBe("N/A")
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("N/A")
    expect(formatDuration(undefined)).toBe("N/A")
    expect(formatDuration(null)).toBe("N/A")
  })

  it("handles zero as a real duration, not a missing one", () => {
    expect(formatDuration(0)).toBe("00:00")
  })
})

describe("formatFileSize", () => {
  it("picks the largest readable unit", () => {
    expect(formatFileSize(512)).toBe("512 B")
    expect(formatFileSize(1024)).toBe("1 KB")
    expect(formatFileSize(1536)).toBe("1.5 KB")
    expect(formatFileSize(1024 ** 2)).toBe("1 MB")
    expect(formatFileSize(1024 ** 3)).toBe("1 GB")
  })

  it("rounds to two decimal places", () => {
    expect(formatFileSize(1234)).toBe("1.21 KB")
  })

  // REGRESSION — Math.log(0) is -Infinity, so the unit lookup went out of
  // bounds and the UI displayed the literal string "NaN undefined".
  it("shows zero bytes as zero, not NaN", () => {
    expect(formatFileSize(0)).toBe("0 B")
  })

  it("returns N/A for values that cannot be a size", () => {
    expect(formatFileSize(-1)).toBe("N/A")
    expect(formatFileSize(Number.NaN)).toBe("N/A")
    expect(formatFileSize(undefined)).toBe("N/A")
    expect(formatFileSize(null)).toBe("N/A")
  })

  it("clamps at the largest known unit rather than indexing past it", () => {
    // 1024^6 would be an EB; without the clamp the unit is `undefined`.
    expect(formatFileSize(1024 ** 6)).toMatch(/TB$/)
  })
})
