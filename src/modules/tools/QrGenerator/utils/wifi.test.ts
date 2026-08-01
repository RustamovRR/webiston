import { describe, expect, it } from "vitest"

import { buildWifiPayload, DEFAULT_WIFI } from "./wifi"

describe("buildWifiPayload", () => {
  it("builds the standard WPA payload", () => {
    // Arrange
    const config = {
      ...DEFAULT_WIFI,
      ssid: "Uyim",
      password: "parol123"
    }

    // Act + Assert
    expect(buildWifiPayload(config)).toBe("WIFI:T:WPA;S:Uyim;P:parol123;;")
  })

  it("escapes every reserved character in the SSID and password", () => {
    // Arrange — the characters that break the format when raw
    const config = {
      ...DEFAULT_WIFI,
      ssid: 'Kafe;"Salom"',
      password: "a:b,c\\d"
    }

    // Act
    const payload = buildWifiPayload(config)

    // Assert
    expect(payload).toBe('WIFI:T:WPA;S:Kafe\\;\\"Salom\\";P:a\\:b\\,c\\\\d;;')
  })

  it("omits the password for an open network", () => {
    // Arrange
    const config = {
      ...DEFAULT_WIFI,
      ssid: "Ochiq tarmoq",
      password: "ignored",
      security: "nopass" as const
    }

    // Act + Assert
    expect(buildWifiPayload(config)).toBe("WIFI:T:nopass;S:Ochiq tarmoq;;")
  })

  it("carries the hidden flag", () => {
    // Arrange
    const config = { ...DEFAULT_WIFI, ssid: "Yashirin", hidden: true }

    // Act + Assert
    expect(buildWifiPayload(config)).toBe("WIFI:T:WPA;S:Yashirin;H:true;;")
  })

  it("is empty until there is an SSID", () => {
    // Arrange + Act + Assert
    expect(buildWifiPayload(DEFAULT_WIFI)).toBe("")
    expect(buildWifiPayload({ ...DEFAULT_WIFI, ssid: "   " })).toBe("")
  })
})
