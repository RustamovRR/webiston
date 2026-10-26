import { describe, expect, it } from "vitest"
import {
  convertToScript,
  EXPECTED_SOURCE,
  isScriptPreference,
  resolveTarget,
  SCRIPT_PREFERENCES,
  swapTarget,
  toLatin
} from "../src"

/**
 * The three-alphabet switch policy — shared by the web converter, the
 * extension popup and the in-page popover, so the three cannot disagree about
 * what "Avto" or swap means.
 */

describe("resolveTarget", () => {
  it("flips Cyrillic to the 1995 Latin under auto", () => {
    // Arrange & Act & Assert
    expect(resolveTarget("auto", "cyrillic")).toBe("latin")
  })

  it("sends both Latin alphabets to Cyrillic under auto", () => {
    // Arrange & Act & Assert — auto never guesses the new alphabet.
    expect(resolveTarget("auto", "latin")).toBe("cyrillic")
    expect(resolveTarget("auto", "latin-2027")).toBe("cyrillic")
  })

  it("honours a pinned alphabet whatever the text is in", () => {
    // Arrange & Act & Assert
    expect(resolveTarget("latin-2027", "cyrillic")).toBe("latin-2027")
    expect(resolveTarget("latin", "latin")).toBe("latin")
  })
})

describe("swapTarget", () => {
  it("goes back to the alphabet the text came from", () => {
    // Arrange & Act & Assert
    expect(swapTarget("latin", "latin-2027")).toBe("latin")
    expect(swapTarget("cyrillic", "latin")).toBe("cyrillic")
  })

  it("is never a no-op when the text was already in the target", () => {
    // Arrange & Act
    const next = swapTarget("latin-2027", "latin-2027")

    // Assert
    expect(next).toBe(EXPECTED_SOURCE["latin-2027"])
    expect(next).not.toBe("latin-2027")
  })
})

describe("isScriptPreference", () => {
  it("accepts every position the switch shows", () => {
    // Arrange & Act & Assert
    for (const option of SCRIPT_PREFERENCES) {
      expect(isScriptPreference(option)).toBe(true)
    }
  })

  it("rejects what an older or newer build may have stored", () => {
    // Arrange & Act & Assert — a v3 direction, junk, and a prototype key.
    expect(isScriptPreference("latin-to-cyrillic")).toBe(false)
    expect(isScriptPreference(null)).toBe(false)
    expect(isScriptPreference("constructor")).toBe(false)
  })
})

describe("convertToScript", () => {
  it("converts into the new alphabet and reports both ends", () => {
    // Arrange
    const input = "Shoshilinch xabar: g'alaba!"

    // Act
    const result = convertToScript(input, "latin-2027")

    // Assert
    expect(result).toEqual({
      text: "Şoşilinç xabar: ğalaba!",
      source: "latin",
      target: "latin-2027"
    })
  })

  it("matches the old Cyrillic-to-Latin output under auto", () => {
    // Arrange
    const input = "Ўзбекистон — гўзал мамлакат."

    // Act
    const result = convertToScript(input, "auto")

    // Assert — the extension's oldest job must not change.
    expect(result.target).toBe("latin")
    expect(result.text).toBe(toLatin(input))
  })

  it("reads a new-alphabet text and takes it to Cyrillic under auto", () => {
    // Arrange & Act
    const result = convertToScript("Şahar", "auto")

    // Assert
    expect(result.source).toBe("latin-2027")
    expect(result.target).toBe("cyrillic")
    expect(result.text).toBe("Шаҳар")
  })
})
