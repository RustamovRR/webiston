import { describe, expect, it } from "vitest"
import { detectInputType } from "./qr-input"

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
