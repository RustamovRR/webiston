/**
 * Search terms for the hash generator.
 *
 * What this replaces was ~90 entries across three languages — including a
 * 20-term Russian block for a locale this site does not serve, and
 * `"bulk hash generation"` and `"batch hash processing"` for features the tool
 * has never had. Kept short and true.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  "hash generator",
  "sha256 generator",
  "md5 generator",
  "checksum calculator",
  "verify checksum online",
  "hmac generator",
  "hash yaratish",
  "checksum tekshirish",
  "fayl hash",
  "bepul hash generator"
]
