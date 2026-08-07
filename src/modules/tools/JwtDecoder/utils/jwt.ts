import { decodeBase64 } from "@/lib/utils"

import type {
  DecodedJwt,
  JsonObject,
  JwtResult,
  TimeClaim,
  TokenTiming
} from "../types"

/**
 * Reading a JWT, as a pure function.
 *
 * What this replaces lived inside a `useMemo` and did
 * `JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")))` twice. Three
 * things wrong with that line:
 *
 * - **`atob` returns Latin-1.** A token whose `name` claim holds `Alisher` is
 *   fine; one holding `Alishеr` in Cyrillic, or any Uzbek `oʻ`, came back as
 *   mojibake — and often as a `JSON.parse` throw, which the catch reported as
 *   "invalid token format" for a token that was perfectly valid.
 * - **No padding.** JWT segments are base64url with the padding stripped, so
 *   whether `atob` accepts one depends on its length modulo four.
 * - **One catch for three different failures.** "Not three parts", "not
 *   base64" and "not JSON" are things a developer can act on differently, and
 *   they all printed the same sentence.
 *
 * `decodeBase64` from `lib/utils` handles the alphabet, the padding and the
 * UTF-8. This file is only the JWT-shaped part.
 */

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readSegment = (
  segment: string,
  part: "header" | "payload"
): { ok: true; value: JsonObject } | Extract<JwtResult, { ok: false }> => {
  const decoded = decodeBase64(segment)
  if (!decoded.ok) return { ok: false, reason: "notBase64", part }

  let parsed: unknown
  try {
    parsed = JSON.parse(decoded.text)
  } catch {
    return { ok: false, reason: "notJson", part }
  }

  // `JSON.parse("123")` is a number, and the old code happily reported
  // `isValid: true` for it, then read `.alg` off a number.
  if (!isJsonObject(parsed)) return { ok: false, reason: "notObject", part }
  return { ok: true, value: parsed }
}

export const decodeJwt = (token: string): JwtResult => {
  const parts = token.trim().split(".")
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return { ok: false, reason: "threeParts" }
  }

  const header = readSegment(parts[0], "header")
  if (!header.ok) return header

  const payload = readSegment(parts[1], "payload")
  if (!payload.ok) return payload

  return {
    ok: true,
    token: {
      header: header.value,
      payload: payload.value,
      // Left as text on purpose: a signature is bytes over a MAC or a curve,
      // not a string, and rendering it as one would be a lie.
      signature: parts[2]
    }
  }
}

/**
 * A registered time claim, only if it is the type RFC 7519 says it is.
 *
 * `exp`, `iat` and `nbf` are NumericDate — a JSON number of seconds. Issuers
 * do emit strings; the old code compared `now > exp` regardless, which for a
 * string is a lexicographic comparison that silently answers nonsense. And it
 * treated `exp: 0` as "no expiry" because zero is falsy.
 */
const readTimeClaim = (value: unknown): TimeClaim | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return { seconds: value, date: new Date(value * 1000) }
}

/** `now` is injected so the read is testable and the memo can be pinned. */
export const readTiming = (payload: JsonObject, now: Date): TokenTiming => {
  const issuedAt = readTimeClaim(payload.iat)
  const expiresAt = readTimeClaim(payload.exp)
  const notBefore = readTimeClaim(payload.nbf)
  const nowSeconds = Math.floor(now.getTime() / 1000)

  return {
    issuedAt,
    expiresAt,
    notBefore,
    // `null`, not `false`: a token with no `exp` never expires, and saying
    // "not expired" about it reads as "checked, and fine".
    isExpired: expiresAt ? nowSeconds >= expiresAt.seconds : null,
    isNotYetValid: notBefore ? nowSeconds < notBefore.seconds : null,
    secondsUntilExpiry: expiresAt ? expiresAt.seconds - nowSeconds : null
  }
}

/**
 * The registered claims, in the order RFC 7519 lists them, so the summary can
 * name them and the rest of the payload can be shown as "everything else".
 */
export const REGISTERED_CLAIMS = [
  "iss",
  "sub",
  "aud",
  "exp",
  "nbf",
  "iat",
  "jti"
] as const

/**
 * `alg: "none"` is the unsigned form. It is legal in the spec and it is also
 * the oldest JWT attack there is: strip the signature, set `alg` to `none`,
 * and a verifier that trusts the header accepts anything. Worth saying out
 * loud on a page a developer is looking at a token on.
 */
export const isUnsigned = (header: JsonObject): boolean =>
  typeof header.alg === "string" && header.alg.toLowerCase() === "none"
