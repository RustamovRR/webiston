import type { Metadata } from "next"
import { describe, expect, it } from "vitest"
import { LOCALES, localeInfo } from "@/i18n/locales"
import {
  localeAlternates,
  localeUrl,
  ogCardUrl,
  SITE_URL,
  toolBreadcrumbSchema,
  withLocale
} from "./seo"

/**
 * These helpers decide what every page tells Google. The bugs they replaced were
 * not subtle — 229 book chapters declaring themselves duplicates of the homepage,
 * and every /en page canonicalising to its Uzbek twin — so the rules are worth
 * pinning rather than re-deriving next time someone touches them.
 */

describe("localeUrl", () => {
  it("leaves the default locale unprefixed (localePrefix: as-needed)", () => {
    expect(localeUrl("uz", "/tools")).toBe(`${SITE_URL}/tools`)
    expect(localeUrl("uz", "/")).toBe(SITE_URL)
  })

  it("prefixes every non-default locale", () => {
    expect(localeUrl("en", "/tools")).toBe(`${SITE_URL}/en/tools`)
    expect(localeUrl("en", "/")).toBe(`${SITE_URL}/en`)
  })

  it("never emits a trailing slash for the root", () => {
    // "https://webiston.uz/" and "https://webiston.uz" are different URLs to a
    // crawler; the canonical must match what the site actually serves.
    expect(localeUrl("uz", "/")).not.toMatch(/\/$/)
    expect(localeUrl("en", "/")).not.toMatch(/\/$/)
  })
})

describe("localeAlternates", () => {
  it("self-canonicalises — each locale points at its OWN url", () => {
    expect(localeAlternates("en", "/tools")?.canonical).toBe(
      `${SITE_URL}/en/tools`
    )
    expect(localeAlternates("uz", "/tools")?.canonical).toBe(
      `${SITE_URL}/tools`
    )
  })

  it("lists every locale plus x-default, reciprocally", () => {
    // hreflang is only valid when every locale's page lists every other one;
    // an unreciprocated annotation is dropped.
    //
    // Derived from LOCALES rather than a literal pair: the previous version
    // looped `["uz", "en"]` and asserted those two keys, so it kept passing
    // after `ru` shipped while saying nothing about it. A hreflang test that
    // ignores the locale you just added is the one test you did not need.
    for (const locale of LOCALES) {
      const langs = localeAlternates(locale, "/tools")?.languages as Record<
        string,
        string
      >

      // Every served locale is listed on every variant — that is reciprocity.
      for (const other of LOCALES) {
        expect(langs[other]).toBe(localeUrl(other, "/tools"))
      }

      // The set is exactly the locales plus x-default: no strays, none missing.
      expect(Object.keys(langs).sort()).toEqual(
        [...LOCALES, "x-default"].sort()
      )
      expect(langs["x-default"]).toBe(`${SITE_URL}/tools`)
    }
  })

  it("emits a byte-identical language set on every variant", () => {
    // The failure mode that actually costs traffic: one locale's page
    // advertising a different set from its siblings.
    const sets = LOCALES.map((l) =>
      JSON.stringify(localeAlternates(l, "/tools")?.languages)
    )
    expect(new Set(sets).size).toBe(1)
  })
})

describe("ogCardUrl", () => {
  it("encodes the title and path so a query string cannot be broken", () => {
    const url = ogCardUrl("A & B?", "/books/x y")
    expect(url).toContain("title=A%20%26%20B%3F")
    expect(url).not.toContain("A & B?")
  })
})

