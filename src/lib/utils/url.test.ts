import { describe, expect, it } from "vitest"
import {
  analyzeUrl,
  extractDomain,
  extractQueryParams,
  isEmailUrl,
  isSecureUrl,
  isValidUrl,
  normalizeUrl
} from "./url"

describe("isValidUrl", () => {
  it("accepts a bare host by assuming https", () => {
    expect(isValidUrl("webiston.uz")).toBe(true)
    expect(isValidUrl("https://webiston.uz")).toBe(true)
  })

  it("rejects input that is not a URL at all", () => {
    expect(isValidUrl("not a url")).toBe(false)
    expect(isValidUrl("")).toBe(false)
    expect(isValidUrl("a b")).toBe(false)
  })
})

describe("analyzeUrl", () => {
  it("splits a full URL into its parts", () => {
    expect(analyzeUrl("https://webiston.uz/tools?q=1#top")).toEqual({
      protocol: "https:",
      hostname: "webiston.uz",
      pathname: "/tools",
      search: "?q=1",
      hash: "#top",
      isValidUrl: true
    })
  })

  it("omits empty parts rather than reporting them as blank", () => {
    // A root pathname is "/" from the URL API; reporting it adds no information.
    const info = analyzeUrl("https://webiston.uz")
    expect(info?.pathname).toBeUndefined()
    expect(info?.search).toBeUndefined()
    expect(info?.hash).toBeUndefined()
  })

  it("returns null for blank input and a flag for unparseable input", () => {
    // Two different answers on purpose: "you gave me nothing" vs "that is broken".
    expect(analyzeUrl("")).toBeNull()
    expect(analyzeUrl("   ")).toBeNull()
    expect(analyzeUrl("http://")).toEqual({ isValidUrl: false })
  })
})

describe("extractDomain", () => {
  it("returns the hostname with or without a scheme", () => {
    expect(extractDomain("https://webiston.uz/x")).toBe("webiston.uz")
    expect(extractDomain("webiston.uz/x")).toBe("webiston.uz")
  })

  it("returns null when there is no parseable host", () => {
    expect(extractDomain("http://")).toBeNull()
  })
})

describe("isSecureUrl", () => {
  it("is true only for an explicit https scheme", () => {
    expect(isSecureUrl("https://webiston.uz")).toBe(true)
    expect(isSecureUrl("http://webiston.uz")).toBe(false)
  })

  it("does NOT assume https for a bare host — unlike isValidUrl", () => {
    // Deliberate asymmetry: this function answers "is this URL secure", and a
    // bare host makes no such claim. Pinned so the two stay distinguishable.
    expect(isValidUrl("webiston.uz")).toBe(true)
    expect(isSecureUrl("webiston.uz")).toBe(false)
  })
})

describe("isEmailUrl", () => {
  it("detects the mailto scheme", () => {
    expect(isEmailUrl("mailto:a@b.uz")).toBe(true)
    expect(isEmailUrl("https://webiston.uz")).toBe(false)
  })
})

describe("normalizeUrl", () => {
  it("adds https when no scheme is present", () => {
    expect(normalizeUrl("webiston.uz")).toBe("https://webiston.uz")
  })

  it("leaves an existing scheme alone, including non-http ones", () => {
    expect(normalizeUrl("http://webiston.uz")).toBe("http://webiston.uz")
    expect(normalizeUrl("ftp://webiston.uz")).toBe("ftp://webiston.uz")
  })

  it("trims before deciding, and returns empty for blank input", () => {
    expect(normalizeUrl("  webiston.uz  ")).toBe("https://webiston.uz")
    expect(normalizeUrl("   ")).toBe("")
    expect(normalizeUrl("")).toBe("")
  })
})

describe("extractQueryParams", () => {
  it("returns every parameter as a plain object", () => {
    expect(extractQueryParams("https://webiston.uz?a=1&b=two")).toEqual({
      a: "1",
      b: "two"
    })
  })

  it("decodes percent-encoded values", () => {
    expect(extractQueryParams("https://webiston.uz?q=a%20b")).toEqual({
      q: "a b"
    })
  })

  it("returns an empty object for no query or bad input", () => {
    expect(extractQueryParams("https://webiston.uz")).toEqual({})
    expect(extractQueryParams("http://")).toEqual({})
  })

  it("keeps the LAST value when a key repeats", () => {
    // URLSearchParams.forEach visits every pair, so the later one overwrites.
    // Pinned because callers relying on the first value would be wrong.
    expect(extractQueryParams("https://webiston.uz?a=1&a=2")).toEqual({
      a: "2"
    })
  })
})
