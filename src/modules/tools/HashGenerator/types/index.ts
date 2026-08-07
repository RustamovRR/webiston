/**
 * Web Crypto's own spelling, used verbatim.
 *
 * `crypto.subtle.digest` takes exactly these strings, so there is no mapping
 * table between what the UI shows and what the API is asked for — the class of
 * bug where a label and a call drift apart cannot occur.
 *
 * MD5 is the exception: Web Crypto deliberately does not implement it, so it
 * is served by `utils/md5.ts`.
 */
export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"

/** How a digest is written out. Checksums are published both ways. */
export type DigestFormat = "hex" | "base64"

/**
 * Two values, not four.
 *
 * What this replaces was a `Low | Medium | High | Very High` ladder that put
 * SHA-1 at "Medium" — SHA-1 has a published collision — and implied SHA-512 is
 * safer than SHA-256 in some way that affects the choice. It is not. Either an
 * algorithm has a practical collision attack or it does not.
 */
export type AlgorithmStatus = "broken" | "standard"

/** One algorithm's digest, in both renderings, so the format toggle is free. */
export interface HashOutput {
  algorithm: HashAlgorithm
  hex: string
  base64: string
}

/**
 * What a pasted checksum turned out to be.
 *
 * `mismatch` names the algorithm anyway — the length identifies it, and "this
 * is a SHA-256 and it does not match" is a far more useful answer than "no".
 */
export type VerifyVerdict =
  | { kind: "match"; algorithm: HashAlgorithm }
  | { kind: "mismatch"; algorithm: HashAlgorithm }
  | { kind: "unknown" }

/** Why a file could not be used — each maps to one translated sentence. */
export type FileFailure = "tooLarge" | "unreadable"

/**
 * What is being hashed.
 *
 * A file is kept as BYTES. The old tool read every upload with
 * `reader.readAsText`, hashed the resulting string and called the answer a file
 * hash — so a file with a BOM, CRLF line endings or any non-UTF-8 byte got a
 * digest that `sha256sum` disagrees with, which defeats the only reason to
 * hash a file.
 */
export interface FileSource {
  name: string
  size: number
  /** `<ArrayBuffer>`, not `Uint8Array` — see `utils/digest.ts`. */
  bytes: Uint8Array<ArrayBuffer>
}

export interface HashSample {
  key: string
  label: string
  value: string
}
