import { describe, expect, it } from "vitest"

import { encodeBase64 } from "@/lib/utils"

import { decodeJwt, isUnsigned, readTiming } from "./jwt"

/**
 * Every case here is something the shipped tool got wrong. It read its two
 * segments with `JSON.parse(atob(part.replace(…)))` and reported one generic
 * "invalid token format" whenever any of it threw.
 */

/** Builds a real token out of claims, so no fixture can drift from its meaning. */
const makeToken = (
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  signature = "sig"
) =>
  [
    encodeBase64(JSON.stringify(header), true),
    encodeBase64(JSON.stringify(payload), true),
    signature
  ].join(".")

describe("decodeJwt", () => {
  it("reads a token whose claims are not ASCII", () => {
    // Arrange — `atob` returns Latin-1, so this came back as mojibake and
    // usually as a `JSON.parse` throw reported as "invalid format"
    const token = makeToken(
      { alg: "HS256", typ: "JWT" },
      { name: "Alisher Oʻtkirov", city: "Тошкент" }
    )

    // Act
    const result = decodeJwt(token)

    // Assert
    expect(result).toMatchObject({
      ok: true,
      token: { payload: { name: "Alisher Oʻtkirov", city: "Тошкент" } }
    })
  })

  it("keeps the signature as text and never tries to decode it", () => {
    // Arrange + Act
    const result = decodeJwt(makeToken({ alg: "HS256" }, { sub: "1" }, "abc"))

    // Assert
    expect(result).toMatchObject({ ok: true, token: { signature: "abc" } })
  })

  it("separates the three ways a token can be unreadable", () => {
    // Arrange + Act + Assert — all three used to print one sentence
    expect(decodeJwt("only.two")).toEqual({ ok: false, reason: "threeParts" })
    expect(decodeJwt("a.b.")).toEqual({ ok: false, reason: "threeParts" })
    expect(decodeJwt("!!!.eyJhIjoxfQ.sig")).toEqual({
      ok: false,
      reason: "notBase64",
      part: "header"
    })
    expect(
      decodeJwt(`${encodeBase64("not json", true)}.eyJhIjoxfQ.sig`)
    ).toEqual({ ok: false, reason: "notJson", part: "header" })
  })

  it("refuses a segment that parses to something other than an object", () => {
    // Arrange — `JSON.parse("123")` is a number, and the old code reported
    // `isValid: true` then read `.alg` off it
    const token = `${encodeBase64("123", true)}.${encodeBase64('{"a":1}', true)}.sig`

    // Act + Assert
    expect(decodeJwt(token)).toEqual({
      ok: false,
      reason: "notObject",
      part: "header"
    })
  })
})

describe("readTiming", () => {
  const now = new Date("2026-08-03T12:00:00Z")
  const nowSeconds = Math.floor(now.getTime() / 1000)

  it("says nothing rather than 'valid' when there is no exp", () => {
    // Arrange + Act — the old code returned `isExpired: false` here, which
    // reads as "checked, and fine" for a token that never expires
    const timing = readTiming({ sub: "1" }, now)

    // Assert
    expect(timing.isExpired).toBeNull()
    expect(timing.secondsUntilExpiry).toBeNull()
  })

  it("ignores a claim that is not a NumericDate", () => {
    // Arrange — issuers do emit strings; `now > "1700000000"` is a
    // lexicographic comparison that silently answers nonsense
    const timing = readTiming({ exp: "1700000000" }, now)

    // Assert
    expect(timing.expiresAt).toBeNull()
    expect(timing.isExpired).toBeNull()
  })

  it("treats exp: 0 as an expiry, not as an absent claim", () => {
    // Arrange + Act — zero is falsy, so the old `exp ? … : false` skipped it
    const timing = readTiming({ exp: 0 }, now)

    // Assert
    expect(timing.isExpired).toBe(true)
  })

  it("reports the remaining time", () => {
    // Arrange
    const timing = readTiming(
      { iat: nowSeconds - 300, exp: nowSeconds + 600 },
      now
    )

    // Assert
    expect(timing.secondsUntilExpiry).toBe(600)
    expect(timing.isExpired).toBe(false)
  })
})

describe("isUnsigned", () => {
  it("recognises the alg: none form in any casing", () => {
    // Arrange + Act + Assert — the oldest JWT attack there is
    expect(isUnsigned({ alg: "none" })).toBe(true)
    expect(isUnsigned({ alg: "NONE" })).toBe(true)
    expect(isUnsigned({ alg: "HS256" })).toBe(false)
    expect(isUnsigned({})).toBe(false)
  })
})
