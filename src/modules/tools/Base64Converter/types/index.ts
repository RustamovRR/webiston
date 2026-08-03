export type ConversionMode = "encode" | "decode"

/** Why a decode could not happen — each maps to one translated sentence. */
export type Base64Failure = "empty" | "alphabet" | "length" | "binary"

export type DecodeResult =
  | { ok: true; text: string; byteCount: number }
  | { ok: false; reason: Base64Failure }

/** Why a file could not be read — same treatment as a decode failure. */
export type FileFailure = "tooLarge" | "unsupported" | "unreadable"

export interface Base64Sample {
  key: string
  label: string
  value: string
}
