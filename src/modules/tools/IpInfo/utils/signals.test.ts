import { describe, expect, it } from "vitest"

import type { IpLocation } from "../types"
import {
  type BrowserContext,
  compareSignals,
  formatOffsetMinutes,
  mismatchCount,
  offsetStringToMinutes
} from "./signals"

const TASHKENT: IpLocation = {
  ip: "213.230.78.204",
  type: "IPv4",
  continent: "Asia",
  country: "Uzbekistan",
  countryCode: "UZ",
  region: "Tashkent",
  city: "Tashkent",
  postal: null,
  latitude: 41.2646,
  longitude: 69.2163,
  timezone: "Asia/Tashkent",
  utcOffset: "+05:00",
  callingCode: "998",
  isEu: false,
  flagEmoji: "🇺🇿",
  asn: 8193,
  isp: "Uzbektelecom",
  org: null,
  domain: null,
  source: "ipwho.is"
}

/** A browser sitting in Tashkent: five hours ahead of UTC is -300 minutes. */
const HOME: BrowserContext = {
  timezone: "Asia/Tashkent",
  offsetMinutes: -300,
  languages: ["uz-UZ", "en"]
}

describe("offsetStringToMinutes", () => {
  it("inverts the sign, matching getTimezoneOffset", () => {
    // Arrange / Act / Assert — five hours AHEAD of UTC reports as -300.
    expect(offsetStringToMinutes("+05:00")).toBe(-300)
    expect(offsetStringToMinutes("-04:00")).toBe(240)
    expect(offsetStringToMinutes("+00:00")).toBe(0)
  })

  it("handles a half-hour zone", () => {
    expect(offsetStringToMinutes("+05:30")).toBe(-330)
  })

  it("returns null for anything else", () => {
    expect(offsetStringToMinutes("GMT+5")).toBeNull()
    expect(offsetStringToMinutes(null)).toBeNull()
  })
})

describe("formatOffsetMinutes", () => {
  it("round-trips with offsetStringToMinutes", () => {
    for (const offset of ["+05:00", "-04:00", "+05:30", "+00:00"]) {
      const minutes = offsetStringToMinutes(offset)
      expect(minutes).not.toBeNull()
      expect(formatOffsetMinutes(minutes as number)).toBe(offset)
    }
  })
})

describe("compareSignals", () => {
  it("reports a match when the browser agrees with the address", () => {
    // Arrange / Act
    const signals = compareSignals(TASHKENT, HOME)
    // Assert
    expect(mismatchCount(signals)).toBe(0)
  })

  it("catches the VPN case: address abroad, clock at home", () => {
    // Arrange — a German exit node while the machine stays on Tashkent time.
    const germany: IpLocation = {
      ...TASHKENT,
      country: "Germany",
      countryCode: "DE",
      timezone: "Europe/Berlin",
      utcOffset: "+02:00"
    }

    // Act
    const signals = compareSignals(germany, HOME)

    // Assert — the zone and the offset both disagree, which is the whole
    // signal: a VPN moves the address and not the clock.
    expect(signals.find((s) => s.key === "timezone")?.status).toBe("mismatch")
    expect(signals.find((s) => s.key === "offset")?.status).toBe("mismatch")
  })

  it("does not cry wolf when two zone names share an offset", () => {
    // Arrange — Berlin and Paris are both UTC+2 in summer.
    const paris: IpLocation = {
      ...TASHKENT,
      countryCode: "FR",
      timezone: "Europe/Paris",
      utcOffset: "+02:00"
    }
    const berlinBrowser: BrowserContext = {
      timezone: "Europe/Berlin",
      offsetMinutes: offsetStringToMinutes("+02:00") as number,
      languages: ["fr-FR"]
    }

    // Act
    const signals = compareSignals(paris, berlinBrowser)

    // Assert — the NAME differs, the actual hour difference does not, and the
    // stricter check is the one that matters.
    expect(signals.find((s) => s.key === "timezone")?.status).toBe("mismatch")
    expect(signals.find((s) => s.key === "offset")?.status).toBe("match")
  })

  it("stays unknown when the browser cannot report a zone", () => {
    const blind: BrowserContext = { ...HOME, timezone: null }
    const signals = compareSignals(TASHKENT, blind)
    expect(signals.find((s) => s.key === "timezone")?.status).toBe("unknown")
  })

  it("says nothing about language when no tag carries a region", () => {
    // Arrange — plain `en` is not evidence of anything.
    const generic: BrowserContext = { ...HOME, languages: ["en", "ru"] }
    // Act / Assert
    expect(
      compareSignals(TASHKENT, generic).find((s) => s.key === "language")
        ?.status
    ).toBe("unknown")
  })

  it("matches on any listed region, not just the first", () => {
    const multi: BrowserContext = { ...HOME, languages: ["ru-RU", "uz-UZ"] }
    expect(
      compareSignals(TASHKENT, multi).find((s) => s.key === "language")?.status
    ).toBe("match")
  })
})
