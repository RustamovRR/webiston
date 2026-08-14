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

/**
 * A phone number, in the shape an Uzbek document writes it:
 * `+998 90 123 45 67`.
 *
 * The mask FORMATS but never INVENTS. It does not silently prepend 998 the
 * moment a digit appears, and that restraint is what makes deletion work: a
 * mask that re-adds the country code cannot be backspaced past, which is the
 * classic trap of hand-rolled phone fields. The prefill lives in the input
 * component instead, where it belongs — a convenience the visitor can undo.
 *
 * A foreign number is grouped, not corrected: a CV is not the place to tell
 * someone their own country's format is wrong.
 */
export function maskPhone(input: string): string {
  const hasPlus = input.trimStart().startsWith("+")
  const digits = input.replace(/\D/g, "")
  if (!digits) return hasPlus ? "+" : ""

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

  const rest = digits.slice(0, 15)
  const groups = [
    rest.slice(0, 2),
    rest.slice(2, 5),
    rest.slice(5, 7),
    rest.slice(7, 9),
    rest.slice(9)
  ].filter(Boolean)
  return (hasPlus ? "+" : "") + groups.join(" ")
}
