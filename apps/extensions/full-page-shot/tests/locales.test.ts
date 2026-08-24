import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * `browser.i18n.getMessage("typo")` returns an EMPTY STRING — no warning, no
 * throw, no fallback to the default locale. The button simply renders with no
 * label, in exactly one language, which is the language nobody here reads.
 *
 * WXT types the keys the SOURCE asks for, so a typo is already a compile
 * error. What types cannot check is whether the three bundles agree with each
 * other, whether a message is blank, and whether a `$PLACEHOLDER$` has
 * anything behind it — which is this file's job.
 */

const ROOT = path.join(import.meta.dirname, "..")
const LOCALES_DIR = path.join(ROOT, "public/_locales")
const LOCALES = readdirSync(LOCALES_DIR)

interface Entry {
  message: string
  placeholders?: Record<string, { content: string }>
}
type Bundle = Record<string, Entry>

const bundles = new Map<string, Bundle>(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(
      readFileSync(path.join(LOCALES_DIR, locale, "messages.json"), "utf8")
    ) as Bundle
  ])
)

const [reference] = [...bundles.values()]
if (!reference) throw new Error("no locale bundles found")

describe("extension locales", () => {
  it("ships all three languages", () => {
    // Arrange / Act / Assert
    expect([...bundles.keys()].sort()).toEqual(["en", "ru", "uz"])
  })

  it("carries the same keys in every bundle", () => {
    // Arrange
    const expected = Object.keys(reference).sort()

    // Act / Assert
    for (const [locale, bundle] of bundles) {
      expect(Object.keys(bundle).sort(), locale).toEqual(expected)
    }
  })

  it("has no blank message anywhere", () => {
    // Arrange / Act / Assert — a blank is the failure that looks like a
    // rendering bug rather than a translation one.
    for (const [locale, bundle] of bundles) {
      for (const [key, entry] of Object.entries(bundle)) {
        expect(entry.message?.trim(), `${locale}.${key}`).toBeTruthy()
      }
    }
  })

  it("declares every placeholder it interpolates", () => {
    // Arrange / Act / Assert — `$CAPTURED$` with nothing behind it renders
    // literally, which is how a number turns into a dollar sign on screen.
    for (const [locale, bundle] of bundles) {
      for (const [key, entry] of Object.entries(bundle)) {
        const used = [...entry.message.matchAll(/\$([A-Z_]+)\$/g)].map((m) =>
          m[1]?.toLowerCase()
        )
        for (const name of used) {
          expect(
            name && entry.placeholders?.[name],
            `${locale}.${key} → $${name}$`
          ).toBeTruthy()
        }
      }
    }
  })

  it("names the extension and describes it in every language", () => {
    // Arrange / Act / Assert — these two are the store listing itself: the
    // viewer's browser language decides which one the store shows.
    for (const [locale, bundle] of bundles) {
      expect(bundle.extName?.message, locale).toBeTruthy()
      expect(bundle.extDescription?.message.length, locale).toBeLessThanOrEqual(
        132
      )
    }
  })
})
