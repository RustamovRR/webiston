/**
 * Tool-scoped types.
 */

/**
 * One label/value pair in a group.
 *
 * The value is kept RAW — a boolean stays a boolean, a missing value is
 * `null` — because the words for "yes", "no" and "not available" belong in the
 * message bundles, not in the code that reads `navigator`. That is also what
 * lets the JSON export carry real types instead of translated strings.
 *
 * `null` renders as an explicit "not available" rather than being dropped: a
 * missing row reads as a bug, and WHY it is missing is often the interesting
 * part — Firefox and Safari implement neither Client Hints nor the Network
 * Information API.
 */
export interface InfoRow {
  /** i18n key under `DeviceInfoPage.rows`. */
  key: string
  value: string | number | boolean | null
  /** Long values — the user-agent string — get their own full-width row. */
  wide?: boolean
}

export type GroupKey =
  | "browser"
  | "system"
  | "display"
  | "device"
  | "network"
  | "preferences"

export interface InfoGroup {
  key: GroupKey
  rows: InfoRow[]
}

/** What the page knows about this visit. */
export interface DeviceSnapshot {
  groups: InfoGroup[]
  /** The same data as JSON, for copy and download. */
  json: string
}

/**
 * The subset of `navigator` the detection functions read.
 *
 * Passed in rather than reached for, so the rules can be tested against a
 * real iPhone's user-agent string without an iPhone.
 */
export interface NavigatorLike {
  userAgent: string
  maxTouchPoints: number
  /** Deprecated, and frozen on modern engines. Read only as a fallback. */
  platform?: string
  brands?: { brand: string; version: string }[]
  uaPlatform?: string
  mobile?: boolean
}
