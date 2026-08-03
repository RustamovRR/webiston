import type { CodecResult, QueryPair, UrlScope } from "../types"

/**
 * URL encoding, as the two standards it actually is.
 *
 * The tool this replaces offered one button and ran `encodeURIComponent` over
 * whatever was in the box. That function escapes `:` `/` `?` `&` `=` — which is
 * exactly right for a query VALUE and destroys a whole URL. Its own sample was
 * `https://webiston.uz/search?q=hello world&lang=uz`, so the headline demo
 * produced:
 *
 *     https%3A%2F%2Fwebiston.uz%2Fsearch%3Fq%3Dhello%20world%26lang%3Duz
 *
 * ...a string that is only useful if you are embedding that URL inside another
 * URL. Somebody who came to fix the space in their link got something
 * unusable, and the page never said which of the two jobs it was doing.
 *
 * The other half of the same mistake was on the way back: form submissions
 * encode a space as `+`, and `decodeURIComponent("a+b")` returns `"a+b"`. Every
 * query string copied out of a browser address bar decoded wrong, silently.
 *
 * So `scope` is not a preference. `value` is
 * `application/x-www-form-urlencoded` — a single query value or path segment,
 * where `+` means space and a literal plus must be `%2B`. `whole` is
 * `encodeURI` — a complete URL, where the structural characters stay put.
 */

/** A megabyte of text is not a URL; past this the page just stops responding. */
export const MAX_INPUT_LENGTH = 1024 * 1024

const encodeValue = (text: string) => encodeURIComponent(text)

const encodeWhole = (text: string) => encodeURI(text)

/**
 * `+` is a space in form-encoded data, so it has to be turned into `%20`
 * BEFORE decoding — decoding first would leave a literal plus that the caller
 * can no longer tell apart from an encoded one.
 */
const decodeValue = (text: string) =>
  decodeURIComponent(text.replace(/\+/g, "%20"))

const decodeWhole = (text: string) => decodeURI(text)

export const convert = (
  text: string,
  mode: "encode" | "decode",
  scope: UrlScope
): CodecResult => {
  if (text.length > MAX_INPUT_LENGTH) return { ok: false, reason: "tooLong" }

  try {
    if (mode === "encode") {
      return {
        ok: true,
        output: scope === "value" ? encodeValue(text) : encodeWhole(text)
      }
    }
    return {
      ok: true,
      output: scope === "value" ? decodeValue(text) : decodeWhole(text)
    }
  } catch {
    // `URIError` — a lone `%` or a `%` followed by something that is not two
    // hex digits. The only way decoding can fail.
    return { ok: false, reason: "malformed" }
  }
}

/**
 * The query string, split into pairs and decoded.
 *
 * `URLSearchParams` is the parser, not a hand-rolled `split("&")`: it already
 * knows that `+` is a space, that a key can repeat, and that a pair can have no
 * `=` at all. `extractQueryParams` in `lib/utils` returns a plain object, which
 * silently drops repeated keys — and repeated keys are the normal shape of
 * `?tag=a&tag=b`, so this returns a list instead.
 */
export const readQuery = (search: string): QueryPair[] => {
  if (!search) return []
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  )
  return [...params].map(([key, value]) => ({ key, value }))
}
