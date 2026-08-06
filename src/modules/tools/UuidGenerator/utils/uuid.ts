import type {
  InspectVerdict,
  UuidCase,
  UuidFormat,
  UuidVersion
} from "../types"

/**
 * UUID generation and inspection, per RFC 9562 (May 2024, which obsoletes
 * RFC 4122).
 *
 * Everything here produces or consumes the canonical lower-case hyphenated
 * form; delimiters and case are a display decision and live in `formatUuid`.
 *
 * What this replaces got v1 wrong in a way no test would have caught by
 * looking at the shape of the output: it computed the 60-bit timestamp as
 * `(Date.now() + 12219292800000) * 10000`, which is ≈1.7e16 — past
 * `Number.MAX_SAFE_INTEGER` (9.007e15), so the low bits of every v1 value
 * were quantised to whatever the float could represent. The value still
 * looked like a UUID. It just did not carry the time it claimed to.
 */

const NIL_UUID = "00000000-0000-0000-0000-000000000000"
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff"

/**
 * The 60-bit timestamp maths, in `BigInt`.
 *
 * Written as `BigInt(...)` calls rather than `123n` literals because the app's
 * `tsconfig` targets ES2017, and a BigInt literal is the one piece of syntax
 * TypeScript cannot downlevel. The values are the same.
 */
/** 1582-10-15 → 1970-01-01, in milliseconds. The v1 epoch offset. */
const GREGORIAN_OFFSET_MS = BigInt("12219292800000")
/** 100-nanosecond intervals in one millisecond. */
const INTERVALS_PER_MS = BigInt(10000)
const MASK_32 = BigInt(0xffffffff)
const MASK_16 = BigInt(0xffff)
const MASK_12 = BigInt(0x0fff)
const SHIFT_32 = BigInt(32)
const SHIFT_48 = BigInt(48)
const VERSION_1_BITS = BigInt(0x1000)

const HEX = "0123456789abcdef"

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

function toHex(bytes: Uint8Array): string {
  let out = ""
  for (const byte of bytes) {
    out += HEX[byte >> 4] + HEX[byte & 0x0f]
  }
  return out
}

/** `0123456789abcdef0123…` → `01234567-89ab-cdef-0123-…` */
function hyphenate(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

/**
 * Version 4 — 122 random bits.
 *
 * `crypto.randomUUID()` where it exists, which is every browser this site
 * supports; the manual path is the same CSPRNG and exists so the function is
 * usable in a test runner and in a non-secure context, where `randomUUID` is
 * not exposed.
 */
export function generateUuidV4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID()

  const bytes = randomBytes(16)
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10xx
  return hyphenate(toHex(bytes))
}

/**
 * Version 7 — 48-bit Unix millisecond timestamp, then 74 random bits.
 *
 * The reason it exists: sorting a v7 column sorts by creation time, so rows
 * arrive at the end of a B-tree index instead of scattering across it. A v4
 * primary key fragments the index by design.
 *
 * Values made inside the SAME millisecond would otherwise sort arbitrarily
 * against each other, which would make "generate 1000" produce an unsorted
 * list and quietly disprove the one property the version is chosen for. So
 * `rand_a` is used as the RFC's 12-bit monotonic counter (§6.2, method 2),
 * seeded low enough to leave room to climb and re-seeded on every new
 * millisecond.
 */
let v7LastMs = -1
let v7Counter = 0

export function generateUuidV7(): string {
  const now = Date.now()
  const seed = randomBytes(10)

  if (now === v7LastMs) {
    v7Counter += 1
    // 12 bits is 4096 values in one millisecond. Past that the only correct
    // move is to borrow from the next millisecond, which keeps the ordering
    // true at the cost of a timestamp one tick ahead.
    if (v7Counter > 0xfff) {
      v7LastMs = now + 1
      v7Counter = 0
    }
  } else {
    v7LastMs = Math.max(now, v7LastMs)
    // Seeded into the bottom quarter of the range so a burst has room.
    v7Counter = ((seed[0] << 8) | seed[1]) & 0x03ff
  }

  const ms = v7LastMs
  const timestampHex = ms.toString(16).padStart(12, "0")
  // version 7 + the 12-bit counter
  const verAndCounter = (0x7000 | v7Counter).toString(16).padStart(4, "0")
  // variant 10xx over the first byte of the remaining 62 random bits
  const rest = seed.slice(2)
  rest[0] = (rest[0] & 0x3f) | 0x80

  return hyphenate(`${timestampHex}${verAndCounter}${toHex(rest)}`)
}

/**
 * Version 1 — 60-bit timestamp in 100-nanosecond intervals since 1582, plus a
 * clock sequence and a node identifier.
 *
 * `BigInt`, because the timestamp does not fit in a double. A browser cannot
 * read a MAC address (and should not want to), so the node is random with the
 * multicast bit set — the convention RFC 9562 §5.1 gives for exactly this
 * case, which also guarantees it can never collide with a real hardware
 * address. The clock sequence is fixed per page load, as the RFC intends, and
 * a sub-millisecond counter keeps values inside one millisecond distinct.
 */
let v1ClockSeq: number | null = null
let v1LastMs = -1
let v1Counter = 0

