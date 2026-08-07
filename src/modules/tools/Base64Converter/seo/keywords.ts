/**
 * Search terms for the Base64 converter.
 *
 * What this replaces was ~50 entries across three languages, including a
 * Russian block for a locale the site does not serve (`routing.ts` lists `uz`
 * and `en` only) and the same phrase repeated in several spellings.
 *
 * Kept short and true. A keyword list is a weak ranking signal at best; one
 * that promises what the page does not do is a bounce.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  "base64 converter",
  "base64 encode",
  "base64 decode",
  "base64 kodlash",
  "base64 dekodlash",
  "base64url",
  "url safe base64",
  "text to base64",
  "base64 to text",
  "image to base64",
  "rasmni base64 ga o'girish",
  "base64 decoder online",
  "bepul base64 converter"
]
