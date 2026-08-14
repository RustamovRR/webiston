import { formatAmount, parseAmount } from "@/lib/uzbek-number-words/amount"
import { amountToWords, integerToWords } from "@/lib/uzbek-number-words/words"

import { BLANK_SHORT } from "../../constants"
import type {
  DocumentBlock,
  DocumentErrors,
  DocumentSegment
} from "../../types"
import { initialsOf, isDateOrderValid } from "../../utils/dates"
import {
  blank,
  block,
  dateField,
  field,
  plainText,
  toCyrillicBlocks,
  tpl,
  val
} from "../../utils/segments"
import {
  isValidAddress,
  isValidName,
  isValidPassport,
  isValidPinfl,
  normalisePassport
} from "../../utils/validate"
import { PAYMENT_METHODS, type TilxatData, type TilxatParty } from "./constants"

/**
 * The sum, the way a document carries it: digits, then words in brackets.
 *
 * Round sums read "5 000 000 (besh million) so'm" — currency OUTSIDE the
 * brackets, the convention contracts and the law's own text use. A sum with
 * tiyin moves the whole spelled form inside, because the tiyin needs naming
 * too: "5 000 000,50 (besh million so'm ellik tiyin)".
 */
function sumSegments(amount: string): DocumentSegment[] {
  const fallback = [blank(BLANK_SHORT), tpl(" ("), blank(), tpl(") so'm")]
  const parsed = parseAmount(amount)
  if (!parsed.ok) return fallback

  // Print-and-paste territory: ordinary spaces, ASCII minus — written as
  // escapes because U+202F is indistinguishable from a space in an editor.
  const digits = formatAmount(parsed.amount)
    .replace(/\u202f/g, " ")
    .replace(/\u2212/g, "-")

  if (parsed.amount.fraction > 0) {
    const words = amountToWords(parsed.amount, "sum")
    return words ? [val(`${digits} (${words.latin})`)] : fallback
  }

  const words = integerToWords(parsed.amount.integer)
  return words ? [val(`${digits} (${words}) so'm`)] : fallback
}

/** Passport plus the optional JSHSHIR, both shielded from transliteration. */
function passportSegments(party: TilxatParty): DocumentSegment[] {
  const passport = party.passport.trim()
  const segments: DocumentSegment[] = [
    passport && isValidPassport(passport)
      ? val(normalisePassport(passport), false)
      : blank(BLANK_SHORT)
  ]

  const pinfl = party.pinfl.replace(/\s/g, "")
  if (pinfl && isValidPinfl(pinfl)) {
    segments.push(tpl(", JSHSHIR: "), val(pinfl, false))
  }

  return segments
}

/** The Latin document, as blocks — the single source both scripts derive from. */
export function composeTilxat(data: TilxatData): DocumentBlock[] {
  const method =
    PAYMENT_METHODS.find((item) => item.id === data.method)?.phrase ??
    PAYMENT_METHODS[0].phrase

  const signature = isValidName(data.borrower.fullName)
    ? initialsOf(data.borrower.fullName)
    : ""

  const blocks: DocumentBlock[] = [
    // A tilxat opens with its title; an ariza puts the addressee column above
    // it. That disagreement is why the title is a block a composer places,
    // not a fixed slot in the sheet.
    block([tpl("TILXAT")], { heading: true }),
    block(
      [
        tpl("Men, "),
        field(data.borrower.fullName, isValidName),
        tpl(", pasport "),
        ...passportSegments(data.borrower),
        tpl(", "),
        field(data.borrower.address, isValidAddress),
        tpl(" manzilida yashovchi, "),
        field(data.lender.fullName, isValidName),
        tpl(" (pasport "),
        ...passportSegments(data.lender),
        tpl(", "),
        field(data.lender.address, isValidAddress),
        tpl(" manzilida yashovchi)dan "),
        dateField(data.givenDate),
        tpl(` kuni ${method} `),
        ...sumSegments(data.amount),
        tpl(" miqdorida pul mablag'ini qarzga oldim.")
      ],
      { indent: true }
    ),
    block(
      [
        tpl("Mazkur summani "),
        dateField(data.returnDate),
        tpl(
          "gacha to'liq qaytarib berish majburiyatini o'z zimmamga olaman." +
            (data.interestFree ? " Qarz foizsiz berildi." : "")
        )
      ],
      { indent: true }
    ),
    block([
      field(data.city, isValidAddress),
      tpl(", "),
      dateField(data.givenDate)
    ]),
    block([
      tpl("Qarz oluvchi: ______________________ "),
      signature ? val(signature) : blank()
    ])
  ]

  const witnesses = data.witnesses.filter(
    (name) => name.trim() && isValidName(name)
  )
  if (witnesses.length > 0) {
    blocks.push(
      block([
        tpl("Guvohlar:"),
        ...witnesses.flatMap((name, index) => [
          tpl(`\n${index + 1}. ______________________ `),
          val(initialsOf(name))
        ])
      ])
    )
  }

  return blocks
}

/** Only FILLED fields can be wrong; an empty one is the blank form. */
export function validateTilxat(data: TilxatData): DocumentErrors {
  const found: DocumentErrors = {}

  const party = (role: "borrower" | "lender", value: TilxatParty) => {
    if (value.fullName.trim() && !isValidName(value.fullName)) {
      found[`${role}.fullName`] = "name"
    }
    if (value.passport.trim() && !isValidPassport(value.passport)) {
      found[`${role}.passport`] = "passport"
    }
    if (value.pinfl.trim() && !isValidPinfl(value.pinfl)) {
      found[`${role}.pinfl`] = "pinfl"
    }
    if (value.address.trim() && !isValidAddress(value.address)) {
      found[`${role}.address`] = "address"
    }
  }
  party("borrower", data.borrower)
  party("lender", data.lender)

  if (data.amount.trim()) {
    const parsed = parseAmount(data.amount)
    if (!parsed.ok) {
      // "Too large" and "not a number" are different mistakes and deserve
      // different sentences — "faqat son kiriting" is nonsense advice to
      // someone who typed nothing but digits.
      found.amount = parsed.error === "tooLarge" ? "amountTooLarge" : "amount"
    }
  }
  if (data.city.trim() && !isValidAddress(data.city)) {
    found.city = "address"
  }
  if (!isDateOrderValid(data.givenDate, data.returnDate)) {
    found.returnDate = "dateOrder"
  }
  data.witnesses.forEach((name, index) => {
    if (name.trim() && !isValidName(name)) {
      found[`witness.${index}`] = "name"
    }
  })

  return found
}

/**
 * Both scripts as flat strings — for the tests, which assert on the finished
 * paper rather than on its parts.
 */
export function buildTilxat(data: TilxatData): {
  lotin: string
  kirill: string
} {
  const lotin = composeTilxat(data)
  return {
    lotin: plainText(lotin),
    // "TILXAT" is an ordinary template segment, so the title converts with
    // the rest of the document — no second copy of it in a config object.
    kirill: plainText(toCyrillicBlocks(lotin))
  }
}
