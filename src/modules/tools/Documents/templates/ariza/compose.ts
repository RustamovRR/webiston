import { BLANK, BLANK_SHORT } from "../../constants"
import type { DocumentBlock, DocumentErrors } from "../../types"
import {
  addCalendarDays,
  addCalendarMonths,
  initialsOf,
  isDateOrderValid
} from "../../utils/dates"
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
import { isValidAddress, isValidName } from "../../utils/validate"
import { type ArizaData, NOTICE_CATEGORIES } from "./constants"

/**
 * The earliest day the employee may lawfully be released — MK 160.
 *
 * This is the tool's whole contribution over a downloaded .doc: a template
 * cannot count fourteen calendar days from the day you fill it in, and a wrong
 * date is the commonest reason an ariza comes back for rewriting.
 */
export function earliestRelease(
  applicationDate: string,
  category: ArizaData["category"]
): string {
  const rule =
    NOTICE_CATEGORIES.find((entry) => entry.id === category) ??
    NOTICE_CATEGORIES[0]

  return rule.unit === "month"
    ? addCalendarMonths(applicationDate, rule.amount)
    : addCalendarDays(applicationDate, rule.amount)
}

/**
 * The release date that goes on the paper.
 *
 * An empty field is not an empty line here: it means "the earliest lawful
 * day", so the document is correct before the visitor has thought about it.
 * A date they DID type wins, even an early one — MK 160 §8 makes early release
 * lawful in named circumstances, and the form says so rather than refusing.
 */
export function effectiveRelease(data: ArizaData): string {
  return (
    data.releaseDate || earliestRelease(data.applicationDate, data.category)
  )
}

/**
 * The ariza, in the shape every Uzbek office expects: the addressee block in
 * the top right, the heading, one sentence of request, the legal ground, then
 * the date and the signature.
 */
export function composeAriza(data: ArizaData): DocumentBlock[] {
  const signature = isValidName(data.employeeName)
    ? initialsOf(data.employeeName)
    : ""

  const blocks: DocumentBlock[] = [
    /**
     * "Kimga" and "kimdan" — the addressee column, right-aligned in the top
     * right of the page. This is why blocks exist at all: alignment belongs to
     * a paragraph, and a flat segment list could not express it.
     *
     * `width: "half"` rather than full-width right alignment, because a long
     * organisation name has to WRAP inside its column the way it does on
     * paper; right-aligned across the whole page it would run under the
     * heading. The wrapping is the answer to "what if the job title is
     * longer" — nothing is positioned by hand, so any length works.
     */
    block(
      [
        field(data.organisation, isValidAddress, BLANK_SHORT),
        tpl(" "),
        field(data.managerRole, isValidName, BLANK_SHORT),
        tpl("\n"),
        field(data.managerName, isValidName, BLANK_SHORT),
        tpl("ga\n"),
        // The sender is ONE line — "dasturchi Karimov Salim Anvarovichdan" —
        // and it lives in the SAME block as the addressee. Two blocks put a
        // paragraph gap between them and the line read as detached from the
        // header it belongs to. Short writing lines here because the column
        // is 58% of the page and full-length blanks wrapped.
        field(data.position, isValidName, BLANK_SHORT),
        tpl(" "),
        field(data.employeeName, isValidName, BLANK_SHORT),
        tpl("dan")
      ],
      { align: "right", width: "half" }
    ),
    // The title comes AFTER the addressee column — that is the shape of an
    // ariza, and getting it the other way round is the first thing an office
    // notices. A tilxat is the opposite, which is why neither the sheet nor
    // the shell decides this.
    block([tpl("ARIZA")], { heading: true }),
    block(
      [
        tpl("Meni o'z xohishimga ko'ra egallab turgan "),
        field(data.position, isValidName),
        tpl(" lavozimidan "),
        dateField(effectiveRelease(data)),
        tpl(" kunidan ozod qilishingizni so'rayman.")
      ],
      { indent: true }
    )
  ]

  // Only a reason with words in it earns a line. An unvalidated `val()` here
  // put "12341234" on a paper someone signs — the exact defect validation was
  // added to this family for, missed on the one field that is optional. Not a
  // writing line either: "Sabab: ______." is a sentence that says nothing, and
  // the clause is omitted from a blank form on purpose.
  if (data.reason.trim() && isValidAddress(data.reason)) {
    blocks.push(
      block([tpl("Sabab: "), val(data.reason.trim()), tpl(".")], {
        indent: true
      })
    )
  }

  blocks.push(
    block(
      [tpl("Asos: O'zbekiston Respublikasi Mehnat kodeksining 160-moddasi.")],
      { indent: true }
    ),
    block([dateField(data.applicationDate)]),
    block(
      [
        tpl("______________________ "),
        signature ? val(signature) : blank(BLANK)
      ],
      { align: "right" }
    )
  )

  return blocks
}

/** Only FILLED fields can be wrong; an empty one is the blank form. */
export function validateAriza(data: ArizaData): DocumentErrors {
  const found: DocumentErrors = {}

  if (data.organisation.trim() && !isValidAddress(data.organisation)) {
    found.organisation = "organisation"
  }
  if (data.managerRole.trim() && !isValidName(data.managerRole)) {
    found.managerRole = "name"
  }
  if (data.managerName.trim() && !isValidName(data.managerName)) {
    found.managerName = "name"
  }
  if (data.employeeName.trim() && !isValidName(data.employeeName)) {
    found.employeeName = "name"
  }
  if (data.position.trim() && !isValidName(data.position)) {
    found.position = "name"
  }
  // Free prose, so the check is only the digits-ONLY guard — a reason can
  // legitimately contain numbers ("2-kursga o'qishga kirganim sababli").
  if (data.reason.trim() && !isValidAddress(data.reason)) {
    found.reason = "text"
  }

  if (data.releaseDate && data.applicationDate) {
    if (!isDateOrderValid(data.applicationDate, data.releaseDate)) {
      found.releaseDate = "dateOrder"
    } else if (
      !isDateOrderValid(
        earliestRelease(data.applicationDate, data.category),
        data.releaseDate
      )
    ) {
      // Not "invalid" — MK 160 §8 makes an earlier date lawful when something
      // prevents the employee from working on. The message says which.
      found.releaseDate = "earlyRelease"
    }
  }

  return found
}

/** Both scripts as flat strings — for the tests. */
export function buildAriza(data: ArizaData): {
  lotin: string
  kirill: string
} {
  const lotin = composeAriza(data)
  return {
    lotin: plainText(lotin),
    kirill: plainText(toCyrillicBlocks(lotin))
  }
}
