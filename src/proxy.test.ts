import { describe, expect, it } from "vitest"

import { LOCALES } from "./i18n/locales"
import { config } from "./proxy"

/**
 * The one place the locale list still has to be typed by hand.
 *
 * Next parses `export const config` statically at build time, so the matcher
 * cannot be built from `LOCALES` — a template literal there fails the build.
 * That leaves a hand-written alternation, and it is the worst possible place
 * for one: adding a locale and forgetting this line fails **silently**. The
 * routes exist, the pages render, and the middleware simply never runs on them,
 * so the locale cookie is never written and `localePrefix` never redirects.
 *
 * This test is the guard rail. It is deliberately about the CONTENT of the
 * pattern rather than its exact text, so reformatting the file does not break
 * it and adding a locale does.
 */

describe("proxy matcher", () => {
  it("matches exactly the locales the site serves", () => {
    // Arrange — pull `(uz|en)` out of `/(uz|en)/:path*`.
    const localeRule = config.matcher.find((rule) => rule.includes("|"))
    expect(localeRule, "no locale alternation in the matcher").toBeDefined()

    const alternation = localeRule?.match(/\(([^)]+)\)/)?.[1]

    // Act
    const matched = alternation?.split("|").sort()

    // Assert — set equality, so an added locale fails here rather than in
    // production three weeks later.
    expect(matched).toEqual([...LOCALES].sort())
  })

  it("still covers the root and the unprefixed tools routes", () => {
    // Arrange + Act + Assert — `/` is what redirects a bare visit to the
    // default locale, and `/tools/:path*` is what adds the prefix to the
    // routes people arrive at directly from search.
    expect(config.matcher).toContain("/")
    expect(config.matcher).toContain("/tools/:path*")
  })
})
