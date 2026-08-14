import { UZBEK_MONTHS } from "@/constants/uzbek"

/** "2026-08-12" → "2026-yil 12-avgust"; anything else → null. */
export function formatUzbekDate(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null

  const month = UZBEK_MONTHS[Number(match[2]) - 1]
  if (!month) return null

  // `Number` strips the leading zero: documents write "2-avgust", not "02-".
  return `${match[1]}-yil ${Number(match[3])}-${month}`
}

/** A local ISO day. `toISOString()` is UTC and shifts the date in UTC+5. */
export function isoDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-")
}

/**
 * `iso` plus N CALENDAR days — what the Labour Code counts.
 *
 * Built through the local `Date` constructor, which rolls months and years
 * over correctly and does not care that February is short. Returns "" for an
 * unreadable date, so a half-typed field produces a blank rather than
 * "NaN-yil".
 */
export function addCalendarDays(iso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ""

  const shifted = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]) + days
  )
  return isoDate(shifted)
}

/**
 * `iso` plus N calendar MONTHS — what MK 160 says for a head or a deputy.
 *
 * Not "60 days": the article counts months, and February would put the answer
 * two days out. The `Date` constructor clamps an overflowing day forward
 * (31 December + 2 months → 3 March), which is the conservative direction for
 * a notice period — never earlier than the law allows.
 */
export function addCalendarMonths(iso: string, months: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ""

  const shifted = new Date(
    Number(match[1]),
    Number(match[2]) - 1 + months,
    Number(match[3])
  )
  return isoDate(shifted)
}

/** Second date on or after the first. Empty on either side is fine. */
export function isDateOrderValid(earlier: string, later: string): boolean {
  if (!earlier || !later) return true
  // ISO yyyy-mm-dd compares correctly as a string.
  return later >= earlier
}

/**
 * "Aliyev Vali Salimovich" → "Aliyev V.S." — the signature line's name.
 * The first word is treated as the surname, which is how Uzbek documents
 * order names.
 */
export function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ""
  if (words.length === 1) return words[0]
  const initials = words
    .slice(1)
    .map((word) => `${word[0].toUpperCase()}.`)
    .join("")
  return `${words[0]} ${initials}`
}
