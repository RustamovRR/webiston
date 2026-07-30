import type { Metadata } from "next"
import { describe, expect, it } from "vitest"
import {
  localeAlternates,
  localeUrl,
  ogCardUrl,
  SITE_URL,
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
    // a one-way declaration is ignored by search engines.
    for (const locale of ["uz", "en"]) {
      const langs = localeAlternates(locale, "/tools")?.languages as Record<
        string,
        string
      >
      expect(langs.uz).toBe(`${SITE_URL}/tools`)
      expect(langs.en).toBe(`${SITE_URL}/en/tools`)
      expect(langs["x-default"]).toBe(`${SITE_URL}/tools`)
    }
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
    const og = withLocale(base, "en", "/x").openGraph as Record<string, unknown>
    expect(og.locale).toBe("en_US")
    expect(og.alternateLocale).toEqual(["uz_UZ"])
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
