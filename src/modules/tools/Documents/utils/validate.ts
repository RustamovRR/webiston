/**
 * Field validation for a legal form, sized for ONE form.
 *
 * Deliberately not zod/yup/react-hook-form: none of them is in this repo, and
 * pulling a schema library plus a form state manager in for ten fields is the
 * over-engineering CLAUDE.md forbids. These are pure functions with their own
 * tests — the moment a THIRD document form exists, promoting to a schema
 * library becomes the right call, and these predicates become its refinements.
 *
 * The philosophy matches the document builder: an EMPTY field is never an
 * error (the blank form is printable on purpose); a FILLED field with garbage
 * in it is — "aa12341234123412341234" as a passport must be caught before it
 * reaches a paper someone signs.
 */

/**
 * Uzbek passport and ID-card series: two Latin letters, seven digits.
 *
 * "AA1234567", "aa 1234567" and "AA 1234567" are all the same document typed
 * three ways, so validation is case- and space-insensitive and
 * `normalisePassport` settles the written form.
 */
const PASSPORT = /^[A-Za-z]{2}\s?\d{7}$/

export function isValidPassport(value: string): boolean {
  return PASSPORT.test(value.trim())
}

/** "aa1234567" → "AA 1234567" — the form the printed document uses. */
export function normalisePassport(value: string): string {
  const trimmed = value.trim()
  if (!PASSPORT.test(trimmed)) return trimmed
  const compact = trimmed.replace(/\s/g, "")
  return `${compact.slice(0, 2).toUpperCase()} ${compact.slice(2)}`
}

/**
 * JSHSHIR (PINFL): exactly fourteen digits. The first is 3–6 in every real
 * one (century+gender), but enforcing that would reject nothing a typo
 * produces and complicate the message — length is the useful check.
 */
export function isValidPinfl(value: string): boolean {
  return /^\d{14}$/.test(value.replace(/\s/g, ""))
}

/**
 * A person's name: letters (either script), apostrophes, hyphens, dots and
 * spaces. The one thing it firmly rejects is digits — "12341234" in a name
 * field is the exact garbage the screenshot showed on the sheet.
 */
export function isValidName(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 2) return false
  return /^[A-Za-zЀ-ӿ'ʻ’.\-\s]+$/.test(trimmed)
}

/**
 * An address must contain SOME letters. Not a format check — Uzbek addresses
 * are too varied for one — just the digits-only guard.
 */
export function isValidAddress(value: string): boolean {
  const letters = value.match(/[A-Za-zЀ-ӿ]/g) ?? []
  return letters.length >= 3
}

/** Return date on or after the loan date. Empty on either side is fine. */
export function isDateOrderValid(
  givenDate: string,
  returnDate: string
): boolean {
  if (!givenDate || !returnDate) return true
  // ISO yyyy-mm-dd compares correctly as a string.
  return returnDate >= givenDate
}
