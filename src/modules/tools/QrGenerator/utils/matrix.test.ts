import qrcode from "qrcode-generator"
import { describe, expect, it } from "vitest"

import {
  alignmentCentres,
  buildMatrix,
  isFunctionModule,
  sizeOfVersion,
  versionOfSize
} from "./matrix"

/**
 * The alignment table in `matrix.ts` is restated from ISO/IEC 18004 Annex E
 * because the encoder keeps its own copy private. A restated constant is a
 * guess until something checks it, so this suite checks every row of it
 * against a real encoded symbol.
 *
 * The check is the pattern's own signature: an alignment pattern is a 5x5 dark
 * ring around a 3x3 light ring around a dark centre, and it is a FUNCTION
 * pattern, so the mask never touches it. Nothing else in a symbol has that
 * shape at a fixed coordinate.
 */
function encodeAtVersion(version: number) {
  // Enough bytes to force this version at level L, without overflowing it.
  const capacityish = Math.floor(sizeOfVersion(version) ** 2 / 30)
  const qr = qrcode(version as 1, "L")
  qr.addData("A".repeat(Math.max(1, capacityish)))
  qr.make()
  return qr
}

describe("alignmentCentres", () => {
  it("version 1 has none", () => {
    // Arrange / Act
    const centres = alignmentCentres(1)

    // Assert
    expect(centres).toEqual([])
  })

  it("puts a real alignment pattern at every listed centre, versions 2–40", () => {
    for (let version = 2; version <= 40; version++) {
      // Arrange
      const qr = encodeAtVersion(version)
      const centres = alignmentCentres(version)

      // Act / Assert — the 5x5 / 3x3 / centre signature, at each coordinate.
      expect(centres.length).toBeGreaterThan(0)
      for (const [row, col] of centres) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const ring = Math.max(Math.abs(dr), Math.abs(dc))
            const expected = ring !== 1 // dark at ring 0 and 2, light at ring 1
            expect(
              qr.isDark(row + dr, col + dc),
              `v${version} centre (${row},${col}) offset (${dr},${dc})`
            ).toBe(expected)
          }
        }
      }
    }
  })

  it("skips the three finder corners", () => {
    // Arrange — version 7 is the first with three centres per axis, so the
    // corner exclusions and a real central pattern coexist.
    const centres = alignmentCentres(7)

    // Act
    const last = sizeOfVersion(7) - 7

    // Assert
    expect(centres).not.toContainEqual([6, 6])
    expect(centres).not.toContainEqual([6, last])
    expect(centres).not.toContainEqual([last, 6])
    // …and the centre one, the whole reason a margin rule is not enough.
    expect(centres).toContainEqual([22, 22])
  })
})

describe("isFunctionModule", () => {
  it("marks the timing patterns", () => {
    // Arrange
    const size = sizeOfVersion(3)
    const isFunction = isFunctionModule(size)

    // Act / Assert — row 6 and column 6, all the way across.
    for (let i = 0; i < size; i++) {
      expect(isFunction(6, i)).toBe(true)
      expect(isFunction(i, 6)).toBe(true)
    }
  })

  it("marks the format information on both copies", () => {
    // Arrange
    const size = sizeOfVersion(3)
    const isFunction = isFunctionModule(size)

    // Act / Assert
    expect(isFunction(8, 0)).toBe(true)
    expect(isFunction(8, 8)).toBe(true)
    expect(isFunction(8, size - 1)).toBe(true)
    expect(isFunction(size - 1, 8)).toBe(true)
  })

  it("leaves the middle of a large symbol free where no pattern sits", () => {
    // Arrange — version 5 has alignment only at (30,30) of 37.
    const size = sizeOfVersion(5)
    const isFunction = isFunctionModule(size)

    // Act / Assert
    expect(isFunction(18, 18)).toBe(false)
    expect(isFunction(30, 30)).toBe(true)
  })
})

describe("buildMatrix", () => {
  it("takes the smallest version that fits by default", () => {
    // Arrange / Act
    const matrix = buildMatrix("Salom", "H")

    // Assert
    expect(versionOfSize(matrix.size)).toBe(1)
  })

  it("honours a forced version", () => {
    // Arrange / Act
    const matrix = buildMatrix("Salom", "H", 5)

    // Assert
    expect(matrix.size).toBe(sizeOfVersion(5))
  })
})
