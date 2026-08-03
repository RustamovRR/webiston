export type ConversionMode = "encode" | "decode"

/**
 * WHICH url-encoding is meant. These are two different standards, not a
 * preference — see `utils/urlCodec.ts`.
 */
export type UrlScope = "value" | "whole"

/** Why a decode could not happen — each maps to one translated sentence. */
export type UrlFailure = "malformed" | "tooLong"

export type CodecResult =
  | { ok: true; output: string }
  | { ok: false; reason: UrlFailure }

/** Why a file could not be read. */
export type FileFailure = "tooLarge" | "unsupported" | "unreadable"

export interface UrlSample {
  key: string
  label: string
  value: string
}

/** One `key=value` pair of a query string, already decoded. */
export interface QueryPair {
  key: string
  value: string
}
