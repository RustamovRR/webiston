/**
 * Search terms for the colour converter.
 *
 * What this replaces was 60+ entries in three languages, including a Russian
 * block for a locale the site does not serve (`routing.ts` lists `uz` and `en`
 * only) and repeated duplicates of "color converter". It also advertised
 * `cmyk converter` — the tool has never supported CMYK.
 *
 * Kept short and true. A keyword list is a weak ranking signal at best; a list
 * that promises features the page does not have is a bounce.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  "color converter",
  "rang konverter",
  "hex to rgb",
  "rgb to hex",
  "hex to hsl",
  "rgb to oklch",
  "hex to oklch",
  "oklch converter",
  "color palette generator",
  "palitra generator",
  "tailwind color shades",
  "wcag contrast checker",
  "kontrast tekshirish",
  "color picker",
  "rang tanlash",
  "bepul color converter",
  "onlayn rang konverter"
]
