export type ConversionMode = "encode" | "decode"

/** Why a file could not be read — same treatment as a decode failure. */
export type FileFailure = "tooLarge" | "unsupported" | "unreadable"

export interface Base64Sample {
  key: string
  label: string
  value: string
}
