import { LATIN_2027_LETTERS } from "@webiston/transliteration"
import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"

import en from "../../../../messages/tools/yangi-alifbo/en.json"
import ru from "../../../../messages/tools/yangi-alifbo/ru.json"
import uz from "../../../../messages/tools/yangi-alifbo/uz.json"
import { KEYBOARD_PLATFORMS, MAC_EXTENDED_KEYS } from "./constants"

/**
 * The typing guide's wiring. The component is an async Server Component, so
 * this checks what it reads — every key it asks for exists and parses as
 * rich text in all three locales — rather than rendering it.
 */

const BUNDLES = { uz, en, ru }

describe("KeyboardGuide", () => {
  it("has ABC – Extended keys for every new letter", () => {
    // Arrange / Act
    const missing = LATIN_2027_LETTERS.filter(
      (letter) => !MAC_EXTENDED_KEYS[letter.old]
    )

    // Assert
    expect(missing).toEqual([])
  })

  for (const [locale, messages] of Object.entries(BUNDLES)) {
    it(`resolves every method as rich text in ${locale}`, () => {
      // Arrange
      const t = createTranslator({
        locale,
        messages,
        namespace: "NewAlphabetPage.keyboard",
        // The default logs and renders the key instead — a test that
        // cannot fail. Throwing makes a broken message a red test.
        onError: (error) => {
          throw error
        }
      })
      const tags = {
        kbd: (chunks: unknown) => `[${String(chunks)}]`,
        ext: (chunks: unknown) => String(chunks)
      }

      // Act — throws on a missing key or a malformed message.
      const keys = [
        "easiest",
        ...KEYBOARD_PLATFORMS.flatMap((platform) =>
          platform.methods.flatMap((method) => [
            `platforms.${platform.id}.methods.${method.key}.title`,
            `platforms.${platform.id}.methods.${method.key}.body`
          ])
        )
      ]
      // The keys are built at runtime, as the component builds them; asserting
      // them to the typed key union is the claim this test checks.
      const rendered = keys.map((key) =>
        String(t.rich(key as Parameters<typeof t.rich>[0], tags))
      )

      // Assert — no tag survives as literal markup.
      for (const text of rendered) expect(text).not.toMatch(/<\/?\w+>/)
      expect(rendered[0]).toContain("[Ctrl]")
    })
  }
})
