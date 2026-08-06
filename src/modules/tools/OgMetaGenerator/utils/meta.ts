import type { MetaDraft, MetaTag, TagGroups } from "../types"

/**
 * Turning a filled-in form into meta tags.
 *
 * Two rules, and the code this replaces broke both.
 *
 * **Escape what goes into an attribute.** Every tag was built as
 * `content="${value}"` with no escaping at all, so a title containing a
 * straight quote — `React "Hooks" darslari` — produced
 * `content="React "Hooks" darslari"`, which ends the attribute after `React `
 * and leaves the rest as stray attributes on the element. An ampersand
 * (`Savol & javob`) is invalid markup for the same reason, and a `<`
 * anywhere in the text puts a tag inside a tag. This is a tool whose ONLY
 * output is HTML that somebody pastes into their `<head>`, so this was the
 * defect that mattered most.
 *
 * **Never invent a value.** The old generator emitted
 * `book:isbn content="978-0000000000"`, `profile:first_name content="First"`,
 * `music:duration content="240"`, `video:width content="1280"` and an
 * `article:published_time` set to the moment you pressed a key — none of which
 * the visitor was ever asked for, and all of which would have gone into a real
 * page as fact. A field that is empty produces no tag.
 */

/**
 * The five characters that cannot appear raw in a double-quoted attribute.
 *
 * `&` is replaced FIRST, otherwise the ampersands introduced by the later
 * replacements would themselves be escaped and `"` would become `&amp;quot;`.
 */
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Collapses the whitespace a pasted paragraph brings with it. */
function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

/**
 * The tags a draft produces, grouped the way they are written out.
 *
 * `og:image:alt` is its own field rather than a copy of the title. The old
 * tool wrote the title into it, or the literal string `"Image"` when there was
 * no title — alt text describes the picture, and a caption that repeats the
 * headline tells a screen-reader user nothing they did not just hear.
 */
export function buildTags(draft: MetaDraft): TagGroups {
  const title = clean(draft.title)
  const description = clean(draft.description)
  const image = draft.image.trim()
  const imageAlt = clean(draft.imageAlt)
  const url = draft.url.trim()
  const siteName = clean(draft.siteName)

  const basic: MetaTag[] = []
  const og: MetaTag[] = []
  const twitter: MetaTag[] = []

  const push = (list: MetaTag[], tag: MetaTag) => {
    if (tag.content) list.push(tag)
  }

  push(basic, { attribute: "name", key: "description", content: description })

  push(og, { attribute: "property", key: "og:type", content: draft.type })
  push(og, { attribute: "property", key: "og:title", content: title })
  push(og, {
    attribute: "property",
    key: "og:description",
    content: description
  })
  push(og, { attribute: "property", key: "og:url", content: url })
  push(og, { attribute: "property", key: "og:image", content: image })
  // Only alongside an image, and only if it was written.
  if (image) {
    push(og, { attribute: "property", key: "og:image:alt", content: imageAlt })
  }
  push(og, { attribute: "property", key: "og:site_name", content: siteName })
  push(og, { attribute: "property", key: "og:locale", content: draft.locale })

  push(twitter, {
    attribute: "name",
    key: "twitter:card",
    content: draft.twitterCard
  })
  push(twitter, {
    attribute: "name",
    key: "twitter:site",
    content: draft.twitterSite.trim()
  })
  // twitter:title / :description / :image are omitted on purpose when they
  // would only repeat the Open Graph values: X falls back to og:* by
  // specification, and duplicating them doubles what has to be kept in sync.
  if (title && !description) {
    push(twitter, { attribute: "name", key: "twitter:title", content: title })
  }

  return { basic, og, twitter }
}

/** `<title>` is an element, not a meta tag, so it is rendered separately. */
function renderTag(tag: MetaTag): string {
  return `<meta ${tag.attribute}="${tag.key}" content="${escapeAttribute(tag.content)}" />`
}

