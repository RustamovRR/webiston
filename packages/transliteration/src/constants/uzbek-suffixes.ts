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

/**
 * Uzbek suffixes that begin with "s".
 *
 * These are the only reason the letter pair "ts" is ever TWO letters in Uzbek
 * rather than the Cyrillic "ц": a verb or noun stem ending in "t" meeting a
 * suffix starting with "s" — ket+sin, ayt+sam, yot+sa, kredit+siz.
 *
 * Everywhere else "ts" is the Russian "ц" that Uzbek borrowed wholesale, and
 * the "-tsiya" family alone runs to hundreds of everyday words: informatsiya,
 * operatsiya, konstitutsiya, stantsiya, delegatsiya, revolyutsiya.
 *
 * Ordered longest-first so "sangiz" is tested before "sang" before "san".
 */
export const S_INITIAL_SUFFIXES = [
  "sinlar",
  "sangiz",
  "sizlar",
  "salar",
  "simon",
  "sang",
  "sizmi",
  "sin",
  "sam",
  "san",
  "sak",
  "siz",
  "sa"
] as const
