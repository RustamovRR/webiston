import { describe, expect, it } from "vitest"

import {
  formatUuid,
  generateNilUuid,
  generateUuid,
  generateUuidV1,
  generateUuidV4,
  generateUuidV7,
  inspectUuid,
  isValidUuid,
  normalizeUuid
} from "./uuid"

const CANONICAL =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe("generateUuidV4", () => {
  it("carries the version and variant bits RFC 9562 requires", () => {
    // Arrange & Act
    const value = generateUuidV4()

    // Assert
    expect(value).toMatch(CANONICAL)
    expect(value[14]).toBe("4")
    expect("89ab").toContain(value[19])
  })

  it("draws 1000 distinct values", () => {
    // Arrange & Act
    const values = Array.from({ length: 1000 }, generateUuidV4)

    // Assert
    expect(new Set(values).size).toBe(1000)
  })
})

describe("generateUuidV7", () => {
  it("is sortable as text, which is the reason the version exists", () => {
    // Arrange & Act — a burst lands inside one millisecond, which is exactly
    // where a non-monotonic implementation stops being ordered.
    const values = Array.from({ length: 500 }, generateUuidV7)

    // Assert
    expect([...values].sort()).toEqual(values)
    expect(new Set(values).size).toBe(500)
  })

  it("embeds the current time, readable back to a date", () => {
    // Arrange
    const before = Date.now()

    // Act
    const verdict = inspectUuid(generateUuidV7())

    // Assert
    expect(verdict?.version).toBe(7)
    expect(verdict?.timestamp).toBeGreaterThanOrEqual(before - 1)
    expect(verdict?.timestamp).toBeLessThanOrEqual(Date.now() + 1)
  })
})

describe("generateUuidV1", () => {
  it("round-trips its timestamp", () => {
    // The old implementation computed this as a float — (Date.now() +
    // 12219292800000) * 10000 is ≈1.7e16, past Number.MAX_SAFE_INTEGER — so
    // the low bits of the 60-bit field were whatever the double could hold.

    // Arrange
    const before = Date.now()

    // Act
    const verdict = inspectUuid(generateUuidV1())

    // Assert
    expect(verdict?.version).toBe(1)
    expect(verdict?.variant).toBe("rfc")
    expect(verdict?.timestamp).toBeGreaterThanOrEqual(before - 1)
    expect(verdict?.timestamp).toBeLessThanOrEqual(Date.now() + 1)
  })

  it("marks its node as not-a-MAC-address and stays distinct in a burst", () => {
    // Arrange & Act
    const values = Array.from({ length: 200 }, generateUuidV1)

    // Assert — RFC 9562 §5.1: a randomly generated node sets the multicast
    // bit, so it can never collide with real hardware.
    for (const value of values) {
      const firstNodeOctet = Number.parseInt(value.slice(24, 26), 16)
      expect(firstNodeOctet & 0x01).toBe(1)
    }
    expect(new Set(values).size).toBe(200)
  })
})

describe("generateUuid", () => {
  it("dispatches on the requested version", () => {
    // Arrange & Act & Assert
    expect(generateUuid("nil")).toBe(generateNilUuid())
    expect(inspectUuid(generateUuid("v4"))?.version).toBe(4)
    expect(inspectUuid(generateUuid("v7"))?.version).toBe(7)
    expect(inspectUuid(generateUuid("v1"))?.version).toBe(1)
  })
})

describe("formatUuid", () => {
  const value = "0189d6e8-4c2f-7a3b-8d1e-9f0a1b2c3d4e"

  it("applies delimiters and case as independent axes", () => {
    // Arrange & Act & Assert — the old tool made these one four-option
    // control, so `compact` + uppercase was unreachable.
    expect(formatUuid(value, "standard")).toBe(value)
    expect(formatUuid(value, "compact")).toBe(
      "0189d6e84c2f7a3b8d1e9f0a1b2c3d4e"
    )
    expect(formatUuid(value, "braces")).toBe(`{${value}}`)
    expect(formatUuid(value, "compact", "upper")).toBe(
      "0189D6E84C2F7A3B8D1E9F0A1B2C3D4E"
    )
  })
})