export function generateUuidV1(): string {
  // Lazily, not at module scope: this module is imported by a client
  // component, so anything evaluated on import runs during SSR too.
  if (v1ClockSeq === null) {
    const seed = randomBytes(2)
    v1ClockSeq = ((seed[0] << 8) | seed[1]) & 0x3fff
  }

  const now = Date.now()
  if (now === v1LastMs) {
    v1Counter += 1
  } else {
    v1LastMs = now
    v1Counter = 0
  }

  // 10,000 intervals of 100ns per millisecond, so the counter cannot reach
  // into the next millisecond's range.
  const intervals =
    (BigInt(v1LastMs) + GREGORIAN_OFFSET_MS) * INTERVALS_PER_MS +
    BigInt(v1Counter % 10000)

  const timeLow = intervals & MASK_32
  const timeMid = (intervals >> SHIFT_32) & MASK_16
  const timeHigh = (intervals >> SHIFT_48) & MASK_12

  const node = randomBytes(6)
  node[0] |= 0x01 // multicast bit: "this is not a MAC address"

  const clockSeqHigh = ((v1ClockSeq >> 8) & 0x3f) | 0x80 // variant 10xx
  const clockSeqLow = v1ClockSeq & 0xff

  return [
    timeLow.toString(16).padStart(8, "0"),
    timeMid.toString(16).padStart(4, "0"),
    (VERSION_1_BITS | timeHigh).toString(16).padStart(4, "0"),
    ((clockSeqHigh << 8) | clockSeqLow).toString(16).padStart(4, "0"),
    toHex(node)
  ].join("-")
}

export function generateNilUuid(): string {
  return NIL_UUID
}

export function generateUuid(version: UuidVersion): string {
  switch (version) {
    case "v7":
      return generateUuidV7()
    case "v1":
      return generateUuidV1()
    case "nil":
      return generateNilUuid()
    default:
      return generateUuidV4()
  }
}

/** Delimiters and case, applied to a canonical value. */
export function formatUuid(
  uuid: string,
  format: UuidFormat,
  textCase: UuidCase = "lower"
): string {
  const base =
    format === "compact"
      ? uuid.replace(/-/g, "")
      : format === "braces"
        ? `{${uuid}}`
        : uuid

  return textCase === "upper" ? base.toUpperCase() : base
}

/**
 * The canonical 32 hex digits out of anything a person might paste.
 *
 * Accepts the hyphenated form, the compact form, `{braces}`, the
 * `urn:uuid:` form, any case, and surrounding whitespace — because all six
 * are what a UUID looks like when it comes out of a log line, a database
 * client or a config file. Returns `null` when it is not 32 hex digits.
 */
export function normalizeUuid(input: string): string | null {
  const trimmed = input
    .trim()
    .replace(/^urn:uuid:/i, "")
    .replace(/^\{|\}$/g, "")
    .replace(/-/g, "")
    .toLowerCase()

  return /^[0-9a-f]{32}$/.test(trimmed) ? trimmed : null
}

export function isValidUuid(input: string): boolean {
  return normalizeUuid(input) !== null
}

/**
 * What a pasted UUID is.
 *
 * Reads every version RFC 9562 defines, not only the four this tool
 * generates: recognising a v5 someone was handed is the whole point of an
 * inspector. `null` when the value is not a UUID at all.
 */
export function inspectUuid(input: string): InspectVerdict | null {
  const hex = normalizeUuid(input)
  if (!hex) return null

  const canonical = hyphenate(hex)
  if (canonical === NIL_UUID) {
    return {
      canonical,
      version: null,
      special: "nil",
      variant: "rfc",
      timestamp: null
    }
  }
  if (canonical === MAX_UUID) {
    return {
      canonical,
      version: null,
      special: "max",
      variant: "rfc",
      timestamp: null
    }
  }

  const version = Number.parseInt(hex[12], 16)
  const variantNibble = Number.parseInt(hex[16], 16)
  const variant =
    variantNibble < 0x8
      ? "ncs"
      : variantNibble < 0xc
        ? "rfc"
        : variantNibble < 0xe
          ? "microsoft"
          : "future"

  return {
    canonical,
    version,
    special: null,
    variant,
    timestamp: readTimestamp(hex, version)
  }
}

/**
 * The embedded time, written the way a log line writes it.
 *
 * Deliberately NOT `useFormatter().dateTime`, which every other date on this
 * site goes through. Two reasons, and both are specific to this value. It is a
 * UTC instant taken out of an identifier, so rendering it in the reader's own
 * zone invites them to compare it against a log line that is in UTC and
 * conclude the tool is wrong. And the locale-aware path measurably degrades
 * here: Chrome has no Uzbek date patterns and falls back to the ICU root
 * locale, which prints `2026 M08 6` — a month written `M08` is worse than no
 * localisation at all.
 */
export function formatUtcTimestamp(ms: number): string {
  return `${new Date(ms).toISOString().slice(0, 19).replace("T", " ")} UTC`
}

/**
 * The embedded creation time, in Unix milliseconds.
 *
 * Only three versions carry one. v1 and v6 hold the same 60-bit count of
 * 100-nanosecond intervals since 1582 with the fields in a different order;
 * v7 holds Unix milliseconds directly, which is the simplification that makes
 * it sortable as text.
 */
function readTimestamp(hex: string, version: number): number | null {
  if (version === 7) {
    return Number(BigInt(`0x${hex.slice(0, 12)}`))
  }

  if (version === 1 || version === 6) {
    const intervals =
      version === 1
        ? BigInt(`0x${hex.slice(13, 16)}${hex.slice(8, 12)}${hex.slice(0, 8)}`)
        : BigInt(`0x${hex.slice(0, 12)}${hex.slice(13, 16)}`)

    const ms = intervals / INTERVALS_PER_MS - GREGORIAN_OFFSET_MS
    const asNumber = Number(ms)
    // A timestamp outside the range JavaScript's Date can hold is not a date;
    // it is a value whose version nibble happens to read 1.
    return Number.isSafeInteger(asNumber) ? asNumber : null
  }

  return null
}
