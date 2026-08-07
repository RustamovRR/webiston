import { describe, expect, it } from "vitest"

import type { MetaDraft } from "../types"
import {
  buildTags,
  escapeAttribute,
  renderHtml,
  renderNextMetadata
} from "./meta"
import { validateDraft } from "./validate"

const EMPTY: MetaDraft = {
  title: "",
  description: "",
  image: "",
  imageAlt: "",
  url: "",
  siteName: "",
  type: "website",
  locale: "uz_UZ",
  twitterCard: "summary_large_image",
  twitterSite: ""
}

const FILLED: MetaDraft = {
  ...EMPTY,
  title: "React darslari",
  description: "React'ni noldan o'rganish",
  image: "https://webiston.uz/og.png",
  imageAlt: "Webiston logotipi",
  url: "https://webiston.uz/books/react",
  siteName: "Webiston"
}

describe("escapeAttribute", () => {
  it("escapes every character that can end a double-quoted attribute", () => {
    // Arrange & Act & Assert — the shipped generator did none of this, so a
    // title with a straight quote produced markup that ends the attribute
    // early and turns the rest of the headline into stray attributes.
    expect(escapeAttribute('React "Hooks" darslari')).toBe(
      "React &quot;Hooks&quot; darslari"
    )
    expect(escapeAttribute("Savol & javob")).toBe("Savol &amp; javob")
    expect(escapeAttribute("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    )
  })

  it("escapes the ampersand first, so no entity is double-escaped", () => {
    // Arrange & Act & Assert — replacing `"` before `&` yields `&amp;quot;`,
    // which renders the literal text `&quot;` on the page.
    expect(escapeAttribute('a & "b"')).toBe("a &amp; &quot;b&quot;")
  })
})

describe("buildTags", () => {
  it("produces no tag for a field that was left empty", () => {
    // Arrange & Act
    const groups = buildTags(EMPTY)

    // Assert — only the two values that always exist because they are chosen
    // from a fixed list: og:type, og:locale and twitter:card.
    expect(groups.basic).toHaveLength(0)
    expect(groups.og.map((tag) => tag.key)).toEqual(["og:type", "og:locale"])
    expect(groups.twitter.map((tag) => tag.key)).toEqual(["twitter:card"])
  })

  it("invents nothing for a type with properties of its own", () => {
    // Arrange & Act — the old generator answered `og:type = book` with
    // `book:isbn content="978-0000000000"`, and `profile` with
    // `profile:first_name content="First"`.
    const book = buildTags({ ...FILLED, type: "book" })
    const article = buildTags({ ...FILLED, type: "article" })

    // Assert
    const keys = [...book.og, ...article.og].map((tag) => tag.key)
    expect(keys.some((key) => key.startsWith("book:"))).toBe(false)
    expect(keys.some((key) => key.startsWith("article:"))).toBe(false)
  })

  it("emits og:image:alt only when there is both an image and an alt", () => {
    // Arrange & Act
    const withAlt = buildTags(FILLED)
    const withoutAlt = buildTags({ ...FILLED, imageAlt: "" })
    const noImage = buildTags({ ...FILLED, image: "", imageAlt: "Alt" })

    // Assert — the old tool filled alt with the TITLE, or the literal "Image".
    expect(withAlt.og.map((t) => t.key)).toContain("og:image:alt")
    expect(withoutAlt.og.map((t) => t.key)).not.toContain("og:image:alt")
    expect(noImage.og.map((t) => t.key)).not.toContain("og:image:alt")
  })
})

describe("renderHtml", () => {
  it("escapes the value it puts in the attribute", () => {
    // Arrange
    const draft = { ...FILLED, title: 'React "Hooks" & Context' }

    // Act
    const html = renderHtml(draft, buildTags(draft))

    // Assert
    expect(html).toContain(
      '<meta property="og:title" content="React &quot;Hooks&quot; &amp; Context" />'
    )
    expect(html).not.toContain('content="React "Hooks"')
  })

  it("writes no section heading for a section with no tags", () => {
    // Arrange & Act — the old output printed `<!-- Twitter Meta Tags -->`
    // above nothing and always appended robots/googlebot lines nobody asked
    // for.
    const html = renderHtml(EMPTY, buildTags(EMPTY))

    // Assert
    expect(html).not.toContain("robots")
    expect(html).not.toContain("googlebot")
    expect(html).not.toContain("<!-- Basic")
    expect(html).not.toContain("<title>")
    // What is left is only what a fixed-list control guarantees.
    expect(html.split("\n").filter((line) => line.trim())).toEqual([
      "<!-- Open Graph -->",
      '<meta property="og:type" content="website" />',
      '<meta property="og:locale" content="uz_UZ" />',
      "<!-- Twitter -->",
      '<meta name="twitter:card" content="summary_large_image" />'
    ])
  })

  it("collapses the whitespace a pasted paragraph carries", () => {
    // Arrange
    const draft = { ...FILLED, description: "  bir\n\n  ikki  " }

    // Act
    const html = renderHtml(draft, buildTags(draft))

    // Assert
    expect(html).toContain('content="bir ikki"')
  })
})

describe("renderNextMetadata", () => {
  it("emits a Metadata object with the values in place", () => {
    // Arrange & Act
    const code = renderNextMetadata(FILLED)

    // Assert
    expect(code).toContain('import type { Metadata } from "next"')
    expect(code).toContain('title: "React darslari"')
    expect(code).toContain('canonical: "https://webiston.uz/books/react"')
    expect(code).toContain('alt: "Webiston logotipi"')
  })

  it("escapes for JavaScript, not for HTML", () => {
    // Arrange — the same value in the two renderers must come out differently;
    // `&quot;` inside a TS string literal would be pasted into the page
    // verbatim.
    const draft = { ...FILLED, title: 'React "Hooks"' }

    // Act
    const code = renderNextMetadata(draft)

    // Assert
    expect(code).toContain('title: "React \\"Hooks\\""')
    expect(code).not.toContain("&quot;")
  })
})

describe("validateDraft", () => {
  it("calls a relative image URL an error, which is the commonest defect", () => {
    // Arrange & Act — `/og.png` resolves against the crawler's host, not the
    // author's, so the card silently has no picture.
    const issues = validateDraft(
      { ...FILLED, image: "/og.png" },
      { status: "idle" }
    )

    // Assert
    expect(issues).toContainEqual({ level: "error", key: "imageRelative" })
  })

  it("reads the real dimensions rather than trusting the field", () => {
    // Arrange & Act
    const small = validateDraft(FILLED, {
      status: "ready",
      width: 120,
      height: 90
    })
    const square = validateDraft(FILLED, {
      status: "ready",
      width: 800,
      height: 800
    })
    const ideal = validateDraft(FILLED, {
      status: "ready",
      width: 1200,
      height: 630
    })

    // Assert
    expect(small.map((i) => i.key)).toContain("imageTooSmall")
    expect(square.map((i) => i.key)).toContain("imageRatio")
    expect(ideal.map((i) => i.key)).not.toContain("imageRatio")
  })

  it("flags a large card that has no image to be large with", () => {
    // Arrange & Act
    const issues = validateDraft({ ...FILLED, image: "" }, { status: "idle" })

    // Assert
    expect(issues.map((i) => i.key)).toContain("largeCardNoImage")
  })

  it("says nothing about a draft that is right", () => {
    // Arrange & Act
    const issues = validateDraft(FILLED, {
      status: "ready",
      width: 1200,
      height: 630
    })

    // Assert
    expect(issues).toEqual([])
  })
})
