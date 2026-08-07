/** Why a decode could not happen — each maps to one translated sentence. */
export type Base64Failure = "empty" | "alphabet" | "length" | "binary"

export type DecodeResult =
  | { ok: true; text: string; byteCount: number }
  | { ok: false; reason: Base64Failure }

/**
 * Base64, as bytes rather than as characters.
 *
 * In `lib/utils` at its SECOND consumer: the Base64 converter builds on it and
 * the JWT decoder needs exactly the same thing — a JWT's three parts are
 * base64url, and decoding them with a bare `atob` is how that tool turned a
 * token carrying a non-ASCII `name` claim into mojibake or an "invalid
 * format" error.
 *
 * What this replaces was `btoa(unescape(encodeURIComponent(text)))` and its
 * mirror. That pair is the classic workaround for `btoa` being Latin-1 only,
 * and it does produce the right answer — but `escape`/`unescape` are Annex B
 * legacy, kept alive only for the web that already shipped. `TextEncoder`
 * states the actual intent: text in, UTF-8 bytes out, and the encoder is the
 * one thing that knows how.
 *
 * Three defects fall out of doing it properly:
 *
 * - **`String.fromCharCode(...bytes)` blows the stack.** The tool accepts a
 *   10 MB upload; spreading ten million arguments into a call is an engine
 *   limit, not a slow path. Chunked at 32 KB.
 * - **base64url was rejected.** The alphabet swaps `+/` for `-_` and usually
 *   drops the padding — it is what JWTs, URL parameters and most modern APIs
 *   emit, and this site ships a JWT decoder that produces exactly that.
 * - **Invalid UTF-8 came back as mojibake.** `escape`-based decoding maps any
 *   byte to some character, so decoding a PNG produced pages of garbage that
 *   looked like a successful conversion. A fatal `TextDecoder` says "these
 *   bytes are not text" instead of pretending.
 */

/** `String.fromCharCode` takes arguments, and an engine caps how many. */
const CHUNK_SIZE = 0x8000

const bytesToBinary = (bytes: Uint8Array): string => {
  let binary = ""
  for (let index = 0; index < bytes.length; index += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(index, index + CHUNK_SIZE))
  }
  return binary
}

const binaryToBytes = (binary: string): Uint8Array => {
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

/** The URL-safe alphabet, mapped back onto the standard one. */
const fromUrlAlphabet = (value: string) =>
  value.replace(/-/g, "+").replace(/_/g, "/")

const toUrlAlphabet = (value: string) =>
  value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

/**
 * Bytes an input actually occupies once encoded — NOT `value.length`.
 *
 * The footer read `output.length / 1024` and called it KB. A JavaScript string
 * is UTF-16 code units, so every Uzbek `oʻ`, every Cyrillic letter and every
 * emoji was counted as one "byte" while it costs two to four. The same mistake
 * was already found and fixed in the JSON formatter.
 */
export const byteLength = (value: string): number =>
  new TextEncoder().encode(value).length

export const encodeBase64 = (text: string, urlSafe = false): string => {
  const encoded = btoa(bytesToBinary(new TextEncoder().encode(text)))
  return urlSafe ? toUrlAlphabet(encoded) : encoded
}

/** Encodes bytes that are already bytes — an uploaded file, not text. */
export const encodeBytes = (bytes: Uint8Array, urlSafe = false): string => {
  const encoded = btoa(bytesToBinary(bytes))
  return urlSafe ? toUrlAlphabet(encoded) : encoded
}

const fail = (reason: Base64Failure): DecodeResult => ({ ok: false, reason })

/**
 * `data:image/png;base64,iVBOR…` → `iVBOR…`
 *
 * A data URI is the shape base64 most often arrives in — copied out of a
 * stylesheet, an `<img src>` or devtools — and pasting one into a decoder is
 * the obvious thing to try. Rejecting it on the alphabet rule would be
 * technically correct and useless.
 */
const stripDataUri = (value: string) =>
  value.replace(/^data:[^;,]*(;[^;,]+)*;base64,/i, "")

/**
 * Decode, with a REASON when it cannot.
 *
 * The old validator was `/^[A-Za-z0-9+/]*={0,2}$/`, which passes anything of
 * any length — `"A"` included, a string no base64 encoder can ever produce —
 * and then let `atob` throw so the catch could report a generic error. Length
 * is checked here because it is the one rule that catches a truncated paste,
 * which is the commonest real failure.
 */
export const decodeBase64 = (value: string): DecodeResult => {
  const compact = fromUrlAlphabet(
    stripDataUri(value.trim()).replace(/\s+/g, "")
  )
  if (compact.length === 0) return fail("empty")

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) return fail("alphabet")

  // A group is four characters standing for three bytes. A remainder of one
  // cannot occur, so it is always a truncated or corrupted string.
  const remainder = compact.length % 4
  if (remainder === 1) return fail("length")
  const padded = remainder === 0 ? compact : compact + "=".repeat(4 - remainder)

  let bytes: Uint8Array
  try {
    bytes = binaryToBytes(atob(padded))
  } catch {
    return fail("alphabet")
  }

  try {
    return {
      ok: true,
      text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      byteCount: bytes.length
    }
  } catch {
    // Valid base64, but the bytes are not UTF-8 text — an image, a zip, a key.
    return fail("binary")
  }
}
