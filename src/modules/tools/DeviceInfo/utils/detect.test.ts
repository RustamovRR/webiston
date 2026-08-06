import { describe, expect, it } from "vitest"

import type { NavigatorLike } from "../types"
import {
  describeBrowser,
  describeDeviceKind,
  describeEngine,
  describeOs
} from "./detect"

/**
 * Every case here is a real user-agent string, and every one of them was
 * answered wrongly by what this replaces.
 */

const UA = {
  chrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  opera:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
  edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  safari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  chromeIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
  firefox:
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  ipadOs:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  androidPhone:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
}

const nav = (
  userAgent: string,
  extra: Partial<NavigatorLike> = {}
): NavigatorLike => ({ userAgent, maxTouchPoints: 0, ...extra })

describe("describeBrowser", () => {
  it("does not call every Chromium browser Chrome", () => {
    // Arrange & Act — `includes("Chrome") && !includes("Edg")` matched Opera,
    // Brave, Vivaldi and Arc.
    // Assert
    expect(describeBrowser(nav(UA.opera)).name).toBe("Opera")
    expect(describeBrowser(nav(UA.edge)).name).toBe("Edge")
    expect(describeBrowser(nav(UA.chrome)).name).toBe("Chrome")
  })

  it("recognises Chrome on iOS, which reports itself as Safari", () => {
    // Arrange & Act — `CriOS` contains no `Chrome` and does contain `Safari`.
    const browser = describeBrowser(nav(UA.chromeIos))

    // Assert
    expect(browser.name).toBe("Chrome")
    expect(browser.version).toBe("120.0.0.0")
  })

  it("prefers Client Hints, where a Chromium browser still tells the truth", () => {
    // Arrange — Chrome froze its user-agent version in 2022, so the string
    // says `120.0.0.0` for everyone.
    const browser = describeBrowser(
      nav(UA.chrome, {
        brands: [
          { brand: "Not_A Brand", version: "8" },
          { brand: "Chromium", version: "120" },
          { brand: "Google Chrome", version: "120.0.6099.109" }
        ]
      })
    )

    // Assert — the filler brand and Chromium are skipped.
    expect(browser.name).toBe("Google Chrome")
    expect(browser.version).toBe("120.0.6099.109")
    expect(browser.source).toBe("hints")
  })

  it("falls back to the user-agent where there are no hints", () => {
    // Arrange & Act — Firefox and Safari do not implement Client Hints.
    const firefox = describeBrowser(nav(UA.firefox))
    const safari = describeBrowser(nav(UA.safari))

    // Assert
    expect(firefox).toMatchObject({ name: "Firefox", version: "121.0" })
    expect(safari).toMatchObject({ name: "Safari", version: "17.2" })
  })
})

describe("describeEngine", () => {
  it("says WebKit for every iOS browser, whatever its name", () => {
    // Arrange & Act & Assert — the fact that predicts behaviour.
    expect(describeEngine(UA.chromeIos)).toBe("WebKit")
    expect(describeEngine(UA.safari)).toBe("WebKit")
    expect(describeEngine(UA.chrome)).toBe("Blink")
    expect(describeEngine(UA.firefox)).toBe("Gecko")
  })
})

describe("describeDeviceKind", () => {
  it("does not call an iPad a desktop", () => {
    // Arrange & Act — since iPadOS 13, Safari sends a Macintosh user-agent.
    // The tell is the touch screen: no Mac has one.
    const ipad = describeDeviceKind(nav(UA.ipadOs, { maxTouchPoints: 5 }))
    const mac = describeDeviceKind(nav(UA.safari, { maxTouchPoints: 0 }))

    // Assert
    expect(ipad).toBe("tablet")
    expect(mac).toBe("desktop")
  })

  it("reads the boolean the browser states outright", () => {
    // Arrange & Act
    const stated = describeDeviceKind(nav(UA.chrome, { mobile: true }))

    // Assert
    expect(stated).toBe("mobile")
  })

  it("separates an Android phone from an Android tablet", () => {
    // Arrange & Act — the tell is the literal word `Mobile`.
    const phone = describeDeviceKind(
      nav(UA.androidPhone, { maxTouchPoints: 5 })
    )
    const tablet = describeDeviceKind(
      nav(UA.androidPhone.replace(" Mobile", ""), { maxTouchPoints: 5 })
    )

    // Assert
    expect(phone).toBe("mobile")
    expect(tablet).toBe("tablet")
  })
})

describe("describeOs", () => {
  it("tells Windows 11 from Windows 10, which the user-agent cannot", () => {
    // Arrange — both send `Windows NT 10.0`; only Client Hints separate them.
    const eleven = describeOs(
      nav(UA.chrome, { uaPlatform: "Windows" }),
      "15.0.0"
    )
    const ten = describeOs(nav(UA.chrome, { uaPlatform: "Windows" }), "10.0.0")

    // Assert
    expect(eleven).toBe("Windows 11")
    expect(ten).toBe("Windows 10")
  })

  it("does not report Safari's frozen 10.15.7 as the macOS version", () => {
    // Arrange & Act
    const withoutHints = describeOs(nav(UA.safari))
    const withHints = describeOs(
      nav(UA.safari, { uaPlatform: "macOS" }),
      "14.2.1"
    )

    // Assert
    expect(withoutHints).toBe("macOS")
    expect(withHints).toBe("macOS 14.2.1")
  })

  it("reads the version out of a mobile user-agent", () => {
    // Arrange & Act & Assert
    expect(describeOs(nav(UA.chromeIos))).toBe("iOS 17.2")
    expect(describeOs(nav(UA.androidPhone))).toBe("Android 14")
  })
})
