/**
 * Search terms for the JWT decoder.
 *
 * What this replaces was ~50 entries across three languages, including a
 * Russian block for a locale the site does not serve. Kept short and true — in
 * particular it does NOT claim "jwt verify" or "jwt validator", because this
 * tool deliberately does not verify signatures.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  "jwt decoder",
  "jwt dekoder",
  "decode jwt",
  "jwt token ochish",
  "json web token",
  "jwt payload",
  "jwt header",
  "jwt expiry",
  "jwt muddati",
  "jwt parser online",
  "bepul jwt decoder"
]
