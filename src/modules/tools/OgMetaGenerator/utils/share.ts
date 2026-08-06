import { OG_TYPES, TWITTER_CARDS } from "../constants"
import type { MetaDraft, OgType, TwitterCard } from "../types"

/**
 * The draft, in the address bar.
 *
 * A share card is rarely a solo decision — someone writes the copy, someone
 * else owns the page — and until now the only way to pass a filled form to a
 * colleague was to describe it. The colour converter already does this with
 * `?c=`; this is the same idea over ten fields.
 *
 * Short keys, because the whole draft has to survive being pasted into a chat
 * client that wraps long URLs. Empty fields are omitted entirely, so a form
 * with a title alone produces `?t=…` and nothing else.
 */

const KEYS: Record<keyof MetaDraft, string> = {
  title: "t",
  description: "d",
  image: "img",
  imageAlt: "alt",
  url: "u",
  siteName: "s",
  type: "ty",
  locale: "loc",
  twitterCard: "c",
  twitterSite: "tw"
}

/** `""` when there is nothing to share, so the URL stays clean. */
export function encodeDraft(draft: MetaDraft): string {
  const params = new URLSearchParams()

  for (const [field, key] of Object.entries(KEYS) as [
    keyof MetaDraft,
    string
  ][]) {
    const value = draft[field].trim()
    if (value) params.set(key, value)
  }

  const query = params.toString()
  return query ? `?${query}` : ""
}

/**
 * Back out of a query string.
 *
 * The three fields chosen from a fixed list are validated rather than trusted:
 * a link carrying `ty=music.song` must not put the select into a state its own
 * options cannot express — the same rule the `<head>` importer follows.
 */
export function decodeDraft(search: string): Partial<MetaDraft> {
  const params = new URLSearchParams(search)
  const draft: Partial<MetaDraft> = {}

  const read = (field: keyof MetaDraft) => params.get(KEYS[field])?.trim() ?? ""

  for (const field of [
    "title",
    "description",
    "image",
    "imageAlt",
    "url",
    "siteName",
    "twitterSite"
  ] as const) {
    const value = read(field)
    if (value) draft[field] = value
  }

  const type = read("type")
  if (OG_TYPES.includes(type as OgType)) draft.type = type as OgType

  const card = read("twitterCard")
  if (TWITTER_CARDS.includes(card as TwitterCard)) {
    draft.twitterCard = card as TwitterCard
  }

  const locale = read("locale")
  if (/^[a-z]{2}_[A-Z]{2}$/.test(locale)) draft.locale = locale

  return draft
}
