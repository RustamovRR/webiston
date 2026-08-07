import { describe, expect, it } from "vitest"

import { DEFAULT_SETTINGS, PRESETS } from "../constants"
import type { PasswordSettings } from "./generate-password"
import { assessStrength } from "./strength"

const settings = (patch: Partial<PasswordSettings>): PasswordSettings => ({
  ...DEFAULT_SETTINGS,
  ...patch
})

describe("assessStrength", () => {
  it("computes bits from the ACTUAL alphabet, not a hardcoded 95", () => {
    // Arrange — digits only: the case the old readout got most wrong,
    // crediting a 6-digit PIN with the full printable-ASCII space (~394 bits).
    const pin = settings({
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeSymbols: false
    })

    // Act
    const report = assessStrength(pin)

    // Assert — 6 × log2(10) ≈ 19.9
    expect(report?.alphabetSize).toBe(10)
    expect(report?.bits).toBe(20)
    expect(report?.level).toBe(1)
  })

  it("returns null when no characters are allowed", () => {
    const impossible = settings({
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: false
    })

    expect(assessStrength(impossible)).toBeNull()
  })

  it("shrinks the alphabet when similar glyphs are excluded", () => {
    // Arrange
    const wide = assessStrength(settings({ excludeSimilar: false }))
    const narrow = assessStrength(settings({ excludeSimilar: true }))

    // Assert — same length, smaller space, fewer bits
    expect(narrow?.alphabetSize).toBeLessThan(wide?.alphabetSize ?? 0)
    expect(narrow?.bits).toBeLessThan(wide?.bits ?? 0)
  })

  it("is honest about the memorable format", () => {
    // Arrange — same length, two generators
    const memorable = assessStrength(
      settings({ length: 12, passwordType: "memorable" })
    )
    const random = assessStrength(settings({ length: 12 }))

    // Assert — two words from a 32-entry list are NOT 12 random characters,
    // and the meter must say so rather than flatter
    expect(memorable?.bits).toBeLessThan((random?.bits ?? 0) / 2)
    expect(memorable?.level).toBe(1)
  })

  it("grades the crack time into the right bucket", () => {
    // A 6-digit PIN falls instantly; 24 mixed characters outlive centuries.
    expect(
      assessStrength(
        settings({
          length: 6,
          includeUppercase: false,
          includeLowercase: false,
          includeSymbols: false
        })
      )?.crack.unit
    ).toBe("instant")

    expect(assessStrength(settings({ length: 24 }))?.crack.unit).toBe(
      "centuries"
    )
  })

  it("carries a number for every unit that needs one", () => {
    // Arrange — 8 lowercase ≈ 37.6 bits ≈ tens of seconds at 10^10/s
    const report = assessStrength(
      settings({
        length: 8,
        includeUppercase: false,
        includeNumbers: false,
        includeSymbols: false
      })
    )

    // Assert
    expect(report?.crack.unit).toBe("seconds")
    expect(report?.crack.value).toBeGreaterThan(0)
  })

  // A preset is a recommendation — same rule as the QR presets: it must never
  // be the thing that produces a broken result.
  it.each(PRESETS)("preset $id produces a gradable password", (preset) => {
    expect(assessStrength(preset.settings)).not.toBeNull()
  })

  it("grades the 'secure' preset at the top level", () => {
    const secure = PRESETS.find((preset) => preset.id === "secure")
    expect(secure).toBeDefined()
    if (!secure) return

    expect(assessStrength(secure.settings)?.level).toBe(5)
  })
})
