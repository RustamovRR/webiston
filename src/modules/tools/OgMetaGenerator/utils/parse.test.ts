import { describe, expect, it } from "vitest"

import { countImported, parseHeadHtml } from "./parse"

/**
 * The importer.
 *
 * Every case here is a shape real markup arrives in, not a synthetic one:
 * attributes in either order, `name=` where the protocol says `property=`,
 * single quotes, and a bare block of tags with no `<head>` around it.
 */

describe("parseHeadHtml", () => {
  it("reads a normal head", () => {
    // Arrange
    const html = `
      <head>
        <title>Sahifa sarlavhasi</title>
        <meta name="description" content="Oddiy tavsif" />
        <meta property="og:title" content="OG sarlavha" />
        <meta property="og:image" content="https://example.uz/og.png" />
        <meta property="og:site_name" content="Example" />
        <link rel="canonical" href="https://example.uz/sahifa" />
      </head>`

    // Act
    const found = parseHeadHtml(html)

    // Assert — og:title wins over <title>, which is the precedence a crawler
    // uses; the canonical link stands in for a missing og:url.
    expect(found.title).toBe("OG sarlavha")
    expect(found.description).toBe("Oddiy tavsif")
    expect(found.image).toBe("https://example.uz/og.png")
    expect(found.url).toBe("https://example.uz/sahifa")
    expect(countImported(found)).toBe(5)
  })

  it("falls back to <title> when there is no og:title", () => {
    // Arrange & Act
    const found = parseHeadHtml("<title>Faqat title</title>")

    // Assert
    expect(found.title).toBe("Faqat title")
  })

  it("accepts a bare block of tags with no head around it", () => {
    // Arrange & Act — this is what people copy out of their own file.
    const found = parseHeadHtml(
      `<meta property="og:title" content="Salom">
       <meta property="og:description" content="Tavsif">`
    )

    // Assert
    expect(found.title).toBe("Salom")
    expect(found.description).toBe("Tavsif")
  })

  it("reads Open Graph written with name= instead of property=", () => {
    // Arrange & Act — invalid per the protocol, and Facebook reads it anyway,
    // so refusing it would be pedantically wrong about the visitor's own page.
    const found = parseHeadHtml('<meta name="og:title" content="Nomdan">')

    // Assert
    expect(found.title).toBe("Nomdan")
  })

  it("survives single quotes and reversed attribute order", () => {
    // Arrange & Act
    const found = parseHeadHtml(
      "<meta content='Teskari' property='og:description'>"
    )

    // Assert
    expect(found.description).toBe("Teskari")
  })

  it("drops a value the form's own options cannot express", () => {
    // Arrange & Act — importing `og:type=music.song` must not put the select
    // into a state it has no option for.
    const found = parseHeadHtml(`
      <meta property="og:type" content="music.song">
      <meta name="twitter:card" content="app">
      <meta property="og:locale" content="uz-UZ">`)

    // Assert — `uz-UZ` is also dropped: og:locale is `language_TERRITORY`.
    expect(found.type).toBeUndefined()
    expect(found.twitterCard).toBeUndefined()
    expect(found.locale).toBeUndefined()
  })

  it("keeps a valid type, card and locale", () => {
    // Arrange & Act
    const found = parseHeadHtml(`
      <meta property="og:type" content="article">
      <meta name="twitter:card" content="summary">
      <meta property="og:locale" content="uz_UZ">`)

    // Assert
    expect(found.type).toBe("article")
    expect(found.twitterCard).toBe("summary")
    expect(found.locale).toBe("uz_UZ")
  })

  it("falls back to the twitter: image when there is no og:image", () => {
    // Arrange & Act
    const found = parseHeadHtml(`
      <meta name="twitter:image" content="https://example.uz/x.png">
      <meta name="twitter:image:alt" content="Muqova">`)

    // Assert
    expect(found.image).toBe("https://example.uz/x.png")
    expect(found.imageAlt).toBe("Muqova")
  })

  it("returns nothing for markup that holds no meta tags", () => {
    // Arrange & Act
    const found = parseHeadHtml("<p>salom</p>")

    // Assert
    expect(countImported(found)).toBe(0)
  })

  it("does not execute or fetch anything in the pasted markup", () => {
    // Arrange & Act — `DOMParser` produces an inert document: no browsing
    // context, so no script runs and no `src` is requested.
    const found = parseHeadHtml(
      `<script>globalThis.__owned = true</script>
       <img src="https://example.uz/tracker.gif">
       <meta property="og:title" content="Xavfsiz">`
    )

    // Assert
    expect(found.title).toBe("Xavfsiz")
    expect((globalThis as { __owned?: boolean }).__owned).toBeUndefined()
  })
})
