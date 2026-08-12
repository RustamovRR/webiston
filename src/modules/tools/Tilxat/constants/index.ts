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

/** Uzbek month names, indexed by month number − 1. For "2026-yil 12-avgust". */
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

/**
 * What stands in for a field the visitor has not filled yet.
 *
 * Long enough to write on by hand: a printed tilxat with blanks IS the blank
 * form people take to the meeting, so an empty form is a feature, not an
 * error state — nothing in this tool ever refuses to render.
 */
export const BLANK = "______________________"
/** A shorter rule for the sum's digits. */
export const BLANK_SHORT = "____________"

/** The two scripts the document renders in. Ids double as message keys. */
export const TILXAT_SCRIPTS = ["lotin", "kirill"] as const

/**
 * The sheet's own colours and face — the PAPER exception.
 *
 * A tilxat is a document, not interface: it must look identical in light and
 * dark mode and identical to what the printer produces, so semantic tokens —
 * which exist to flip with the scheme — are exactly wrong here. Same category
 * as the code-snapshot canvas and the chart palettes (`code-rules.md` §11):
 * named constants in one place, never inline.
 */
export const PAPER = {
  background: "#ffffff",
  ink: "#111111",
  /** Times is what Uzbek official documents are set in; Georgia is the metric-compatible fallback. */
  fontFamily: "'Times New Roman', Georgia, serif"
} as const

/** The questions on the page, in the order they are asked. Read by the FAQ component AND the FAQPage schema. */
export const FAQ_KEYS = [
  "legal",
  "elements",
  "handwritten",
  "notary",
  "currency",
  "privacy"
] as const

/**
 * A fresh form. The hook `structuredClone`s it into state, so the shared
 * default itself is never handed to React — no freeze needed, no aliasing.
 */
export const EMPTY_TILXAT = {
  borrower: { fullName: "", passport: "", pinfl: "", address: "" },
  lender: { fullName: "", passport: "", pinfl: "", address: "" },
  amount: "",
  method: "naqd" as const,
  interestFree: true,
  city: "",
  givenDate: "",
  returnDate: "",
  witnesses: ["", ""] as [string, string]
}
