import { describe, expect, it } from "vitest"

import { byteLength, decodeBase64, encodeBase64, encodeBytes } from "./base64"

/**
 * Every case here is something the shipped tool got wrong, or a property the
 * replacement has to keep. The old implementation ran on `escape`/`unescape`
 * and a validator that accepted any string of any length.
 */

describe("encodeBase64", () => {
  it("encodes UTF-8, not Latin-1", () => {
    // Arrange
    const input = "Assalomu alaykum, Webiston!"

    // Act
    const result = encodeBase64(input)

    // Assert — pinned against the value the tool has always shown
    expect(result).toBe("QXNzYWxvbXUgYWxheWt1bSwgV2ViaXN0b24h")
  })

  it("round-trips Uzbek, Cyrillic and an emoji", () => {
    // Arrange — `btoa` alone throws on every one of these
    const input = "Oʻzbekiston · Ўзбекистон · 🇺🇿"

    // Act
    const decoded = decodeBase64(encodeBase64(input))

    // Assert
    expect(decoded).toEqual({
      ok: true,
      text: input,
      byteCount: byteLength(input)
    })
  })

  it("emits the URL-safe alphabet on request, unpadded", () => {
    // Arrange — `?~~~?` encodes to a value containing both + and /
    const input = "~~~?>>>???"

    // Act
    const standard = encodeBase64(input)
    const urlSafe = encodeBase64(input, true)

    // Assert
    expect(standard).toMatch(/[+/]/)
    expect(urlSafe).not.toMatch(/[+/=]/)
    expect(decodeBase64(urlSafe)).toMatchObject({ ok: true, text: input })
  })

  it("survives an input far past the argument limit", () => {
    // Arrange — `String.fromCharCode(...bytes)` throws RangeError well below
    // this, and the tool accepts a 10 MB upload
    const bytes = new Uint8Array(500_000).fill(65)

    // Act
    const encoded = encodeBytes(bytes)

    // Assert
    expect(encoded.length).toBe(Math.ceil(500_000 / 3) * 4)
  })
})

describe("decodeBase64", () => {
  it("accepts the base64url a JWT is made of", () => {
    // Arrange — the shipped validator was /^[A-Za-z0-9+/]*={0,2}$/, so every
    // `-` or `_` reported "invalid Base64 format". This site ships a JWT
    // decoder that emits exactly this alphabet.
    const payload = encodeBase64('{"sub":"1234567890"}', true)

    // Act
    const result = decodeBase64(payload)

    // Assert
    expect(result).toMatchObject({ ok: true, text: '{"sub":"1234567890"}' })
  })

  it("ignores whitespace, including the newlines a MIME payload carries", () => {
    // Arrange
    const wrapped = "QXNzYWxvbXUgYWxh\n  eWt1bSwgV2ViaXN0\tb24h"

    // Act + Assert
    expect(decodeBase64(wrapped)).toMatchObject({
      ok: true,
      text: "Assalomu alaykum, Webiston!"
    })
  })

  it("rejects a length no encoder can produce", () => {
    // Arrange — four characters stand for three bytes, so a remainder of one
    // is always a truncated paste. The old validator passed this and let
    // `atob` throw a generic error.
    const result = decodeBase64("QQQQQ")

    // Assert
    expect(result).toEqual({ ok: false, reason: "length" })
  })

  it("names the alphabet as the problem when a character is not base64", () => {
    // Arrange + Act
    const result = decodeBase64("QXNzYWxvbXU$")

    // Assert
    expect(result).toEqual({ ok: false, reason: "alphabet" })
  })

  it("says 'not text' instead of returning mojibake", () => {
    // Arrange — valid base64 of bytes that are not UTF-8 (a PNG header)
    const png = encodeBytes(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0xff]))

    // Act
    const result = decodeBase64(png)

    // Assert — `escape`-based decoding mapped every byte to some character and
    // showed pages of garbage as a successful conversion
    expect(result).toEqual({ ok: false, reason: "binary" })
  })

  it("treats an all-whitespace input as empty, not as an error", () => {
    // Arrange + Act + Assert
    expect(decodeBase64("   \n ")).toEqual({ ok: false, reason: "empty" })
  })
})

describe("byteLength", () => {
  it("counts bytes, not UTF-16 code units", () => {
    // Arrange — the footer divided `output.length` by 1024 and called it KB
    // Act + Assert
    expect("Ўзбекистон".length).toBe(10)
    expect(byteLength("Ўзбекистон")).toBe(20)
    expect(byteLength("🇺🇿")).toBe(8)
  })
})
