import type { DetailGroup, IpLocation } from "../types"

/**
 * Turning one provider answer into the rows the page shows.
 *
 * Values stay RAW — a number stays a number, a missing value stays `null` —
 * because the words for "not reported" belong in the message bundles, not in
 * the code that reads a JSON payload. That is also what lets the export carry
 * real types instead of translated strings, and it is the same split
 * `device-info` uses.
 */
export function toGroups(data: IpLocation): DetailGroup[] {
  return [
    {
      key: "location",
      rows: [
        { key: "country", value: data.country },
        { key: "region", value: data.region },
        { key: "city", value: data.city },
        { key: "postal", value: data.postal },
        { key: "continent", value: data.continent },
        { key: "coordinates", value: formatCoordinates(data) },
        { key: "isEu", value: data.isEu }
      ]
    },
    {
      key: "network",
      rows: [
        { key: "ip", value: data.ip },
        { key: "type", value: data.type },
        { key: "asn", value: data.asn === null ? null : `AS${data.asn}` },
        { key: "isp", value: data.isp },
        { key: "org", value: data.org },
        { key: "domain", value: data.domain }
      ]
    },
    {
      key: "time",
      rows: [
        { key: "timezone", value: data.timezone },
        { key: "utcOffset", value: data.utcOffset },
        { key: "localTime", value: localTime(data.timezone) },
        { key: "callingCode", value: formatCallingCode(data.callingCode) }
      ]
    }
  ]
}

/**
 * Coordinates to four decimals — about 11 metres.
 *
 * Not because the data is that good. It is nowhere near: a free database
 * places an address at the operator's registered location. Four decimals is
 * simply the precision at which two different lookups stop looking identical,
 * and the page says plainly what the number is worth.
 */
function formatCoordinates(data: IpLocation): string | null {
  if (data.latitude === null || data.longitude === null) return null
  return `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
}

function formatCallingCode(code: string | null): string | null {
  if (!code) return null
  return code.startsWith("+") ? code : `+${code}`
}

/**
 * The current time where the address is.
 *
 * `Intl` does the work, so this is correct across DST without a table. Wrapped
 * because an invalid zone id from an upstream would otherwise throw a
 * `RangeError` and take the whole panel down.
 */
export function localTime(timezone: string | null): string | null {
  if (!timezone) return null
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date())
  } catch {
    return null
  }
}

/** A one-line summary for the headline: "Tashkent, Uzbekistan". */
export function placeLabel(data: IpLocation): string | null {
  const parts = [data.city, data.country].filter(Boolean)
  return parts.length ? parts.join(", ") : null
}

/** The whole answer as JSON, for copy and download. */
export function toJson(data: IpLocation): string {
  return JSON.stringify(data, null, 2)
}
