import type { PAYMENT_METHODS, TILXAT_SCRIPTS } from "../constants"

/** One side of the loan. All three fields appear verbatim in the document. */
export interface TilxatParty {
  fullName: string
  /** Series and number, e.g. "AB 1234567". Never transliterated. */
  passport: string
  /** JSHSHIR — 14 digits, optional. Also shielded from transliteration. */
  pinfl: string
  /** Registration address, as the person would write it on a form. */
  address: string
}

/**
 * Everything the visitor fills in. Raw strings, exactly as typed — the
 * document builder is the single place that formats, blanks or refuses.
 */
export interface TilxatData {
  borrower: TilxatParty
  lender: TilxatParty
  /** The sum as typed; `parseAmount` reads it, blanks stand in until it does. */
  amount: string
  method: PaymentMethod
  /** "Qarz foizsiz berildi." is stated only while this is true. */
  interestFree: boolean
  /** Place line, verbatim — the label tells the visitor to include "shahri". */
  city: string
  /** ISO dates from `<input type="date">`; empty until picked. */
  givenDate: string
  returnDate: string
  /** Up to two. Empty entries render no witness block at all. */
  witnesses: [string, string]
}

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"]
export type TilxatScript = (typeof TILXAT_SCRIPTS)[number]