describe("withLocale", () => {
  const base: Metadata = {
    title: "JSON Formatter",
    openGraph: { title: "JSON Formatter", siteName: "Webiston" },
    twitter: { card: "summary_large_image" }
  }

  it("overwrites the canonical with the locale's own url", () => {
    const en = withLocale(base, "en", "/tools/json-formatter")
    expect((en.alternates as { canonical: string }).canonical).toBe(
      `${SITE_URL}/en/tools/json-formatter`
    )
  })

  it("sets the OpenGraph locale and lists the others as alternates", () => {
    // Arrange — derived from the served list, not hardcoded. The previous
    // version asserted `["uz_UZ"]` and broke the day a third locale shipped,
    // which is a test failing for being out of date rather than for finding
    // anything.
    const others = LOCALES.filter((l) => l !== "en").map(
      (l) => localeInfo(l).ogLocale
    )

    // Act
    const og = withLocale(base, "en", "/x").openGraph as Record<string, unknown>

    // Assert
    expect(og.locale).toBe("en_US")
    expect(og.alternateLocale).toEqual(others)
    expect(og.url).toBe(`${SITE_URL}/en/x`)
  })

  it("preserves fields it does not own", () => {
    const og = withLocale(base, "uz", "/x").openGraph as Record<string, unknown>
    expect(og.siteName).toBe("Webiston")
  })

  it("routes the share card through /api/og at a truthful 1200x630", () => {
    // /logo.png is 1120x1120 but was declared 1200x630. The generated card
    // actually is that size.
    const images = (
      withLocale(base, "uz", "/tools/json-formatter").openGraph as {
        images: Array<{ url: string; width: number; height: number }>
      }
    ).images
    expect(images[0].url).toContain("/api/og?title=")
    expect(images[0].width).toBe(1200)
    expect(images[0].height).toBe(630)
  })

  it("leaves images alone when the title is templated rather than a string", () => {
    // A { default, template } title has no single text to draw on a card.
    const templated: Metadata = {
      title: { default: "d", template: "%s | Webiston" },
      openGraph: { images: [{ url: "/keep-me.png" }] }
    }
    const og = withLocale(templated, "uz", "/x").openGraph as {
      images: Array<{ url: string }>
    }
    expect(og.images[0].url).toBe("/keep-me.png")
  })

  it("does not invent an openGraph block when the page has none", () => {
    const bare = withLocale({ title: "x" }, "uz", "/x")
    expect(bare.openGraph).toBeUndefined()
  })
})

/**
 * A breadcrumb is discarded by Google when its terminal URL is not the page it
 * is served on. The 18 hand-written copies this replaced all branched
 * `locale === "en"`, so `/ru` published a trail of Uzbek URLs under a `/ru`
 * canonical — valid markup, silently thrown away.
 */
describe("toolBreadcrumbSchema", () => {
  const terminal = (locale: string) => {
    const items = toolBreadcrumbSchema(
      locale,
      "hash-generator",
      "Hash Generator"
    ).itemListElement
    return items[items.length - 1]
  }

  it("ends on the page's own canonical in every served locale", () => {
    // Arrange / Act / Assert — one loop so a new locale cannot be forgotten.
    for (const locale of LOCALES) {
      expect(terminal(locale).item).toBe(
        localeUrl(locale, "/tools/hash-generator")
      )
    }
  })

  it("gives Russian its own labels rather than falling through to Uzbek", () => {
    const ru = toolBreadcrumbSchema("ru", "hash-generator", "Hash Generator")
    const uz = toolBreadcrumbSchema("uz", "hash-generator", "Hash Generator")
    expect(ru.itemListElement[0].name).not.toBe(uz.itemListElement[0].name)
    expect(ru.itemListElement[0].name).toBe("Главная")
  })

  it("numbers positions from 1, in trail order", () => {
    const items = toolBreadcrumbSchema("uz", "x", "X").itemListElement
    expect(items.map((i) => i.position)).toEqual([1, 2, 3])
    expect(items[0].item).toBe(SITE_URL)
    expect(items[1].item).toBe(`${SITE_URL}/tools`)
  })

  it("falls back to Uzbek labels for a locale it does not know", () => {
    const items = toolBreadcrumbSchema("de", "x", "X").itemListElement
    expect(items[0].name).toBe("Bosh sahifa")
  })
})
