import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * `browser.i18n.getMessage("typo")` returns an EMPTY STRING.
 *
 * No warning, no throw, no fallback to the default locale — the button simply
 * renders with no label and the extension looks broken in exactly one
 * language, which is the language nobody on this project reads. That silence
 * is the whole reason this file exists; it is the extension's equivalent of
 * `pnpm i18n` on the site.
 *
 * Three things are checked, and each one has failed somewhere before:
 * every bundle carries the same keys, no message is blank, and every key the
 * SOURCE asks for actually exists.
 */

const ROOT = path.join(import.meta.dirname, "..")
const LOCALES_DIR = path.join(ROOT, "public/_locales")
const LOCALES = readdirSync(LOCALES_DIR)

type Bundle = Record<string, { message: string }>

const bundles = new Map<string, Bundle>(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(
      readFileSync(path.join(LOCALES_DIR, locale, "messages.json"), "utf8")
    ) as Bundle
  ])
)

/** Every `t("…")` call across the extension's own source. */
function keysUsedInSource(): Set<string> {
  const files = [
    "entrypoints/popup/App.tsx",
    "entrypoints/content.ts",
    "entrypoints/background.ts"
  ]
  const used = new Set<string>()

  for (const file of files) {
    const source = readFileSync(path.join(ROOT, file), "utf8")
    for (const match of source.matchAll(/\bt\(\s*["']([a-zA-Z]+)["']\s*\)/g)) {
      used.add(match[1])
    }
    // The ternary form, `t(cond ? "a" : "b")`, which the plain pattern misses.
    for (const match of source.matchAll(
      /\bt\(\s*[^)]*\?\s*["']([a-zA-Z]+)["']\s*:\s*["']([a-zA-Z]+)["']\s*\)/g
    )) {
      used.add(match[1])
      used.add(match[2])
    }
  }

  return used
}

describe("extension message bundles", () => {
  it("ships the three locales the site ships", () => {
    // Arrange / Act / Assert
    expect([...LOCALES].sort()).toEqual(["en", "ru", "uz"])
  })

  it("carries an identical key set in every locale", () => {
    // Arrange
    const [reference, ...rest] = [...bundles.keys()]
    const expected = Object.keys(bundles.get(reference) as Bundle).sort()

    // Act / Assert
    for (const locale of rest) {
      expect(
        Object.keys(bundles.get(locale) as Bundle).sort(),
        `${locale} differs from ${reference}`
      ).toEqual(expected)
    }
  })

  it("has no blank message anywhere", () => {
    for (const [locale, bundle] of bundles) {
      for (const [key, entry] of Object.entries(bundle)) {
        // Assert — a blank value is indistinguishable at runtime from a
        // missing key, which is the failure this suite exists to prevent.
        expect(entry.message.trim(), `${locale}.${key}`).not.toBe("")
      }
    }
  })

  it("defines every key the source actually asks for", () => {
    // Arrange
    const used = keysUsedInSource()
    const defined = new Set(Object.keys(bundles.get("uz") as Bundle))

    // Act
    const missing = [...used].filter((key) => !defined.has(key))

    // Assert
    expect(
      used.size,
      "no t() calls found — did the helper get renamed?"
    ).toBeGreaterThan(10)
    expect(missing).toEqual([])
  })

  it("keeps the manifest placeholders resolvable", () => {
    // Arrange — `__MSG_x__` in wxt.config.ts must exist in every bundle, or
    // the store listing renders the literal placeholder as its title.
    const config = readFileSync(path.join(ROOT, "wxt.config.ts"), "utf8")
    const placeholders = [...config.matchAll(/__MSG_([a-zA-Z]+)__/g)].map(
      (match) => match[1]
    )

    // Act / Assert
    expect(placeholders.length).toBeGreaterThan(0)
    for (const [locale, bundle] of bundles) {
      for (const key of placeholders) {
        expect(bundle[key], `${locale} is missing ${key}`).toBeDefined()
      }
    }
  })

  /**
   * No pictographic symbols in anything the MANIFEST exposes.
   *
   * The Edge submission was rejected on exactly this: the Russian name read
   * "Латиница ↔ кириллица" and Partner Center answered "The Name field in
   * manifest contains an unsupported character at index: 9 for locale: ru".
   * Chrome had accepted the same package, so nothing local caught it — the
   * first signal was a failed upload on a store that only checks at submit
   * time, in one of the two languages nobody here proofreads.
   *
   * Both symbol categories, and the distinction cost a round trip: the first
   * version of this test checked `\p{So}` alone and passed with the arrow
   * still in place. U+2194 is `Sm` — MATH symbol — not `So`. Arrows, dingbats
   * and emoji are split across the two, so a guard against one of them is not
   * a guard at all.
   *
   * ASCII is exempt, because `\p{Sm}` also covers `+`, `=`, `<` and `|`, which
   * are ordinary characters in a product name and were never the problem.
   * Dashes are `\p{Pd}` and stay legal too: the English name carries an en
   * dash at index 5, ahead of the arrow the validator stopped on, and Edge
   * passed straight over it. Punctuation is fine; pictures are not.
   */
  it("keeps pictographic symbols out of manifest-facing strings", () => {
    // Arrange
    const config = readFileSync(path.join(ROOT, "wxt.config.ts"), "utf8")
    const placeholders = [...config.matchAll(/__MSG_([a-zA-Z]+)__/g)].map(
      (match) => match[1]
    )
    const isSymbol = (char: string) =>
      (char.codePointAt(0) ?? 0) > 127 && /[\p{Sm}\p{So}]/u.test(char)

    // Act
    const offenders: string[] = []
    for (const [locale, bundle] of bundles) {
      for (const key of placeholders) {
        const message = bundle[key]?.message ?? ""
        const index = [...message].findIndex(isSymbol)
        if (index !== -1) {
          offenders.push(`${locale}.${key} index ${index}: ${message[index]}`)
        }
      }
    }

    // Assert
    expect(offenders).toEqual([])
  })
})
