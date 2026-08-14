import { BLANK, BLANK_SHORT } from "../../constants"
import type { DocumentBlock, DocumentErrors } from "../../types"
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
import { isValidAddress, isValidName } from "../../utils/validate"
import { STANCES, type TushuntirishData } from "./constants"

/**
 * How much writing room an EMPTY explanation prints as.
 *
 * The blank form is printable on purpose across this whole family, but the
 * explanation is the one field a person fills in by hand with a paragraph, so
 * a single 22-character rule would be useless to them. Three rules per row so
 * the line spans the sheet, joined by SPACES — a space is where a line may
 * wrap, so the rules reflow on a narrow sheet instead of running off it.
 */
const WRITING_ROWS = 3
const RULES_PER_ROW = 3

/**
 * The explanation, as paragraphs.
 *
 * One BLOCK per line — never one block containing "\n" — and that is a
 * screen/Word parity rule, not a style preference. The sheet applies `indent`
 * as CSS `text-indent`, which reaches the first visual line only, while the
 * .docx exporter splits a block on "\n" and gives EVERY line its own indented
 * Word paragraph. A multi-line indented block would therefore print one way on
 * screen and another way in Word — three documents instead of one, which is
 * the drift `PAPER_DOCX` exists to prevent.
 *
 * It is also what the filled case wants anyway: a person typing Enter in the
 * textarea means a new paragraph, and each deserves its own abzas.
 */
function explanationBlocks(explanation: string): DocumentBlock[] {
  const paragraphs = explanation
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) {
    const row = Array.from({ length: RULES_PER_ROW }, () => BLANK).join(" ")
    return Array.from({ length: WRITING_ROWS }, () =>
      block([blank(row)], { indent: true })
    )
  }

  return paragraphs.map((text) => block([val(text)], { indent: true }))
}

/**
 * The tushuntirish xati: addressee column, title, what happened, why, and the
 * closing position — then the date and the signature.
 *
 * Same skeleton as the ariza, which is not a coincidence: both are documents
 * an employee hands to an employer, and an office reads the header before it
 * reads anything else.
 */
export function composeTushuntirish(data: TushuntirishData): DocumentBlock[] {
  const signature = isValidName(data.employeeName)
    ? initialsOf(data.employeeName)
    : ""

  const stance = STANCES.find((entry) => entry.id === data.stance) ?? STANCES[0]

  return [
    // "Kimga" and "kimdan", right-aligned in a column — one block, so the
    // sender's line never detaches from the header it belongs to. Short
    // writing lines because the column is 58% of the page.
    block(
      [
        field(data.organisation, isValidAddress, BLANK_SHORT),
        tpl(" "),
        field(data.managerRole, isValidName, BLANK_SHORT),
        tpl("\n"),
        field(data.managerName, isValidName, BLANK_SHORT),
        tpl("ga\n"),
        field(data.position, isValidName, BLANK_SHORT),
        tpl(" "),
        field(data.employeeName, isValidName, BLANK_SHORT),
        tpl("dan")
      ],
      { align: "right", width: "half" }
    ),
    block([tpl("TUSHUNTIRISH XATI")], { heading: true }),
    block(
      [
        tpl("Men, "),
        field(data.employeeName, isValidName),
        tpl(", "),
        dateField(data.incidentDate),
        tpl(" kuni "),
        // The subject is prose, and prose about a workplace contains digits —
        // "40 daqiqa kechikib kelganim". `isValidName` would reject it, so the
        // check here is only the digits-ONLY guard: some letters must exist.
        field(data.subject, isValidAddress),
        tpl(" yuzasidan quyidagilarni ma'lum qilaman.")
      ],
      { indent: true }
    ),
    ...explanationBlocks(data.explanation),
    // The closing position — the one sentence on this page with legal weight,
    // which is why it is a choice and not boilerplate.
    block([tpl(stance.phrase)], { indent: true }),
    block([dateField(data.documentDate)]),
    block(
      [
        tpl("______________________ "),
        signature ? val(signature) : blank(BLANK)
      ],
      { align: "right" }
    )
  ]
}

/** Only FILLED fields can be wrong; an empty one is the blank form. */
export function validateTushuntirish(data: TushuntirishData): DocumentErrors {
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
  if (data.subject.trim() && !isValidAddress(data.subject)) {
    found.subject = "text"
  }
  if (data.explanation.trim() && !isValidAddress(data.explanation)) {
    found.explanation = "text"
  }
  // The note is written AFTER the thing it explains. The other way round is
  // not a style slip — it is a document that describes the future.
  if (!isDateOrderValid(data.incidentDate, data.documentDate)) {
    found.documentDate = "dateOrder"
  }

  return found
}

/** Both scripts as flat strings — for the tests. */
export function buildTushuntirish(data: TushuntirishData): {
  lotin: string
  kirill: string
} {
  const lotin = composeTushuntirish(data)
  return {
    lotin: plainText(lotin),
    kirill: plainText(toCyrillicBlocks(lotin))
  }
}
