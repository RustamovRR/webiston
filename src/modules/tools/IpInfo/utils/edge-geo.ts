import type { IpLocation } from "../types"

/**
 * The visitor's location, from Vercel's own edge — no upstream call at all.
 *
 * Vercel attaches these headers to every request that reaches a Function, on
 * **every plan including Hobby**
 * (vercel.com/changelog/ip-geolocation-now-available-for-all-plans). They cost
 * nothing, count against no quota and add no latency, which matters more than
 * it first looks:
 *
 * ipwho.is allows 1,000 lookups a day **per calling IP**. Called from a server,
 * that is 1,000 for the whole site — and the in-process cache barely helps on
 * serverless, where each instance has its own Map and instances are ephemeral.
 * Called from a browser it would be 1,000 per visitor, but then two third
 * parties learn every visitor's address directly, which is what this rebuild
 * set out to stop.
 *
 * Reading the edge headers dissolves the trade-off for the common case — "what
 * is MY address", which is why nearly everyone opens this page. The quota is
 * then spent only on the rare case: looking up somebody else's address.
 *
 * What Vercel does NOT provide is the network layer — ASN, ISP, organisation,
 * reverse-DNS domain. Those still need a provider, so `complete()` says whether
 * an answer is worth enriching.
 */

/** Header names, exactly as Vercel spells them. */
const H = {
  continent: "x-vercel-ip-continent",
  country: "x-vercel-ip-country",
  region: "x-vercel-ip-country-region",
  city: "x-vercel-ip-city",
  latitude: "x-vercel-ip-latitude",
  longitude: "x-vercel-ip-longitude",
  timezone: "x-vercel-ip-timezone",
  postal: "x-vercel-ip-postal-code"
} as const

/** ISO 3166-1 continent codes, spelled out for display. */
const CONTINENTS: Record<string, string> = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America"
}

/**
 * `x-vercel-ip-city` is percent-encoded per RFC 3986.
 *
 * Not cosmetic: without decoding, São Paulo arrives as `S%C3%A3o%20Paulo` and
 * Nukus as `Nukus`, so the bug only shows up for visitors outside the ASCII
 * range — which is most of the world and includes ours.
 */
function decode(value: string | null): string | null {
  if (!value) return null
  try {
    const decoded = decodeURIComponent(value).trim()
    return decoded || null
  } catch {
    // A malformed sequence is not worth failing the request over.
    return value.trim() || null
  }
}

const numeric = (value: string | null): number | null => {
  if (!value) return null
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Builds a location from edge headers, or `null` if this is not Vercel.
 *
 * Country is the gate: it is the one header Vercel always sets when the
 * geolocation lookup succeeded, so its absence means we are self-hosted, in
 * local development, or the edge could not place the address.
 */
export function locationFromEdge(
  ip: string,
  get: (name: string) => string | null
): IpLocation | null {
  const country = get(H.country)?.trim()
  if (!country) return null

  const continentCode = get(H.continent)?.trim() ?? ""

  return {
    ip,
    type: ip.includes(":") ? "IPv6" : "IPv4",
    continent: CONTINENTS[continentCode] ?? null,
    // The header is a two-letter code; `Intl.DisplayNames` turns it into a
    // name without shipping a country table.
    country: countryName(country),
    countryCode: country,
    region: decode(get(H.region)),
    city: decode(get(H.city)),
    postal: decode(get(H.postal)),
    latitude: numeric(get(H.latitude)),
    longitude: numeric(get(H.longitude)),
    timezone: get(H.timezone)?.trim() || null,
    // Vercel reports the zone but not the offset, and deriving it is exact.
    utcOffset: offsetFor(get(H.timezone)?.trim() ?? null),
    callingCode: null,
    isEu: null,
    flagEmoji: flagFor(country),
    // The whole network layer is what Vercel does not know.
    asn: null,
    isp: null,
    org: null,
    domain: null,
    source: "vercel-edge"
  }
}

/** True when the answer still lacks the network fields a provider supplies. */
export function needsEnrichment(location: IpLocation): boolean {
  return location.asn === null && location.isp === null
}

/**
 * Merge a provider's answer over an edge answer.
 *
 * Edge values win where both have one — they come from the network that served
 * the request rather than a database lookup of it — and the provider fills the
 * holes. The source records both, because provenance is part of the answer.
 */
export function mergeLocations(
  edge: IpLocation,
  provider: IpLocation
): IpLocation {
  const pick = <T>(a: T | null, b: T | null): T | null => a ?? b

  return {
    ...provider,
    ip: edge.ip,
    type: pick(edge.type, provider.type),
    continent: pick(edge.continent, provider.continent),
    country: pick(edge.country, provider.country),
    countryCode: pick(edge.countryCode, provider.countryCode),
    region: pick(edge.region, provider.region),
    city: pick(edge.city, provider.city),
    postal: pick(edge.postal, provider.postal),
    latitude: pick(edge.latitude, provider.latitude),
    longitude: pick(edge.longitude, provider.longitude),
    timezone: pick(edge.timezone, provider.timezone),
    utcOffset: pick(edge.utcOffset, provider.utcOffset),
    flagEmoji: pick(edge.flagEmoji, provider.flagEmoji),
    source: `${edge.source} + ${provider.source}`
  }
}

/** `UZ` → `🇺🇿`, by mapping letters into the regional-indicator block. */
function flagFor(countryCode: string): string | null {
  if (!/^[A-Za-z]{2}$/.test(countryCode)) return null
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map(
      (letter) => 0x1f1e6 + letter.charCodeAt(0) - 65
    )
  )
}

function countryName(countryCode: string): string | null {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(
        countryCode.toUpperCase()
      ) ?? null
    )
  } catch {
    return null
  }
}

/** `Asia/Tashkent` → `+05:00`, computed rather than tabulated. */
function offsetFor(timezone: string | null): string | null {
  if (!timezone) return null
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      timeZoneName: "longOffset"
    }).formatToParts(new Date())
    const name = parts.find((part) => part.type === "timeZoneName")?.value
    if (!name) return null
    // `GMT+05:00` → `+05:00`; plain `GMT` means UTC.
    return name === "GMT" ? "+00:00" : name.replace("GMT", "")
  } catch {
    return null
  }
}
