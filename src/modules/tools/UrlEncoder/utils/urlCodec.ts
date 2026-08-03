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

/** A percent followed by two hex digits — the only shape an escape has. */
const ESCAPE = /%[0-9a-fA-F]{2}/

/**
 * Which direction the visitor almost certainly means.
 *
 * The first build made this a decision the visitor had to take BEFORE getting
 * an answer, and it showed: pasting an already-readable URL into decode mode
 * returns it unchanged, so the tool looked like it was doing nothing. A URL
 * tool should say what it thinks and let you disagree — the same call
 * latin-cyrillic made with its "Avto" direction.
 *
 * The rule is not a guess so much as an observation: text containing `%XX` has
 * been through an encoder, and text that has not cannot be decoded into
 * anything different.
 */
export const detectMode = (text: string): "encode" | "decode" =>
  ESCAPE.test(text) ? "decode" : "encode"

/**
 * Which of the two encodings a piece of text wants.
 *
 * A complete address — something with a scheme and a host — is almost never
 * meant to be flattened into a query value; someone pasting one wants their
 * link back with the spaces fixed. Anything else is a value.
 */
export const detectScope = (text: string): UrlScope => {
  const trimmed = text.trim()
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return "value"
  try {
    return new URL(trimmed).host ? "whole" : "value"
  } catch {
    return "value"
  }
}

/**
 * Still escaped after one pass — the classic `%2520` case.
 *
 * Double encoding happens whenever a URL is encoded by one layer and then by
 * another (a redirect parameter, a proxy, a form that posts its own action),
 * and it is the single most common thing a person cannot work out on their
 * own, because the output still looks like gibberish and nothing says why.
 */
export const isStillEncoded = (decoded: string) => ESCAPE.test(decoded)

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
