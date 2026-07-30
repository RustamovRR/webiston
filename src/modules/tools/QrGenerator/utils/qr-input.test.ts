import { describe, expect, it } from "vitest"
import type { QrCustomization } from "../types"
import { buildQrUrl, detectInputType } from "./qr-input"

const custom: Pick<
  QrCustomization,
  "margin" | "foregroundColor" | "backgroundColor"
> = {
  margin: 4,
  foregroundColor: "#000000",
  backgroundColor: "#ffffff"
}

describe("detectInputType", () => {
  it("recognises each payload kind", () => {
    expect(detectInputType("https://webiston.uz")).toBe("url")
    expect(detectInputType("http://webiston.uz")).toBe("url")
    expect(detectInputType("mailto:a@b.uz")).toBe("email")
    expect(detectInputType("a@b.uz")).toBe("email")
    expect(detectInputType("tel:+998901234567")).toBe("phone")
    expect(detectInputType("+998 90 123 45 67")).toBe("phone")
    expect(detectInputType("sms:+998901234567")).toBe("sms")
    expect(detectInputType("WIFI:S:net;T:WPA;P:pw;;")).toBe("wifi")
    expect(detectInputType("BEGIN:VCARD\nEND:VCARD")).toBe("vcard")
    expect(detectInputType("geo:41.3,69.2")).toBe("location")
  })

  it("is case-insensitive on the scheme", () => {
    expect(detectInputType("HTTPS://webiston.uz")).toBe("url")
    expect(detectInputType("MailTo:a@b.uz")).toBe("email")
  })

  // REGRESSION — the old version trimmed only for the empty check and then
  // tested the RAW string, so a value pasted with a leading space (the most
  // common way a URL arrives from a clipboard) fell through to "text".
  it("classifies correctly despite surrounding whitespace", () => {
    expect(detectInputType(" https://webiston.uz")).toBe("url")
    expect(detectInputType("https://webiston.uz\n")).toBe("url")
    expect(detectInputType("  a@b.uz  ")).toBe("email")
  })

  it("reports empty for blank input", () => {
    expect(detectInputType("")).toBe("empty")
    expect(detectInputType("   ")).toBe("empty")
    expect(detectInputType("\n\t")).toBe("empty")
  })

  it("falls back to text for anything unrecognised", () => {
    expect(detectInputType("just some words")).toBe("text")
    expect(detectInputType("12345")).toBe("text") // too short for a phone
  })

  it("prefers email over phone for a digits-only address", () => {
    // Order-dependent: the phone pattern would also accept "1234567".
    expect(detectInputType("1234567@example.uz")).toBe("email")
  })
})

describe("buildQrUrl", () => {
  it("returns empty string for blank input rather than requesting a blank QR", () => {
    expect(buildQrUrl("", 200, "M", custom)).toBe("")
    expect(buildQrUrl("   ", 200, "M", custom)).toBe("")
  })

  it("encodes size as WIDTHxHEIGHT and passes the error level through", () => {
    const url = new URL(buildQrUrl("hello", 300, "H", custom))
    expect(url.searchParams.get("size")).toBe("300x300")
    expect(url.searchParams.get("ecc")).toBe("H")
    expect(url.searchParams.get("format")).toBe("png")
  })

  it("strips the leading '#' from colours — the service wants bare hex", () => {
    const url = new URL(buildQrUrl("hello", 200, "M", custom))
    expect(url.searchParams.get("color")).toBe("000000")
    expect(url.searchParams.get("bgcolor")).toBe("ffffff")
  })

  it("percent-encodes the payload so it cannot break the query string", () => {
    const payload = "https://x.uz/?a=1&b=2#frag"
    const url = new URL(buildQrUrl(payload, 200, "M", custom))
    // The round-trip is what matters: whatever escaping is used, the service
    // must receive the payload byte-for-byte.
    expect(url.searchParams.get("data")).toBe(payload)
  })

  it("keeps multi-line payloads intact", () => {
    const vcard = "BEGIN:VCARD\nFN:Ali\nEND:VCARD"
    const url = new URL(buildQrUrl(vcard, 200, "M", custom))
    expect(url.searchParams.get("data")).toBe(vcard)
  })
})
