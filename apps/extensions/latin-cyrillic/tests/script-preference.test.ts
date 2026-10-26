import { convertToScript } from "@webiston/transliteration"
import { describe, expect, it } from "vitest"

import { openingPreference } from "../utils/script-preference"

/**
 * What the in-page panel and Ctrl+Shift+L open on.
 *
 * The popup stores its switch, and the popup is also a converter — so the
 * stored value is often just "what was last converted there". These cases
 * pin the rule that keeps that from turning a selection into itself.
 */

const LATIN = "Shoshilinch xabar"
const CYRILLIC = "Шошилинч хабар"
const NEW_LATIN = "Şoşilinç xabar"

describe("openingPreference", () => {
  it("stays on auto when nothing was chosen", () => {
    // Arrange & Act & Assert
    expect(openingPreference("auto", LATIN)).toBe("auto")
    expect(openingPreference("auto", CYRILLIC)).toBe("auto")
  })

  it("opens on the new alphabet for 1995 Latin and Cyrillic text", () => {
    // Arrange & Act & Assert — the reason the choice is stored at all.
    expect(openingPreference("latin-2027", LATIN)).toBe("latin-2027")
    expect(openingPreference("latin-2027", CYRILLIC)).toBe("latin-2027")
  })

  it("falls back to auto when the text is already in the stored alphabet", () => {
    // Arrange & Act & Assert
    expect(openingPreference("cyrillic", CYRILLIC)).toBe("auto")
    expect(openingPreference("latin", LATIN)).toBe("auto")
    expect(openingPreference("latin-2027", NEW_LATIN)).toBe("auto")
  })

  it("never hands back the selection unchanged", () => {
    // Arrange — every stored choice against every alphabet.
    const stored = ["auto", "cyrillic", "latin", "latin-2027"] as const
    const texts = [LATIN, CYRILLIC, NEW_LATIN]

    for (const choice of stored) {
      for (const text of texts) {
        // Act
        const result = convertToScript(text, openingPreference(choice, text))

        // Assert — what the shortcut copies is always a conversion.
        expect(result.text, `${choice} on "${text}"`).not.toBe(text)
      }
    }
  })

  it("keeps a stored Lotin taking new-alphabet text back to 1995 spelling", () => {
    // Arrange & Act
    const preference = openingPreference("latin", NEW_LATIN)

    // Assert
    expect(preference).toBe("latin")
    expect(convertToScript(NEW_LATIN, preference).text).toBe(LATIN)
  })
})