describe("normalizeUuid", () => {
  const canonical = "0189d6e8-4c2f-7a3b-8d1e-9f0a1b2c3d4e"

  it("reads every shape a UUID arrives in", () => {
    // Arrange & Act & Assert
    expect(normalizeUuid(` ${canonical.toUpperCase()} `)).toBe(
      canonical.replace(/-/g, "")
    )
    expect(normalizeUuid(`{${canonical}}`)).toBe(canonical.replace(/-/g, ""))
    expect(normalizeUuid(`urn:uuid:${canonical}`)).toBe(
      canonical.replace(/-/g, "")
    )
  })

  it("rejects what is not 32 hex digits", () => {
    // Arrange & Act & Assert
    expect(normalizeUuid("hello")).toBeNull()
    expect(normalizeUuid(canonical.slice(0, -1))).toBeNull()
    expect(normalizeUuid(`${canonical}0`)).toBeNull()
  })
})

describe("inspectUuid", () => {
  it("names the Nil UUID instead of failing it", () => {
    // The shipped validator required a version nibble of 1–5 and a variant of
    // 8–b, so the tool's own Nil output did not pass its own check — and the
    // test that shipped with it asserted the opposite and failed.

    // Arrange & Act
    const verdict = inspectUuid(generateNilUuid())

    // Assert
    expect(isValidUuid(generateNilUuid())).toBe(true)
    expect(verdict?.special).toBe("nil")
    expect(verdict?.version).toBeNull()
  })

  it("names the Max UUID", () => {
    // Arrange & Act
    const verdict = inspectUuid("ffffffff-ffff-ffff-ffff-ffffffffffff")

    // Assert
    expect(verdict?.special).toBe("max")
  })

  it("recognises versions this tool cannot generate", () => {
    // Arrange — a v5 (SHA-1 name-based) UUID from RFC 9562's own examples.
    const v5 = "2ed6657d-e927-568b-95e1-2665a8aea6a2"

    // Act
    const verdict = inspectUuid(v5)

    // Assert
    expect(verdict?.version).toBe(5)
    expect(verdict?.variant).toBe("rfc")
    expect(verdict?.timestamp).toBeNull()
  })

  it("reads the v1 example from RFC 9562 §A.1", () => {
    // Arrange & Act
    const verdict = inspectUuid("c232ab00-9414-11ec-b3c8-9f6bdeced846")

    // Assert — 2022-02-22 19:22:22 UTC, the RFC's own worked example.
    expect(verdict?.version).toBe(1)
    expect(new Date(verdict?.timestamp ?? 0).toISOString()).toBe(
      "2022-02-22T19:22:22.000Z"
    )
  })

  it("reads the v7 example from RFC 9562 §A.6", () => {
    // Arrange & Act
    const verdict = inspectUuid("017F22E2-79B0-7CC3-98C4-DC0C0C07398F")

    // Assert
    expect(verdict?.version).toBe(7)
    expect(new Date(verdict?.timestamp ?? 0).toISOString()).toBe(
      "2022-02-22T19:22:22.000Z"
    )
  })

  it("names a non-RFC variant instead of calling the value invalid", () => {
    // Arrange & Act — variant nibble `c` is the Microsoft/COM GUID layout.
    const verdict = inspectUuid("c232ab00-9414-11ec-c3c8-9f6bdeced846")

    // Assert
    expect(verdict?.variant).toBe("microsoft")
  })

  it("returns null for something that is not a UUID", () => {
    // Arrange & Act & Assert
    expect(inspectUuid("not-a-uuid")).toBeNull()
    expect(inspectUuid("")).toBeNull()
  })
})
