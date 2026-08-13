import { isoDate } from "../../utils/dates"

/**
 * The tilxat's fixed vocabulary, and the decisions behind it.
 *
 * The document's REQUIRED elements are not this file's invention. They are the
 * list a bank's legal team publishes (avobank.uz, "Tilxat asosida qarz olish"):
 * both parties' full name + passport + registration address, the sum in digits
 * AND in words, the date given and the return deadline, how the money changed
 * hands, and the borrower's handwritten signature. The legal force comes from
 * the Civil Code: FK 733 — a borrower's tilxat satisfies the written form a
 * loan above ten BHM requires. Sources are cited in the FAQ, on the page.
 */

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
 * composer is the single place that formats, blanks or refuses.
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

/**
 * How the money changed hands — one of the bank list's required elements, and
 * the one every home-made tilxat forgets. Cash and card transfer, because
 * those are the two ways money moves between two people here; anything more
 * exotic can be written into the address of the same sentence by hand.
 */
export const PAYMENT_METHODS = [
  { id: "naqd", phrase: "naqd pul ko'rinishida" },
  { id: "karta", phrase: "bank kartasiga pul o'tkazish orqali" }
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"]

/** The questions on the page, in the order they are asked. */
export const TILXAT_FAQ_KEYS = [
  "legal",
  "elements",
  "handwritten",
  "notary",
  "currency",
  "privacy"
] as const

/**
 * A fresh form. The shell `structuredClone`s it into state, so the shared
 * default itself is never handed to React — no freeze needed, no aliasing.
 */
export const EMPTY_TILXAT: TilxatData = {
  borrower: { fullName: "", passport: "", pinfl: "", address: "" },
  lender: { fullName: "", passport: "", pinfl: "", address: "" },
  amount: "",
  method: "naqd",
  interestFree: true,
  city: "",
  givenDate: "",
  returnDate: "",
  witnesses: ["", ""]
}

/** How long the sample loan runs — three months, a plausible personal term. */
const SAMPLE_MONTHS = 3

/**
 * A completed tilxat, for the "Namuna" button.
 *
 * A blank form of sixteen fields does not tell a first-time visitor what a
 * finished tilxat LOOKS like — which is the whole reason people search
 * "tilxat namunasi" in the first place. So the sample fills every field,
 * including the optional ones, and the visitor edits from there.
 *
 * The people are invented but internally consistent, because a sample that
 * contradicts itself teaches the wrong shape: the JSHSHIRs carry the gender
 * and birth-date digits that match the names (3 = male / 4 = female born last
 * century, then DDMMYYYY, then the serial), and the passports are in the two
 * letters + seven digits the validator enforces.
 *
 * `now` is passed in so the dates are always in the future, and so nothing
 * reads the clock at module scope where the server and the browser disagree.
 */
export const buildSampleTilxat = (now: Date): TilxatData => ({
  borrower: {
    fullName: "Aliyev Vali Salimovich",
    passport: "AB 1234567",
    pinfl: "31205199012345",
    address:
      "Toshkent shahri, Chilonzor tumani, Bunyodkor shoh ko'chasi, 12-uy, 45-xonadon"
  },
  lender: {
    fullName: "Karimova Nodira Anvarovna",
    passport: "AC 7654321",
    pinfl: "40803198554321",
    address:
      "Toshkent shahri, Yunusobod tumani, Amir Temur shoh ko'chasi, 108-uy, 12-xonadon"
  },
  amount: "15 000 000",
  method: "naqd",
  interestFree: true,
  city: "Toshkent shahri",
  givenDate: isoDate(now),
  returnDate: isoDate(
    new Date(now.getFullYear(), now.getMonth() + SAMPLE_MONTHS, now.getDate())
  ),
  witnesses: ["Toshmatov Eshmat Akramovich", "Yo'ldosheva Zilola Baxtiyorovna"]
})
