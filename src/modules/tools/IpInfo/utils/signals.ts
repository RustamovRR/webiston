import type { IpLocation } from "../types"

/**
 * What your own browser says, compared with what your address says.
 *
 * This is the honest version of the panel this tool used to ship. That one
 * rendered a "security score" from `is_proxy: false` hardcoded in the source.
 * Real proxy and VPN detection needs a commercial database of exit nodes, and
 * we do not have one — but there is a check nobody needs a database for, and
 * every serious VPN-leak site runs it:
 *
 * **your browser's own time zone against the one your address resolves to.**
 *
 * A VPN moves your public address to another country. It does not move your
 * operating system's clock. So an address in Frankfurt reported by a browser
 * running on `Asia/Tashkent` is the single strongest free signal that traffic
 * is being tunnelled — and it is *your* data answering the question, computed
 * on your machine, sent nowhere.
 *
 * Stated as a SIGNAL, never a verdict. There are ordinary reasons for a
 * mismatch — travel, a manually set clock, a corporate proxy — which is why
 * each result carries what it means rather than a pass or a fail.
 */

export type SignalStatus = "match" | "mismatch" | "unknown"

export interface Signal {
  /** i18n key under `IpInfoPage.signals.items`. */
  key: "timezone" | "language" | "offset"
  status: SignalStatus
  /** What the browser reports. */
  browser: string | null
  /** What the address implies. */
  address: string | null
}

/** The browser's own view of itself, read once on the client. */
export interface BrowserContext {
  timezone: string | null
  /** Minutes west of UTC, as `Date.prototype.getTimezoneOffset` reports it. */
  offsetMinutes: number
  languages: readonly string[]
}

export function readBrowserContext(): BrowserContext {
  let timezone: string | null = null
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    // Ancient or locked-down engine. The signal degrades to "unknown".
  }

  return {
    timezone,
    offsetMinutes: new Date().getTimezoneOffset(),
    languages: navigator.languages ?? [navigator.language]
  }
}

/**
 * `+05:00` → -300, matching `getTimezoneOffset`'s inverted sign convention.
 *
 * The inversion is the trap: JavaScript reports minutes to ADD to local time
 * to reach UTC, so a zone five hours ahead of UTC is **-300**, not +300.
 */
export function offsetStringToMinutes(offset: string | null): number | null {
  if (!offset) return null
  const match = offset.match(/^([+-])(\d{2}):?(\d{2})$/)
  if (!match) return null
  const [, sign, hours, minutes] = match
  const total = Number(hours) * 60 + Number(minutes)
  // `+ 0` normalises the negative zero that `-total` produces for `+00:00`.
  // Harmless in arithmetic, not harmless in a comparison: `Object.is(-0, 0)`
  // is false, so UTC would have failed an identity check against itself.
  return (sign === "+" ? -total : total) + 0
}

/**
 * Compares the browser with the address.
 *
 * The offset comparison rather than the zone NAME is the load-bearing one:
 * `Europe/Berlin` and `Europe/Paris` are different names for the same offset,
 * and calling that a mismatch would cry wolf at half of Europe.
 */
export function compareSignals(
  data: IpLocation,
  browser: BrowserContext
): Signal[] {
  return [
    {
      key: "timezone",
      status: compareTimezones(data.timezone, browser.timezone),
      browser: browser.timezone,
      address: data.timezone
    },
    {
      key: "offset",
      status: compareOffsets(data, browser),
      browser: formatOffsetMinutes(browser.offsetMinutes),
      address: data.utcOffset
    },
    {
      key: "language",
      status: compareLanguages(data.countryCode, browser.languages),
      browser: browser.languages[0] ?? null,
      address: data.countryCode
    }
  ]
}

function compareTimezones(
  address: string | null,
  browser: string | null
): SignalStatus {
  if (!address || !browser) return "unknown"
  return address === browser ? "match" : "mismatch"
}

function compareOffsets(
  data: IpLocation,
  browser: BrowserContext
): SignalStatus {
  // Prefer deriving the address's offset from its zone: it is exact and it
  // accounts for daylight saving on the day of the lookup.
  const addressMinutes = data.timezone
    ? offsetMinutesForZone(data.timezone)
    : offsetStringToMinutes(data.utcOffset)

  if (addressMinutes === null) return "unknown"
  return addressMinutes === browser.offsetMinutes ? "match" : "mismatch"
}

/**
 * A country's language against the browser's preference.
 *
 * The weakest of the three, and deliberately generous: it only reports a
 * mismatch when the browser lists a REGION and that region disagrees. Plain
 * `en` or `ru` says nothing — half the world browses in a language that is not
 * their country's — so it stays "unknown" rather than manufacturing a finding.
 */
function compareLanguages(
  countryCode: string | null,
  languages: readonly string[]
): SignalStatus {
  if (!countryCode) return "unknown"

  const regions = languages
    .map((tag) => tag.split("-")[1]?.toUpperCase())
    .filter((region): region is string => Boolean(region))

  if (regions.length === 0) return "unknown"
  return regions.includes(countryCode.toUpperCase()) ? "match" : "mismatch"
}

function offsetMinutesForZone(timezone: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      timeZoneName: "longOffset"
    }).formatToParts(new Date())
    const name = parts.find((part) => part.type === "timeZoneName")?.value
    if (!name) return null
    if (name === "GMT") return 0
    return offsetStringToMinutes(name.replace("GMT", ""))
  } catch {
    return null
  }
}

/** -300 → `+05:00`, undoing the inverted convention for display. */
export function formatOffsetMinutes(minutes: number): string {
  const ahead = -minutes
  const sign = ahead >= 0 ? "+" : "-"
  const abs = Math.abs(ahead)
  const hh = String(Math.floor(abs / 60)).padStart(2, "0")
  const mm = String(abs % 60).padStart(2, "0")
  return `${sign}${hh}:${mm}`
}

/** How many of the comparable signals disagree. */
export function mismatchCount(signals: readonly Signal[]): number {
  return signals.filter((signal) => signal.status === "mismatch").length
}
