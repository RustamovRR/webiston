/**
 * Input masks — the keystroke-level half of validation.
 *
 * `validate.ts` answers "is this field wrong?" AFTER the fact. That is the
 * wrong moment for a fixed-shape identifier: a passport field that accepts
 * "asdfasdfad" and then argues about it in red is a field that let the person
 * waste the typing. These functions run on every keystroke, so the field can
 * only ever HOLD a legal prefix of the format.
 *
 * Written here rather than pulled in: `react-input-mask` and `cleave.js` are
 * both unmaintained, `imask` is ~10 kB gzipped, `@react-input/mask` is another
 * runtime dependency for four format rules, and shadcn/ui has no masked input
 * (Radix has no input primitive at all). A handful of fixed formats do not
 * earn a dependency — but they do earn a named, tested module, so the next
 * form has something to import instead of another hand-rolled regex.
 *
 * Promoted out of the Documents module when the resume builder's phone field
 * became a consumer outside it.
 *
 * All three are IDEMPOTENT — `mask(mask(x)) === mask(x)` — which is what makes
 * them safe in a controlled `onChange`: re-masking a value React already holds
 * can never move the value, and therefore never fights the caret.
 */

/**
 * Uzbek passport / ID card: two letters, then seven digits, "AB 1234567".
 *
 * Letters can only occupy the first two slots and are upper-cased as typed;
 * everything after them is digits, capped at seven. The space is inserted by
 * the mask, so the visitor never types it and can never type two.
 */
export function maskPassport(input: string): string {
  const compact = input.replace(/[^A-Za-z0-9]/g, "")
  const letters = (/^[A-Za-z]{0,2}/.exec(compact)?.[0] ?? "").toUpperCase()
  const digits = compact.slice(letters.length).replace(/\D/g, "").slice(0, 7)
  // `filter` keeps a digits-first paste visible instead of eating it silently;
  // the validator still marks it, which is the honest outcome.
  return [letters, digits].filter(Boolean).join(" ")
}

/** JSHSHIR (PINFL): fourteen digits, nothing else, nothing longer. */
export function maskPinfl(input: string): string {
  return input.replace(/\D/g, "").slice(0, 14)
}

/**
 * The sum: digits, the spaces people group them with, and a decimal comma.
 *
 * Deliberately loose — `parseAmount` owns what a VALID sum is, and this only
 * removes what could never be part of one. Pasting "5 000 000 so'm" out of a
 * chat message leaves "5 000 000 ", which parses.
 */
export function maskAmount(input: string): string {
  const cleaned = input.replace(/[^\d\s.,]/g, "")
  // Spaces and commas are SEPARATORS; without a digit to separate they are
  // nothing, so "besh million" empties the field instead of leaving " ".
  return /\d/.test(cleaned) ? cleaned.slice(0, MAX_AMOUNT_CHARS) : ""
}

/** Longer than any so'm figure a person writes — a paste guard, not a rule. */
const MAX_AMOUNT_CHARS = 24

/** What the phone field offers when it is empty and the visitor is in it. */
export const UZ_DIAL_PREFIX = "+998 "

/**
 * What the phone field should hold once the visitor LEAVES it.
 *
 * `maskPhone` runs on every keystroke and therefore may never guess; this runs
 * once, on blur, when the caret is no longer in play — so it is the one moment
 * a guess is safe. It does two things and nothing else:
 *
 * - Drops a lone country code. The field OFFERS `+998 ` on focus, so tabbing
 *   through it would otherwise print a bare "+998" on the CV as if it were a
 *   phone number.
 * - Completes a bare national number. Nine digits with no country code is an
 *   Uzbek mobile in every realistic case, and finishing it here cannot fight
 *   the typing the way a mid-keystroke guess would.
 */
export function settlePhone(input: string): string {
  const digits = input.replace(/\D/g, "")
  if (!digits || digits === "998") return ""
  if (!input.includes("+") && digits.length === 9) {
    return maskPhone(`998${digits}`)
  }
  return maskPhone(input)
}

/**
 * A phone number: strict for Uzbekistan, hands-off for everywhere else.
 *
 * `+998` is a KNOWN shape — nine national digits, written `+998 90 123 45 67`
 * on every document in the country — so it is masked properly and capped.
 *
 * Anything else keeps the grouping the visitor typed, minus characters that
 * could never belong to a phone number. An earlier version imposed the Uzbek
 * 2-3-2-2 grouping on foreign numbers as well, which turned `+1 555 123 4567`
 * into `+15 551 23 45 67` and `+44 20 7946 0958` into `+44 207 94 60 958` —
 * not formatting but corrupting, on the one line of a CV whose whole job is
 * being called back. No table of national groupings is worth shipping for the
 * handful of visitors this affects, and leaving it alone is both smaller and
 * more correct than a confident wrong guess.
 *
 * The mask FORMATS but never INVENTS: it does not prepend 998 the moment a
 * digit appears. That restraint is what makes deletion work — a mask that
 * re-adds the country code cannot be backspaced past, the classic trap of
 * hand-rolled phone fields. Offering the prefix belongs to the input
 * component, and `settlePhone` takes it back off on the way out.
 */
export function maskPhone(input: string): string {
  const digits = input.replace(/\D/g, "")

  if (digits.startsWith("998")) {
    // 9 national digits — the whole of an Uzbek mobile number.
    const rest = digits.slice(3, 12)
    const groups = [
      rest.slice(0, 2),
      rest.slice(2, 5),
      rest.slice(5, 7),
      rest.slice(7, 9)
    ].filter(Boolean)
    return ["+998", ...groups].join(" ")
  }

  const cleaned = input
    .replace(/[^\d\s+()-]/g, "")
    // A country code leads or it is a typo; `+` in the middle is never one.
    .replace(/(?!^)\+/g, "")
    .slice(0, MAX_PHONE_CHARS)
  // Separators alone are not the start of a number, and emptying here is what
  // lets the input component see a blank field and offer the prefix back.
  return /[\d+]/.test(cleaned) ? cleaned : ""
}

/** Longer than any international number written with its separators. */
const MAX_PHONE_CHARS = 24
