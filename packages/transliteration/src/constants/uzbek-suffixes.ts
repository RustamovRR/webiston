/**
 * Uzbek grammatical suffixes
 * Used to protect technical terms with Uzbek endings
 * Example: "reactda" → "reactda" (not "реастда")
 */
export const UZBEK_SUFFIXES = [
  // Case suffixes (kelishik qo'shimchalari)
  "da",
  "dan",
  "ga",
  "ni",
  "ning",
  "ka",
  // Plural (ko'plik)
  "lar",
  "larni",
  "larda",
  "lardan",
  "larga",
  "larning",
  // Possessive (egalik)
  "i",
  "si",
  "im",
  "ing",
  "imiz",
  "ingiz",
  // Other common suffixes
  "dagi",
  "chi",
  "chilar",
  "siz",
  "li",
  "lik",
  "mi",
  "dir",
  "emas",
  // Combined
  "lari",
  "larini",
  "lariga"
] as const

export type UzbekSuffix = (typeof UZBEK_SUFFIXES)[number]
