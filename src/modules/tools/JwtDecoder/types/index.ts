/** A JSON object, without `any`. Claim values are whatever the issuer put in. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type JsonObject = { [key: string]: JsonValue }

/** Why a token could not be read — each maps to one translated sentence. */
export type JwtFailure = "threeParts" | "notBase64" | "notJson" | "notObject"

export interface DecodedJwt {
  header: JsonObject
  payload: JsonObject
  /** The third segment, verbatim. Never decoded — it is bytes, not text. */
  signature: string
}

export type JwtResult =
  | { ok: true; token: DecodedJwt }
  | { ok: false; reason: JwtFailure; part?: "header" | "payload" }

/**
 * A registered claim the tool can say something about, once it has been
 * checked to be the type RFC 7519 says it is.
 */
export interface TimeClaim {
  /** Seconds since the epoch, as the token states it. */
  seconds: number
  date: Date
}

export interface TokenTiming {
  issuedAt: TimeClaim | null
  expiresAt: TimeClaim | null
  notBefore: TimeClaim | null
  /** `null` when the token carries no `exp` — absent is not the same as valid. */
  isExpired: boolean | null
  isNotYetValid: boolean | null
  /** Seconds until `exp` (negative once past). `null` without an `exp`. */
  secondsUntilExpiry: number | null
  /** Total seconds between `iat` and `exp`, when both are present. */
  lifetimeSeconds: number | null
}

/** Why a file could not be read — same treatment as a decode failure. */
export type FileFailure = "tooLarge" | "unsupported" | "unreadable"
