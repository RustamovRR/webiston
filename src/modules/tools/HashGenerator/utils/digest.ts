import { encodeBytes } from "@/lib/utils"

import type { HashAlgorithm, HashOutput, VerifyVerdict } from "../types"
import { md5 } from "./md5"

/**
 * Digests, HMACs, and reading a checksum somebody pasted.
 *
 * Everything here takes bytes. A hash is defined over bytes; how text becomes
 * bytes is a decision, and it belongs to the caller rather than being made
 * silently four call sites deep.
 */

/**
 * A view over a PLAIN ArrayBuffer.
 *
 * Not cosmetic: `BufferSource` excludes `SharedArrayBuffer`-backed views, so a
 * bare `Uint8Array` — whose buffer is `ArrayBufferLike` — is not assignable to
 * what `crypto.subtle` accepts. Saying it in the signature makes the callers
 * prove it; the alternative is a defensive `.slice()` that copies the whole
 * file on every one of the five digests.
 */
type Bytes = Uint8Array<ArrayBuffer>

export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")

/** Third consumer of `lib/utils/base64` — chunked, so a 1 MB file is safe. */
export const toBase64 = (bytes: Uint8Array): string => encodeBytes(bytes)

export async function digest(
  bytes: Bytes,
  algorithm: HashAlgorithm
): Promise<Uint8Array> {
  if (algorithm === "MD5") return md5(bytes)
  // Web Crypto takes these names verbatim — see `types/HashAlgorithm`.
  const buffer = await crypto.subtle.digest(algorithm, bytes)
  return new Uint8Array(buffer)
}

/**
 * HMAC — the keyed digest, and the thing paid API clients charge for.
 *
 * Used for webhook signatures (Stripe, GitHub, Telegram all sign this way), so
 * "did this request really come from them" is answerable here rather than by
 * writing a script.
 *
 * Web Crypto has no MD5, so there is no HMAC-MD5. The UI says so rather than
 * offering a row that cannot be filled.
 */
export async function hmac(
  bytes: Bytes,
  key: Bytes,
  algorithm: Exclude<HashAlgorithm, "MD5">
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, bytes)
  return new Uint8Array(signature)
}

/**
 * The digest out of the shapes checksums are actually published in.
 *
 * Nobody copies a bare hex string. They copy a line off a release page, and it
 * is one of these four:
 *
 * ```
 * 65a8e27d…                                 bare
 * 65a8e27d…  ubuntu-24.04.iso               GNU coreutils (sha256sum)
 * SHA256 (ubuntu-24.04.iso) = 65a8e27d…     BSD (shasum -a 256)
 * sha256:65a8e27d…                          OCI / Docker
 * ```
 */
export function stripChecksumLabel(value: string): string {
  const compact = value.trim()
  if (!compact) return ""

  // BSD. Anchored on the whole `NAME (file) =` shape so it cannot mistake the
  // `=` padding at the end of a base64 digest for a separator.
  const bsd = /^[A-Za-z0-9-]+\s*\([^)]*\)\s*=\s*(\S+)$/.exec(compact)
  if (bsd) return bsd[1]

  // OCI. Restricted to the algorithm names so a stray colon cannot trigger it.
  const prefixed = /^(?:md5|sha1|sha256|sha384|sha512)[:=]\s*(\S+)$/i.exec(
    compact
  )
  if (prefixed) return prefixed[1]

  // coreutils, and the bare case, which are the same rule.
  return compact.split(/\s+/)[0]
}

/**
 * Does a pasted checksum match anything we just computed?
 *
 * Hex is compared case-insensitively — half the world publishes uppercase.
 * Base64 is NOT: its alphabet is case-significant, and folding case there
 * would report a match between two different digests.
 */
export function verifyChecksum(
  expected: string,
  outputs: readonly HashOutput[]
): VerifyVerdict | null {
  const candidate = stripChecksumLabel(expected)
  if (!candidate) return null

  const lowered = candidate.toLowerCase()

  for (const output of outputs) {
    if (output.hex === lowered || output.base64 === candidate) {
      return { kind: "match", algorithm: output.algorithm }
    }
  }

  // No match — but the length still identifies which algorithm produced it,
  // and naming it is the difference between "wrong" and "you are comparing a
  // SHA-256 against a file whose SHA-256 is this one instead".
  // One rendering or the other, never both: falling through from hex to
  // Base64 would call a 44-character hex string a SHA-256 Base64 digest,
  // because 44 is that digest's Base64 length.
  const isHex = /^[0-9a-f]+$/.test(lowered)
  const named = isHex
    ? outputs.find((output) => output.hex.length === lowered.length)
    : outputs.find((output) => output.base64.length === candidate.length)

  return named
    ? { kind: "mismatch", algorithm: named.algorithm }
    : { kind: "unknown" }
}
