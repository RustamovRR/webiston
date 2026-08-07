import { OG_TYPES, TWITTER_CARDS } from "../constants"
import type { MetaDraft, OgType, TwitterCard } from "../types"

/**
 * Reading an existing `<head>` back into the form.
 *
 * The gap every competitor fills with a server: metatags.io and opengraph.xyz
 * take a URL, fetch it and show you the tags you already have. Fetching an
 * arbitrary URL from our own server is a request-forgery surface that has to
 * be hardened (private addresses, redirects, timeouts, response size) — real
 * work, and a permanent one. Pasting the tags gets the same job done with no
 * server at all: nobody edits meta tags for a page they cannot open.
 *
 * `DOMParser` rather than regular expressions, because the input is real HTML
 * from someone's real site — attributes in any order, single quotes, extra
 * whitespace, self-closing or not. The document it produces is INERT: it has
 * no browsing context, so nothing in it is fetched and no script in it runs.
 * That is what makes parsing a stranger's markup safe here.
 */

/** `og:*` wins over the plain tags, because that is the precedence crawlers use. */
export function parseHeadHtml(html: string): Partial<MetaDraft> {
  if (!html.trim()) return {}

  const document = new DOMParser().parseFromString(html, "text/html")
  const found: Partial<MetaDraft> = {}

  const meta = (selector: string): string =>
    document.querySelector(selector)?.getAttribute("content")?.trim() ?? ""

  const property = (key: string) => meta(`meta[property="${key}"]`)
  const named = (key: string) => meta(`meta[name="${key}"]`)

  // Some sites write Open Graph with `name=` — invalid per the protocol, and
  // Facebook reads it anyway, so a tool that refuses to would be pedantically
  // wrong about the visitor's own page.
  const og = (key: string) => property(key) || named(key)

  const set = (field: keyof MetaDraft, value: string) => {
    if (value) Object.assign(found, { [field]: value })
  }

  set("title", og("og:title") || document.title.trim())
  set("description", og("og:description") || named("description"))
  set("image", og("og:image") || named("twitter:image"))
  set("imageAlt", og("og:image:alt") || named("twitter:image:alt"))
  set("siteName", og("og:site_name"))
  set("twitterSite", named("twitter:site"))

  const url =
    og("og:url") ||
    document.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
    ""
  set("url", url.trim())

  // Two fields are a CHOICE from a fixed list, so an unrecognised value is
  // dropped rather than written into the form — importing `og:type=music.song`
  // must not put the select into a state its own options cannot express.
  const type = og("og:type")
  if (OG_TYPES.includes(type as OgType)) set("type", type)

  const card = named("twitter:card")
  if (TWITTER_CARDS.includes(card as TwitterCard)) set("twitterCard", card)

  const locale = og("og:locale")
  if (/^[a-z]{2}_[A-Z]{2}$/.test(locale)) set("locale", locale)

  return found
}

/** How many fields the paste actually filled — the honest count to report. */
export function countImported(found: Partial<MetaDraft>): number {
  return Object.values(found).filter(Boolean).length
}
