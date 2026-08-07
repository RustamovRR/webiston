/**
 * Tool-scoped types.
 *
 * `UuidVersion` is what the generator can PRODUCE; `inspect()` reads every
 * version RFC 9562 defines, including the ones we do not generate (v3 and v5
 * need a namespace and a name, v2 is a DCE relic). Those are two different
 * lists on purpose — a tool that can only recognise what it can make is a
 * tool that calls a perfectly valid v5 UUID unknown.
 */

/** Versions this tool generates. */
export type UuidVersion = "v4" | "v7" | "v1" | "nil"

/** Delimiter style. Case is a separate axis — see `UuidCase`. */
export type UuidFormat = "standard" | "compact" | "braces"

export type UuidCase = "lower" | "upper"

export interface InspectVerdict {
  /** The canonical, hyphenated, lower-case form of what was pasted. */
  canonical: string
  /** 1–8, or `null` when the value is the Nil or Max UUID. */
  version: number | null
  /** `nil` and `max` are special-cased by the RFC; they carry no version. */
  special: "nil" | "max" | null
  variant: "rfc" | "ncs" | "microsoft" | "future"
  /** Milliseconds since the Unix epoch, for the versions that embed a time. */
  timestamp: number | null
}
