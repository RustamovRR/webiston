import type { AlgorithmStatus, DigestFormat, HashAlgorithm } from "../types"

/**
 * Tool-scoped constants.
 */

interface AlgorithmMeta {
  /** i18n key — `SHA-256` is not a comfortable JSON key. */
  key: string
  bits: number
  /**
   * Characters of hex output. Every one of these lengths is distinct, which is
   * what lets a pasted checksum be identified by its length alone.
   */
  hexLength: number
  status: AlgorithmStatus
}

export const ALGORITHM_META = {
  "SHA-256": { key: "sha256", bits: 256, hexLength: 64, status: "standard" },
  "SHA-512": { key: "sha512", bits: 512, hexLength: 128, status: "standard" },
  "SHA-384": { key: "sha384", bits: 384, hexLength: 96, status: "standard" },
  "SHA-1": { key: "sha1", bits: 160, hexLength: 40, status: "broken" },
  MD5: { key: "md5", bits: 128, hexLength: 32, status: "broken" }
} as const satisfies Record<HashAlgorithm, AlgorithmMeta>

/**
 * Ordered by what a visitor should reach for, not by publication date.
 *
 * SHA-256 is the answer to nearly every question, so it is first. The two
 * broken ones are last, carrying a badge that says so. What this replaces was
 * a four-step `Low → Very High` ladder that rated SHA-1 "Medium" eight years
 * after a working collision was published for it.
 */
export const ALGORITHMS: readonly HashAlgorithm[] = [
  "SHA-256",
  "SHA-512",
  "SHA-384",
  "SHA-1",
  "MD5"
]

/**
 * Web Crypto implements HMAC over the SHA family only — there is no HMAC-MD5.
 * The tool drops the row and says why rather than showing one it cannot fill.
 */
export const HMAC_ALGORITHMS: readonly Exclude<HashAlgorithm, "MD5">[] = [
  "SHA-256",
  "SHA-512",
  "SHA-384",
  "SHA-1"
]

export const OUTPUT_FORMATS: readonly DigestFormat[] = ["hex", "base64"]

/**
 * 20 MB.
 *
 * Not a guess and not `FILE_SIZE_LIMITS.TEXT`: the whole file is read into an
 * ArrayBuffer and MD5 runs in JavaScript at roughly 14 ms per megabyte, so the
 * ceiling is set by how long the main thread may sit still — under a third of
 * a second at this size. It covers the installers and archives people actually
 * check a published checksum against. The SHA digests are native and are not
 * the constraint.
 */
export const MAX_FILE_BYTES = 20 * 1024 * 1024

/**
 * Samples, one per job: plain text, text that is not ASCII (a digest is over
 * UTF-8 bytes, and this is where a tool that hashes UTF-16 code units gives
 * itself away), and a webhook body — the thing HMAC exists for.
 */
export const SAMPLE_KEYS = ["greeting", "uzbek", "payload"] as const

export const SAMPLE_VALUES: Record<(typeof SAMPLE_KEYS)[number], string> = {
  greeting: "Hello, World!",
  uzbek: "Oʻzbekiston Respublikasi",
  payload: '{"event":"payment.succeeded","amount":25000,"currency":"UZS"}'
}

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = [
  "verify",
  "passwords",
  "md5",
  "hmac",
  "privacy"
] as const
