import { describe, expect, it } from "vitest"

import { MAX_LOGO_SIZE, MIN_LOGO_SIZE } from "../constants"
import { logoFits, logoFootprint, versionForLogo } from "./logo-fit"
import {
  buildMatrix,
  isCriticalModule,
  sizeOfVersion,
  versionOfSize
} from "./matrix"

/**
 * The regression this file locks down.
 *
 * The tool raised the error level to H whenever a logo was present and treated
 * that as sufficient. It is not: error correction protects the data codewords
 * and leaves every function pattern unguarded. Measured on the shipped code,
 * a 22% logo on `Salom` destroyed 18 timing modules and 10 format-information
 * modules — a symbol no decoder can read at any level.
 */

const QUIET_ZONE = 4

/**
 * How many CRITICAL modules a centred logo would cover — the number that has
 * to be 0. Alignment patterns are excluded deliberately; see
 * `isAlignmentModule` for why treating them as fatal makes logos impossible.
 */
function criticalModulesLost(size: number, ratio: number): number {
  const { from, to } = logoFootprint(size, QUIET_ZONE, ratio)
  const isCritical = isCriticalModule(size)
  let lost = 0

  for (let row = from; row < to; row++) {
    for (let col = from; col < to; col++) {
      if (row >= 0 && col >= 0 && row < size && col < size) {
        if (isCritical(row, col)) lost++
      }
    }
  }

  return lost
}

/** What the tool actually encodes now: natural version, then grown to fit. */
function matrixFor(payload: string, ratio: number) {
  const natural = buildMatrix(payload, "H")
  const version = versionForLogo(versionOfSize(natural.size), QUIET_ZONE, ratio)
  return buildMatrix(payload, "H", version)
}

describe("logoFootprint", () => {
  it("measures the logo against the full box, quiet zone included", () => {
    // Arrange — the logo is sized against `extent`, which spans
    // size + quietZone * 2 modules, not `size`.
    const size = 21

    // Act
    const { covered } = logoFootprint(size, QUIET_ZONE, 0.22)

    // Assert — (21 + 8) * 0.22 = 6.38 -> 7, plus a module of air each side.
    expect(covered).toBe(9)
  })
})

describe("the reported failure", () => {
  it("a short payload with a logo used to destroy timing and format modules", () => {
    // Arrange — version 1 is what `Salom` encodes to on its own.
    const naturalSize = sizeOfVersion(1)

    // Act
    const lost = criticalModulesLost(naturalSize, 0.22)

    // Assert — this is the bug, pinned so it cannot come back silently.
    expect(lost).toBeGreaterThan(0)
  })

  it("now grows the symbol until the logo clears every function pattern", () => {
    // Arrange / Act
    const matrix = matrixFor("Salom", 0.22)

    // Assert
    expect(criticalModulesLost(matrix.size, 0.22)).toBe(0)
    expect(versionOfSize(matrix.size)).toBeGreaterThan(1)
  })
})

describe("versionForLogo", () => {
  const PAYLOADS = [
    "Salom",
    "https://webiston.uz",
    "https://webiston.uz/tools/qr-generator",
    "WIFI:T:WPA;S:MyNetwork;P:parol12345;;",
    "BEGIN:VCARD\nVERSION:3.0\nFN:Risqiddin Rustamov\nTEL:+998901234567\nEND:VCARD"
  ]

  it("loses no function module, for every payload at every allowed size", () => {
    for (const payload of PAYLOADS) {
      for (const ratio of [MIN_LOGO_SIZE, 0.15, 0.22, MAX_LOGO_SIZE]) {
        // Arrange / Act
        const matrix = matrixFor(payload, ratio)

        // Assert
        expect(
          criticalModulesLost(matrix.size, ratio),
          `${payload} @ ${ratio}`
        ).toBe(0)
      }
    }
  })

  it("never shrinks below the version the payload needs", () => {
    for (const payload of PAYLOADS) {
      // Arrange
      const natural = versionOfSize(buildMatrix(payload, "H").size)

      // Act
      const chosen = versionForLogo(natural, QUIET_ZONE, MAX_LOGO_SIZE)

      // Assert
      expect(chosen).toBeGreaterThanOrEqual(natural)
    }
  })

  it("leaves a symbol alone when the logo already fits", () => {
    // Arrange — a long payload has a centre far from every critical pattern.
    const payload = "x".repeat(400)
    const natural = versionOfSize(buildMatrix(payload, "H").size)

    // Act
    const chosen = versionForLogo(natural, QUIET_ZONE, MIN_LOGO_SIZE)

    // Assert
    expect(chosen).toBe(natural)
  })
})

describe("logoFits", () => {
  it("rejects a small symbol whose centre IS the format information", () => {
    // Arrange — version 1 is 21 modules; a 22% logo starts at row 6.
    const size = sizeOfVersion(1)

    // Act / Assert
    expect(logoFits(size, QUIET_ZONE, 0.22)).toBe(false)
  })

  it("allows a logo over the version-7 centre alignment pattern", () => {
    // Arrange — version 7 puts an alignment pattern at (22,22) of 45. It is
    // reserved but recoverable, and refusing it would push this payload to a
    // far denser version for no readability gain.
    const size = sizeOfVersion(7)

    // Act / Assert
    expect(logoFits(size, QUIET_ZONE, 0.3)).toBe(true)
  })
})
