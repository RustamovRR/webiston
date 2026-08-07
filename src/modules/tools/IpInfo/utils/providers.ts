import type { IpLocation } from "../types"

/**
 * The upstreams, and why these two.
 *
 * Checked live on 2026-08-06, because the three the tool shipped with were all
 * dead and nothing had noticed:
 *
 * - `ipapi.co`   → `{"reason":"RateLimited", "message":"sign up for a paid plan"}`
 * - `ip-api.com` → HTTPS returns **403**; the free tier is HTTP-only, so on an
 *                  HTTPS page the browser blocked it as mixed content. It had
 *                  never worked in production.
 * - `ipinfo.io`  → `429 Rate limit hit — Sign up at ipinfo.io`
 *
 * What replaces them:
 *
 * - **ipwho.is** — no key, HTTPS, `access-control-allow-origin: *`, 1,000
 *   requests/day, commercial use permitted, and the only free source that
 *   returns ASN, ISP, organisation and reverse-DNS domain together.
 * - **freeipapi.com** — the fallback. Thinner (no ISP or ASN, and its
 *   `timeZones` field lists every zone in the country rather than the one the
 *   address is in, so it is not read), but it answers when the primary is out
 *   of quota, and a degraded answer beats an empty page.
 *
 * Both are called from the ROUTE, never the browser. Two third parties used to
 * learn each visitor's address directly — ipify for the address itself, then a
 * geolocation provider. Now the address comes from our own request headers and
 * one upstream sees it.
 */

export interface Provider {
  name: string
  url: (ip: string) => string
  parse: (payload: unknown) => IpLocation | null
}

/** Narrow an unknown JSON value to a record without an `any` cast. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
}

const str = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null

const num = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null

export const IPWHOIS: Provider = {
  name: "ipwho.is",
  url: (ip) => `https://ipwho.is/${encodeURIComponent(ip)}`,
  parse: (payload) => {
    const data = asRecord(payload)
    // The endpoint answers 200 with `success: false` for a bad address, so the
    // HTTP status alone is not the check.
    if (!data || data.success !== true) return null

    const connection = asRecord(data.connection) ?? {}
    const timezone = asRecord(data.timezone) ?? {}
    const flag = asRecord(data.flag) ?? {}

    return {
      ip: str(data.ip) ?? "",
      type: str(data.type),
      continent: str(data.continent),
      country: str(data.country),
      countryCode: str(data.country_code),
      region: str(data.region),
      city: str(data.city),
      postal: str(data.postal),
      latitude: num(data.latitude),
      longitude: num(data.longitude),
      timezone: str(timezone.id),
      utcOffset: str(timezone.utc),
      callingCode: str(data.calling_code),
      isEu: typeof data.is_eu === "boolean" ? data.is_eu : null,
      flagEmoji: str(flag.emoji),
      asn: num(connection.asn),
      isp: str(connection.isp),
      org: str(connection.org),
      domain: str(connection.domain),
      source: "ipwho.is"
    }
  }
}

export const FREEIPAPI: Provider = {
  name: "freeipapi.com",
  url: (ip) => `https://free.freeipapi.com/api/json/${encodeURIComponent(ip)}`,
  parse: (payload) => {
    const data = asRecord(payload)
    if (!data || !str(data.ipAddress)) return null

    return {
      ip: str(data.ipAddress) ?? "",
      type: num(data.ipVersion) === 6 ? "IPv6" : "IPv4",
      continent: str(data.continent),
      country: str(data.countryName),
      countryCode: str(data.countryCode),
      region: str(data.regionName),
      city: str(data.cityName),
      postal: str(data.zipCode),
      latitude: num(data.latitude),
      longitude: num(data.longitude),
      // Deliberately dropped: this provider returns EVERY time zone in the
      // country, so "America/Adak" would be shown for an address in New York.
      timezone: null,
      utcOffset: null,
      callingCode: null,
      isEu: null,
      flagEmoji: null,
      asn: null,
      isp: null,
      org: null,
      domain: null,
      source: "freeipapi.com"
    }
  }
}

export const PROVIDERS: readonly Provider[] = [IPWHOIS, FREEIPAPI]
