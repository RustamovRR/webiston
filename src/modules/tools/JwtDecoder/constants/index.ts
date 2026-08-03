/**
 * Tool-scoped constants.
 *
 * The sample tokens are BUILT, not pasted. The three that shipped were fixed
 * strings with fixed `exp` claims — 1516242622 and 1700939022 — so by 2026 all
 * three read "expired", including the one labelled "Standard JWT". A tool
 * whose headline job is answering "is this token still valid" had no sample
 * that was.
 */

import { encodeBase64 } from "@/lib/utils"

import type { JsonObject } from "../types"

/** The samples offered, in the order they appear. */
export const SAMPLE_KEYS = ["valid", "expired", "unsigned"] as const

export type SampleKey = (typeof SAMPLE_KEYS)[number]

const HOUR = 60 * 60

/**
 * A token is three base64url segments. The signature here is a placeholder and
 * says so: this tool does not verify signatures (see the FAQ), so producing a
 * real one would suggest a guarantee the page cannot make.
 */
const buildToken = (header: JsonObject, payload: JsonObject) =>
  [
    encodeBase64(JSON.stringify(header), true),
    encodeBase64(JSON.stringify(payload), true),
    "not-a-real-signature"
  ].join(".")

/** `now` is passed in so the samples are honest about the current time. */
export const buildSamples = (now: Date): Record<SampleKey, string> => {
  const seconds = Math.floor(now.getTime() / 1000)

  const base: JsonObject = {
    sub: "1234567890",
    name: "Alisher Oʻtkirov",
    iss: "webiston.uz",
    aud: "webiston-app"
  }

  return {
    valid: buildToken(
      { alg: "HS256", typ: "JWT" },
      { ...base, iat: seconds - HOUR, exp: seconds + 23 * HOUR }
    ),
    expired: buildToken(
      { alg: "RS256", typ: "JWT", kid: "2026-01" },
      { ...base, iat: seconds - 48 * HOUR, exp: seconds - 24 * HOUR }
    ),
    // The oldest JWT attack there is, so the tool should be able to show one.
    unsigned: buildToken(
      { alg: "none", typ: "JWT" },
      { ...base, role: "admin", iat: seconds - HOUR }
    )
  }
}

/** Files a token can arrive in. Bigger than this is not a token. */
export const SUPPORTED_FILE_TYPES = ["text/plain", "application/json"]

/**
 * A JWT is a header, a payload and a signature in a URL — 8 KB is where
 * servers stop accepting one, so anything past it is not a token.
 */
export const MAX_FILE_BYTES = 64 * 1024

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = ["what", "verify", "expiry", "privacy"] as const
