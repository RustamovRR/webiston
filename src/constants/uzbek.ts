/**
 * Facts about the Uzbek language itself — shared by any tool that writes a
 * date in prose. Lived in the Documents module until the resume builder
 * became the second consumer; promoted here per the §14 rule.
 */

/** Indexed by month number − 1. For "2026-yil 12-avgust" and "2024-yil mart". */
export const UZBEK_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr"
] as const