/**
 * The block to paste into `<head>`.
 *
 * Section comments only where a section exists — the old version printed
 * `<!-- Twitter Meta Tags -->` above nothing, and always appended
 * `robots`/`googlebot` tags nobody asked for. `googlebot` repeating `robots`
 * is redundant by Google's own documentation, and `index, follow` is the
 * default, so those three lines were noise inserted into someone else's page.
 */
export function renderHtml(draft: MetaDraft, groups: TagGroups): string {
  const title = clean(draft.title)
  const lines: string[] = []

  const section = (comment: string, tags: MetaTag[]) => {
    if (tags.length === 0) return
    if (lines.length > 0) lines.push("")
    lines.push(comment)
    lines.push(...tags.map(renderTag))
  }

  if (title) {
    lines.push(`<title>${escapeAttribute(title)}</title>`)
  }
  if (groups.basic.length > 0) {
    lines.push(...groups.basic.map(renderTag))
  }

  section("<!-- Open Graph -->", groups.og)
  section("<!-- Twitter -->", groups.twitter)

  const url = draft.url.trim()
  if (url) {
    lines.push("")
    lines.push(`<link rel="canonical" href="${escapeAttribute(url)}" />`)
  }

  return lines.join("\n")
}

/**
 * The same thing as a Next.js `metadata` export.
 *
 * This site is built on the App Router and so is a large part of who opens
 * this page, and hand-translating a block of `<meta>` tags into the
 * `openGraph` / `twitter` object shape is exactly the mechanical step worth
 * removing. Values go through `JSON.stringify`, which is the correct escape
 * for a JavaScript string literal — the HTML escaping above would be wrong
 * here, and this is why the two renderers are separate functions rather than
 * one with a flag.
 */
export function renderNextMetadata(draft: MetaDraft): string {
  const title = clean(draft.title)
  const description = clean(draft.description)
  const image = draft.image.trim()
  const imageAlt = clean(draft.imageAlt)
  const url = draft.url.trim()
  const siteName = clean(draft.siteName)

  const lines: string[] = ['import type { Metadata } from "next"', ""]
  const body: string[] = []

  const field = (name: string, value: string, indent = "  ") => {
    if (value) body.push(`${indent}${name}: ${JSON.stringify(value)},`)
  }

  field("title", title)
  field("description", description)

  const openGraph: string[] = []
  if (title) openGraph.push(`    title: ${JSON.stringify(title)},`)
  if (description) {
    openGraph.push(`    description: ${JSON.stringify(description)},`)
  }
  if (url) openGraph.push(`    url: ${JSON.stringify(url)},`)
  if (siteName) openGraph.push(`    siteName: ${JSON.stringify(siteName)},`)
  openGraph.push(`    type: ${JSON.stringify(draft.type)},`)
  if (draft.locale) {
    openGraph.push(`    locale: ${JSON.stringify(draft.locale)},`)
  }
  if (image) {
    openGraph.push("    images: [")
    openGraph.push("      {")
    openGraph.push(`        url: ${JSON.stringify(image)},`)
    if (imageAlt) openGraph.push(`        alt: ${JSON.stringify(imageAlt)},`)
    openGraph.push("      },")
    openGraph.push("    ],")
  }
  if (openGraph.length > 0) {
    body.push("  openGraph: {")
    body.push(...openGraph)
    body.push("  },")
  }

  const twitter: string[] = [`    card: ${JSON.stringify(draft.twitterCard)},`]
  if (draft.twitterSite.trim()) {
    twitter.push(`    site: ${JSON.stringify(draft.twitterSite.trim())},`)
  }
  body.push("  twitter: {")
  body.push(...twitter)
  body.push("  },")

  if (url) {
    body.push("  alternates: {")
    body.push(`    canonical: ${JSON.stringify(url)},`)
    body.push("  },")
  }

  lines.push("export const metadata: Metadata = {")
  lines.push(...body)
  lines.push("}")

  return lines.join("\n")
}
