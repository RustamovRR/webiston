import { describe, expect, it } from "vitest"

import { FREEIPAPI, IPWHOIS } from "./providers"

/**
 * Payloads captured from the live endpoints on 2026-08-06, trimmed to the
 * fields the parsers read. Fixtures rather than network calls: a test that
 * fails because someone's free quota ran out is not testing our code.
 */

const IPWHOIS_PAYLOAD = {
  ip: "1.1.1.1",
  success: true,
  type: "IPv4",
  continent: "Oceania",
  continent_code: "OC",
  country: "Australia",
  country_code: "AU",
  region: "Queensland",
  city: "Brisbane",
  latitude: -27.4675408,
  longitude: 153.028092,
  is_eu: false,
  postal: "4000",
  calling_code: "61",
  flag: { emoji: "🇦🇺" },
  connection: {
    asn: 13335,
    org: "Cloudflare, Inc.",
    isp: "Cloudflare, Inc.",
    domain: "cloudflare.com"
  },
  timezone: { id: "Australia/Brisbane", utc: "+10:00" }
}

describe("the ipwho.is parser", () => {
  it("reads every field the page shows", () => {
    // Arrange / Act
    const result = IPWHOIS.parse(IPWHOIS_PAYLOAD)

    // Assert
    expect(result).not.toBeNull()
    expect(result?.city).toBe("Brisbane")
    expect(result?.asn).toBe(13335)
    expect(result?.isp).toBe("Cloudflare, Inc.")
    expect(result?.domain).toBe("cloudflare.com")
    expect(result?.timezone).toBe("Australia/Brisbane")
    expect(result?.source).toBe("ipwho.is")
  })

  it("rejects the 200-with-success-false answer", () => {
    // The endpoint answers HTTP 200 for a bad address and flags it in the
    // body, so status alone is not the check.
    expect(IPWHOIS.parse({ success: false, message: "invalid IP" })).toBeNull()
  })

  it("rejects a non-object payload", () => {
    expect(IPWHOIS.parse("not json")).toBeNull()
    expect(IPWHOIS.parse(null)).toBeNull()
  })

  it("turns a missing field into null, not an empty string", () => {
    // Arrange — a payload with no connection block at all.
    const result = IPWHOIS.parse({ ...IPWHOIS_PAYLOAD, connection: undefined })
    // Assert — the UI has one honest way to say "not reported".
    expect(result?.asn).toBeNull()
    expect(result?.isp).toBeNull()
  })

  it("does not treat a blank string as a value", () => {
    const result = IPWHOIS.parse({ ...IPWHOIS_PAYLOAD, city: "   " })
    expect(result?.city).toBeNull()
  })
})

describe("the freeipapi.com fallback parser", () => {
  const payload = {
    ipVersion: 4,
    ipAddress: "8.8.8.8",
    latitude: 37.422,
    longitude: -122.085,
    countryName: "United States",
    countryCode: "US",
    cityName: "Mountain View",
    timeZones: ["America/Adak", "America/Anchorage", "America/Chicago"]
  }

  it("reads what it can", () => {
    // Arrange / Act
    const result = FREEIPAPI.parse(payload)
    // Assert
    expect(result?.city).toBe("Mountain View")
    expect(result?.type).toBe("IPv4")
    expect(result?.source).toBe("freeipapi.com")
  })

  it("drops the time zone rather than showing the wrong one", () => {
    // This provider returns EVERY zone in the country, so picking the first
    // would print "America/Adak" for an address in California.
    expect(FREEIPAPI.parse(payload)?.timezone).toBeNull()
  })

  it("reports the fields it genuinely lacks as null", () => {
    const result = FREEIPAPI.parse(payload)
    expect(result?.asn).toBeNull()
    expect(result?.isp).toBeNull()
  })

  it("rejects a payload with no address", () => {
    expect(FREEIPAPI.parse({ countryName: "United States" })).toBeNull()
  })
})

describe("no provider claims to detect a proxy", () => {
  it("has no security fields at all", () => {
    // The shape this replaces declared `is_proxy`, `is_tor`, `threat_level`
    // and `threat_types`, and two of three transforms hardcoded them to a
    // clean verdict which the page rendered as a percentage score.
    const result = IPWHOIS.parse(IPWHOIS_PAYLOAD)
    expect(result).not.toBeNull()
    expect(Object.keys(result ?? {})).not.toContain("security")
    expect(JSON.stringify(result)).not.toContain("threat")
  })
})
