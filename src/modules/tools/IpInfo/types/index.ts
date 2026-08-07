/**
 * Tool-scoped types.
 */

/**
 * What a geolocation provider can actually tell us.
 *
 * Every field here is one a provider returns. The shape this replaces declared
 * a `security` block — `is_proxy`, `is_tor`, `threat_level`, `threat_types` —
 * that **no free provider populates**: two of the three transforms hardcoded
 * `false` and `"low"`, and the page rendered the result as a percentage score.
 * A type that promises data nothing supplies is how fabrication gets shipped,
 * so the promise is gone.
 *
 * `null` rather than `""` for a missing value: an empty string renders as a
 * blank cell that looks like a bug, and the UI has one honest way to say "the
 * provider did not answer this".
 */
export interface IpLocation {
  ip: string
  /** `IPv4` or `IPv6`, as reported. */
  type: string | null
  continent: string | null
  country: string | null
  countryCode: string | null
  /** Regional subdivision — state, province, viloyat. */
  region: string | null
  city: string | null
  postal: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  /** Local time in `timezone` at the moment of the lookup. */
  utcOffset: string | null
  callingCode: string | null
  isEu: boolean | null
  flagEmoji: string | null
  /** Autonomous System number — the network that announces this address. */
  asn: number | null
  isp: string | null
  org: string | null
  /** Reverse-DNS domain of the operator, where the provider knows it. */
  domain: string | null
  /** Which upstream answered. Shown, because provenance is part of the answer. */
  source: string
}

/** What the route returns for a lookup that failed. */
export interface IpLookupError {
  /** i18n key under `IpInfoPage.errors`. */
  code:
    | "invalid"
    | "private"
    | "notFound"
    | "rateLimited"
    | "network"
    /**
     * The request reached us with no usable public address of its own.
     *
     * Distinct from `private` on purpose: `private` is a judgement about an
     * address the visitor TYPED, this is a statement about our own request
     * headers, and only the second one is worth a client-side fallback.
     */
    | "noPublicIp"
  message?: string
}

export type IpLookupResult =
  | { ok: true; data: IpLocation }
  | { ok: false; error: IpLookupError }

/** The shape of one row in the details table. */
export interface DetailRow {
  /** i18n key under `IpInfoPage.rows`. */
  key: string
  value: string | number | boolean | null
  /** Long values — the ASN organisation string — get a full-width row. */
  wide?: boolean
}

export interface DetailGroup {
  key: "location" | "network" | "time"
  rows: DetailRow[]
}
