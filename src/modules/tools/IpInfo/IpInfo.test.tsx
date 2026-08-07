import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/ip-info/uz.json"
import { IpInfo } from "./IpInfo"
import type { IpLocation, IpLookupResult } from "./types"

/**
 * The tool, driven the way a visitor drives it.
 *
 * The address parsing and the provider parsers have their own unit tests;
 * these cover what the PAGE does — including the two failure paths the old
 * implementation had no answer for: a malformed address, and a private one.
 *
 * `/api/ip` is stubbed. The route is ours, its contract is a typed union, and
 * a test that reaches a free geolocation service fails the day someone else
 * exhausts the quota.
 */

const messages = { ...commonMessages, ...toolMessages }

const ANSWER: IpLocation = {
  ip: "213.230.78.204",
  type: "IPv4",
  continent: "Asia",
  country: "Uzbekistan",
  countryCode: "UZ",
  region: "Tashkent",
  city: "Tashkent",
  postal: "100000",
  latitude: 41.2646,
  longitude: 69.2163,
  timezone: "Asia/Tashkent",
  utcOffset: "+05:00",
  callingCode: "998",
  isEu: false,
  flagEmoji: "🇺🇿",
  asn: 8193,
  isp: "Uzbektelecom",
  org: "Uzbektelecom JSC",
  domain: "uztelecom.uz",
  source: "ipwho.is"
}

let respondWith: IpLookupResult = { ok: true, data: ANSWER }

beforeEach(() => {
  respondWith = { ok: true, data: ANSWER }
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ json: async () => respondWith }) as Response)
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function renderTool() {
  const result = render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <IpInfo />
    </NextIntlClientProvider>
  )
  // The first lookup fires from an effect on mount.
  await act(async () => {})
  return result
}

const panel = (name: RegExp) => screen.getByRole("region", { name })

describe("the first answer", () => {
  it("looks up the visitor's own address without them asking", async () => {
    // Arrange & Act
    await renderTool()

    // Assert — no button press: it is the question the page exists to answer.
    expect(fetch).toHaveBeenCalledWith("/api/ip", expect.anything())
    expect(
      within(panel(/sizning manzilingiz/i)).getByText("213.230.78.204")
    ).toBeInTheDocument()
  })

  it("names which provider answered", async () => {
    // Arrange & Act — provenance is part of the answer when two upstreams
    // return different amounts of detail.
    await renderTool()
    // Assert
    expect(screen.getByText(/ipwho\.is/)).toBeInTheDocument()
  })

  it("fills every group", async () => {
    // Arrange & Act
    await renderTool()

    // Assert — "Tashkent" is both the region and the city here, so the count
    // is the assertion: two rows, not one.
    expect(within(panel(/^joylashuv$/i)).getAllByText("Tashkent")).toHaveLength(
      2
    )
    expect(within(panel(/^tarmoq$/i)).getByText("AS8193")).toBeInTheDocument()
    expect(
      within(panel(/^vaqt$/i)).getByText("Asia/Tashkent")
    ).toBeInTheDocument()
  })
})

describe("looking up another address", () => {
  it("sends the typed address to the route", async () => {
    // Arrange
    await renderTool()

    // Act
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/boshqa manzilni tekshirish/i), {
        target: { value: "1.1.1.1" }
      })
      fireEvent.click(screen.getByRole("button", { name: /^tekshirish$/i }))
    })

    // Assert
    expect(fetch).toHaveBeenCalledWith("/api/ip?ip=1.1.1.1", expect.anything())
  })

  it("refuses a malformed address without touching the network", async () => {
    // Arrange
    await renderTool()
    const callsBefore = vi.mocked(fetch).mock.calls.length

    // Act
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/boshqa manzilni tekshirish/i), {
        target: { value: "hello" }
      })
    })

    // Assert — the old form sent this upstream and showed a network error.
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^tekshirish$/i })).toBeDisabled()
    expect(vi.mocked(fetch).mock.calls.length).toBe(callsBefore)
  })

  it("accepts an IPv6 address", async () => {
    // Arrange — the previous implementation could not parse one at all.
    await renderTool()

    // Act
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/boshqa manzilni tekshirish/i), {
        target: { value: "2001:4860:4860::8888" }
      })
      fireEvent.click(screen.getByRole("button", { name: /^tekshirish$/i }))
    })

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      "/api/ip?ip=2001%3A4860%3A4860%3A%3A8888",
      expect.anything()
    )
  })

  it("offers an IPv6 example, not six DNS resolvers", async () => {
    // Arrange & Act
    await renderTool()
    // Assert
    expect(
      screen.getByRole("button", { name: /Google DNS \(IPv6\)/ })
    ).toBeInTheDocument()
  })
})

describe("when the lookup fails", () => {
  it("explains a private address instead of showing a guess", async () => {
    // Arrange
    await renderTool()
    respondWith = { ok: false, error: { code: "private" } }

    // Act
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^o'zimniki$/i }))
    })

    // Assert — handed 10.0.0.1 an upstream answers with SOMETHING, and the
    // page would have presented it as a fact about that address.
    expect(screen.getByRole("alert")).toHaveTextContent(/ichki tarmoqniki/i)
  })

  it("clears the previous answer so the error cannot look like it applies", async () => {
    // Arrange — the address shows twice: the headline and the network row.
    await renderTool()
    expect(screen.getAllByText("213.230.78.204")).toHaveLength(2)
    respondWith = { ok: false, error: { code: "rateLimited" } }

    // Act
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^o'zimniki$/i }))
    })

    // Assert
    expect(screen.queryAllByText("213.230.78.204")).toHaveLength(0)
    expect(screen.getByRole("alert")).toHaveTextContent(/bepul limiti/i)
  })
})

describe("what the rebuild removed", () => {
  it("publishes no security verdict", async () => {
    // Arrange & Act — the old page rendered a percentage "security score"
    // from `is_proxy: false` / `threat_level: "low"` hardcoded in the hook.
    await renderTool()

    // Assert
    expect(screen.queryByText(/proxy/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/tor\b/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
