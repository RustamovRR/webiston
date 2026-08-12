import { toCyrillic } from "@webiston/transliteration"

import { formatAmount, parseAmount } from "@/lib/uzbek-number-words/amount"
import { amountToWords, integerToWords } from "@/lib/uzbek-number-words/words"

import { BLANK, BLANK_SHORT, PAYMENT_METHODS, UZBEK_MONTHS } from "../constants"
import type { TilxatData, TilxatParty } from "../types"
import {
  isValidAddress,
  isValidName,
  isValidPassport,
  isValidPinfl,
  normalisePassport
} from "./validate"

/**
 * The document, composed as SEGMENTS rather than one string.
 *
 * Three kinds, and each answers a question the flat string could not:
 *
 * - `value` — something the visitor supplied. The preview sets these in bold,
 *   which is how a person proof-reads a filled form: the eye jumps between
 *   the values and skips the boilerplate it has read before.
 * - `blank` — a writing line. Missing AND invalid fields render as blanks:
 *   the paper never carries garbage ("aa12341234123412341234" went straight
 *   onto the sheet before this), and a printed blank form stays a feature.
 * - `template` — the fixed prose, from the sourced element list (FK 733 and
 *   the bank checklist cited in `../constants`).
 *
 * The Cyrillic document transliterates SEGMENT BY SEGMENT, which is what lets
 * a passport series opt out (`translit: false` — the series is printed in
 * Latin on the physical passport, and «АБ 1234567» would cite a document that
 * does not exist). Per-segment conversion is safe here because every boundary
 * falls at a value's edge — always a whole word or phrase, never inside a
 * digraph — and the one suffix glued to a value ("…gacha") starts with `g`,
 * which no preceding letter can combine with.
 */
export interface TilxatSegment {
  text: string
  kind: "template" | "value" | "blank"
  /** False = never transliterated (passport series, JSHSHIR). */
  translit?: boolean
}

export interface TilxatComposition {
  lotin: TilxatSegment[]
  kirill: TilxatSegment[]
}

/** "2026-08-12" → "2026-yil 12-avgust"; anything else → null. */
export function formatUzbekDate(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null

  const month = UZBEK_MONTHS[Number(match[2]) - 1]
  if (!month) return null

  // `Number` strips the leading zero: documents write "2-avgust", not "02-".
  return `${match[1]}-yil ${Number(match[3])}-${month}`
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

const tpl = (text: string): TilxatSegment => ({ text, kind: "template" })
const blank = (text: string = BLANK): TilxatSegment => ({
  text,
  kind: "blank"
})
const val = (text: string, translit = true): TilxatSegment => ({
  text,
  kind: "value",
  translit
})

/** A validated value, or the writing line that stands in for it. */
function field(
  value: string,
  valid: (input: string) => boolean,
  line: string = BLANK
): TilxatSegment {
  const trimmed = value.trim()
  return trimmed && valid(trimmed) ? val(trimmed) : blank(line)
}

function dateField(iso: string): TilxatSegment {
  const formatted = formatUzbekDate(iso)
  return formatted ? val(formatted) : blank(BLANK_SHORT)
}

/**
 * The sum, the way a document carries it: digits, then words in brackets.
 *
 * Round sums read "5 000 000 (besh million) so'm" — currency OUTSIDE the
 * brackets, the convention contracts and the law's own text use. A sum with
 * tiyin moves the whole spelled form inside, because the tiyin needs naming
 * too: "5 000 000,50 (besh million so'm ellik tiyin)".
 */
function sumSegments(amount: string): TilxatSegment[] {
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
function passportSegments(party: TilxatParty): TilxatSegment[] {
  const passport = party.passport.trim()
  const segments: TilxatSegment[] = [
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

/** The Latin document, as segments — the single source both scripts derive from. */
function composeLatin(data: TilxatData): TilxatSegment[] {
  const method =
    PAYMENT_METHODS.find((item) => item.id === data.method)?.phrase ??
    PAYMENT_METHODS[0].phrase

  const segments: TilxatSegment[] = [
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
    tpl(" miqdorida pul mablag'ini qarzga oldim.\n\nMazkur summani "),
    dateField(data.returnDate),
    tpl(
      "gacha to'liq qaytarib berish majburiyatini o'z zimmamga olaman." +
        (data.interestFree ? " Qarz foizsiz berildi." : "")
    ),
    tpl("\n\n"),
    field(data.city, isValidAddress),
    tpl(", "),
    dateField(data.givenDate),
    tpl("\n\nQarz oluvchi: ______________________ ")
  ]

  const signature = isValidName(data.borrower.fullName)
    ? initialsOf(data.borrower.fullName)
    : ""
  segments.push(signature ? val(signature) : blank())

  const witnesses = data.witnesses.filter(
    (name) => name.trim() && isValidName(name)
  )
  if (witnesses.length > 0) {
    segments.push(tpl("\n\nGuvohlar:"))
    witnesses.forEach((name, index) => {
      segments.push(
        tpl(`\n${index + 1}. ______________________ `),
        val(initialsOf(name))
      )
    })
  }

  return segments
}

export function composeTilxat(data: TilxatData): TilxatComposition {
  const lotin = composeLatin(data)
  return {
    lotin,
    kirill: lotin.map((segment) =>
      segment.translit === false
        ? segment
        : { ...segment, text: toCyrillic(segment.text) }
    )
  }
}

/** The copyable text: the centred heading plus every segment's text. */
export function plainText(segments: TilxatSegment[], heading: string): string {
  return `${heading}\n\n${segments.map((segment) => segment.text).join("")}`
}

/**
 * Both scripts as flat strings — for the copy button, and for the tests,
 * which assert on the finished paper rather than its parts.
 */
export function buildTilxat(data: TilxatData): {
  lotin: string
  kirill: string
} {
  const composed = composeTilxat(data)
  return {
    lotin: plainText(composed.lotin, "TILXAT"),
    kirill: plainText(composed.kirill, "ТИЛХАТ")
  }
}
