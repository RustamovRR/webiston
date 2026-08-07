import { describe, expect, it } from "vitest"

import {
  clientIpFromHeaders,
  isIpAddress,
  isIpv4,
  isIpv6,
  isPrivateAddress
} from "./address"

describe("isIpv4", () => {
  it("accepts a normal address", () => {
    // Arrange / Act / Assert
    expect(isIpv4("1.1.1.1")).toBe(true)
    expect(isIpv4("255.255.255.255")).toBe(true)
    expect(isIpv4("0.0.0.0")).toBe(true)
  })

  it("rejects an octet above 255", () => {
    expect(isIpv4("256.1.1.1")).toBe(false)
    expect(isIpv4("1.1.1.999")).toBe(false)
  })

  it("rejects a leading zero", () => {
    // `010.1.1.1` is read as octal by some resolvers — a classic SSRF bypass,
    // and never a valid dotted quad.
    expect(isIpv4("010.1.1.1")).toBe(false)
    expect(isIpv4("1.1.1.01")).toBe(false)
  })

  it("rejects the wrong number of parts", () => {
    expect(isIpv4("1.1.1")).toBe(false)
    expect(isIpv4("1.1.1.1.1")).toBe(false)
    expect(isIpv4("")).toBe(false)
  })

  it("rejects text", () => {
    expect(isIpv4("hello")).toBe(false)
    expect(isIpv4("a.b.c.d")).toBe(false)
  })
})

describe("isIpv6", () => {
  it("accepts a full address", () => {
    expect(isIpv6("2001:4860:4860:0000:0000:0000:0000:8888")).toBe(true)
  })

  it("accepts the compressed form", () => {
    expect(isIpv6("2001:4860:4860::8888")).toBe(true)
    expect(isIpv6("::1")).toBe(true)
    expect(isIpv6("::")).toBe(true)
  })

  it("accepts an IPv4-mapped address", () => {
    expect(isIpv6("::ffff:192.0.2.1")).toBe(true)
  })

  it("rejects more than one compression run", () => {
    // The whole point of `::` is that it is unambiguous; two of them are not.
    expect(isIpv6("2001::4860::8888")).toBe(false)
  })

  it("rejects too many groups", () => {
    expect(isIpv6("1:2:3:4:5:6:7:8:9")).toBe(false)
  })

  it("rejects a group that is not hex", () => {
    expect(isIpv6("2001:4860:zzzz::1")).toBe(false)
    expect(isIpv6("2001:48601::1")).toBe(false)
  })

  it("rejects a zone index", () => {
    // Valid in a URL, never in a lookup.
    expect(isIpv6("fe80::1%eth0")).toBe(false)
  })

  it("rejects an IPv4 address", () => {
    expect(isIpv6("1.1.1.1")).toBe(false)
  })
})

describe("isIpAddress", () => {
  it("accepts both families", () => {
    expect(isIpAddress("8.8.8.8")).toBe(true)
    expect(isIpAddress("2001:4860:4860::8888")).toBe(true)
  })

  it("rejects what the old form happily sent upstream", () => {
    expect(isIpAddress("hello")).toBe(false)
    expect(isIpAddress("example.com")).toBe(false)
    expect(isIpAddress(" ")).toBe(false)
  })
})

describe("isPrivateAddress", () => {
  it("catches every RFC 1918 range", () => {
    expect(isPrivateAddress("10.0.0.1")).toBe(true)
    expect(isPrivateAddress("172.16.0.1")).toBe(true)
    expect(isPrivateAddress("172.31.255.255")).toBe(true)
    expect(isPrivateAddress("192.168.1.1")).toBe(true)
  })

  it("does not over-reach into public 172 space", () => {
    // 172.15 and 172.32 are public; only 172.16–31 is reserved.
    expect(isPrivateAddress("172.15.0.1")).toBe(false)
    expect(isPrivateAddress("172.32.0.1")).toBe(false)
  })

  it("catches loopback, link-local and carrier-grade NAT", () => {
    expect(isPrivateAddress("127.0.0.1")).toBe(true)
    expect(isPrivateAddress("169.254.1.1")).toBe(true)
    expect(isPrivateAddress("100.64.0.1")).toBe(true)
  })

  it("catches the IPv6 equivalents", () => {
    expect(isPrivateAddress("::1")).toBe(true)
    expect(isPrivateAddress("fe80::1")).toBe(true)
    expect(isPrivateAddress("fd00::1")).toBe(true)
  })

  it("leaves public addresses alone", () => {
    expect(isPrivateAddress("8.8.8.8")).toBe(false)
    expect(isPrivateAddress("2001:4860:4860::8888")).toBe(false)
  })
})

describe("clientIpFromHeaders", () => {
  const from = (headers: Record<string, string>) =>
    clientIpFromHeaders((name) => headers[name] ?? null)

  it("takes the FIRST entry of x-forwarded-for", () => {
    // Arrange — the chain is client, then each proxy in turn.
    const headers = {
      "x-forwarded-for": "203.0.113.5, 70.41.3.18, 150.172.238.178"
    }
    // Act / Assert — reading the last entry yields our own edge, which is the
    // common bug.
    expect(from(headers)).toBe("203.0.113.5")
  })

  it("falls back to x-real-ip", () => {
    expect(from({ "x-real-ip": "198.51.100.7" })).toBe("198.51.100.7")
  })

  it("falls back to cf-connecting-ip", () => {
    expect(from({ "cf-connecting-ip": "198.51.100.9" })).toBe("198.51.100.9")
  })

  it("ignores a header that does not hold an address", () => {
    expect(from({ "x-forwarded-for": "unknown" })).toBeNull()
    expect(from({ "x-real-ip": "" })).toBeNull()
  })

  it("returns null when nothing carries an address", () => {
    expect(from({})).toBeNull()
  })
})
