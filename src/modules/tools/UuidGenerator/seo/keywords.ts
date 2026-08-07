/**
 * Search terms for the UUID generator.
 *
 * What this replaces was ~100 entries inline in the route file across three
 * languages — including a 20-term Russian block for a locale this site does
 * not serve, `"uuid validation"` and `"bulk uuid generation"` for things the
 * page could not do, and six "long-tail" sentences nobody has ever typed into
 * a search box. Kept short and true.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  "uuid generator",
  "uuid v4 generator",
  "uuid v7 generator",
  "guid generator",
  "uuid decoder",
  "uuid timestamp",
  "uuid yaratish",
  "noyob identifikator",
  "uuid tekshirish",
  "bepul uuid generator"
]
