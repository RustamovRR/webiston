import { BLANK, BLANK_SHORT } from "../../constants"
import type { DocumentBlock, DocumentErrors } from "../../types"
import {
  addCalendarDays,
  formatUzbekDate,
  initialsOf,
  isDateOrderValid,
  isoDate
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
import {
  FIXED_HOLIDAYS,
  type HolidayId,
  MAX_LEAVE_DAYS,
  MIN_LEAVE_PART_DAYS,
  MOVABLE_HOLIDAYS,
  type TatilData,
  UNPAID_LEAVE_MAX_MONTHS
} from "./constants"

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** "21" → 21; anything that is not a whole number of days in range → null. */
export function parseDays(input: string): number | null {
  const trimmed = input.trim()
  if (!/^\d{1,3}$/.test(trimmed)) return null
  const days = Number(trimmed)
  return days >= 1 && days <= MAX_LEAVE_DAYS ? days : null
}

export interface Holiday {
  id: HolidayId
  date: string
}

/** Every MK 208 holiday from `start` to `end`, inclusive, in date order. */
export function holidaysBetween(start: string, end: string): Holiday[] {
  const found: Holiday[] = []
  const first = Number(start.slice(0, 4))
  const last = Number(end.slice(0, 4))

  for (let year = first; year <= last; year++) {
    for (const holiday of FIXED_HOLIDAYS) {
      const date = `${year}-${String(holiday.month).padStart(2, "0")}-${String(
        holiday.day
      ).padStart(2, "0")}`
      found.push({ id: holiday.id, date })
    }
    for (const holiday of MOVABLE_HOLIDAYS[year] ?? []) found.push(holiday)
  }

  // ISO days compare correctly as strings.
  return found
    .filter((holiday) => holiday.date >= start && holiday.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface LeavePeriod {
  /** ISO. The last day of the leave, holidays already added. */
  end: string
  /** The holidays inside the leave — each one lengthened it by a day. */
  holidays: Holiday[]
  /**
   * The first year the leave reaches whose hayit dates are not BOTH announced
   * yet — a holiday may be missing there, so `end` is only a lower bound.
   * `null` when every year in the span is known.
   */
  unknownYear: number | null
}

/**
 * Whether a year's movable holidays are fully known.
 *
 * BOTH hayits, not "the year is in the table": they are fixed by two separate
 * acts about two months apart, and Qurbon hayit's arrives about a week ahead.
 * A year holding only Ro'za hayit would otherwise pass as complete and print
 * an end date a day early for every leave across Qurbon hayit.
 */
function hayitAnnounced(year: number): boolean {
  const ids = (MOVABLE_HOLIDAYS[year] ?? []).map((holiday) => holiday.id)
  return ids.includes("rozaHayit") && ids.includes("qurbonHayit")
}

/**
 * When the leave ends — the one thing on this page a .doc cannot do.
 *
 * Annual leave is counted in calendar days, and a holiday inside it is not
 * counted (MK 221): so the end moves one day per holiday. Moving it can pull
 * ANOTHER holiday inside — 21 days from 24 September crosses 1 October, and
 * the extra day might itself land on the next one — so this settles by
 * repetition rather than by one pass. It always terminates: the count only
 * grows, and it cannot grow past the number of holidays in the span.
 *
 * Unpaid leave is not an annual leave, 221 does not reach it, and its end is
 * plain calendar arithmetic.
 */
export function leavePeriod(data: TatilData): LeavePeriod | null {
  const days = parseDays(data.days)
  if (!ISO_DAY.test(data.startDate) || days === null) return null

  const plainEnd = addCalendarDays(data.startDate, days - 1)
  if (data.kind === "haqsiz") {
    return { end: plainEnd, holidays: [], unknownYear: null }
  }

  let end = plainEnd
  let holidays = holidaysBetween(data.startDate, end)
  for (;;) {
    const next = addCalendarDays(data.startDate, days - 1 + holidays.length)
    if (next === end) break
    end = next
    holidays = holidaysBetween(data.startDate, end)
  }

  const first = Number(data.startDate.slice(0, 4))
  const last = Number(end.slice(0, 4))
  let unknownYear: number | null = null
  for (let year = first; year <= last && unknownYear === null; year++) {
    if (!hayitAnnounced(year)) unknownYear = year
  }

  return { end, holidays, unknownYear }
}

/**
 * The end date as the sentence writes it: without the year when the leave
 * starts in the same one — "2026-yil 5-oktabrdan 26-oktabrgacha", not the
 * year twice. A leave across New Year keeps it, where it is information.
 */
function endDateField(start: string, end: string) {
  const full = formatUzbekDate(end)
  if (!full) return blank(BLANK_SHORT)
  return start.slice(0, 4) === end.slice(0, 4)
    ? val(full.replace(/^\d{4}-yil /, ""))
    : val(full)
}

/**
 * The request sentence — the part that differs between the two kinds.
 *
 * With a known end: "…dan …gacha 21 kalendar kun muddatga". Without one — the
 * start or the length is missing, or the leave reaches a year whose hayit
 * dates are not announced — "…dan boshlab 21 kalendar kun muddatga", which is
 * the form an HR office accepts just as readily and which never prints a date
 * this tool cannot vouch for.
 */
function requestBlock(data: TatilData): DocumentBlock {
  const period = leavePeriod(data)
  const days = parseDays(data.days)
  const length = days === null ? blank(BLANK_SHORT) : val(String(days))

  const span =
    period && period.unknownYear === null
      ? [
          dateField(data.startDate),
          tpl("dan "),
          endDateField(data.startDate, period.end),
          tpl("gacha ")
        ]
      : [dateField(data.startDate), tpl("dan boshlab ")]

  // The period before the object — "…gacha 21 kalendar kun muddatga
  // navbatdagi yillik mehnat ta'tilini" — which is the Uzbek word order: the
  // time adverbial precedes what is being asked for.
  const what =
    data.kind === "yillik"
      ? "navbatdagi yillik mehnat ta'tilini"
      : "ish haqi saqlanmaydigan ta'til"

  return block(
    [
      tpl("Menga "),
      ...span,
      length,
      tpl(` kalendar kun muddatga ${what} berishingizni so'rayman.`)
    ],
    { indent: true }
  )
}

/**
 * The ta'til arizasi, in the shape of every ariza in this family: the
 * addressee column in the top right, the heading, the request, the date and
 * the signature.
 */
export function composeTatil(data: TatilData): DocumentBlock[] {
  const signature = isValidName(data.employeeName)
    ? initialsOf(data.employeeName)
    : ""

  const blocks: DocumentBlock[] = [
    // The same column as the resignation ariza — see `composeAriza` for why
    // it is one block and a half-width one.
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
    block([tpl("ARIZA")], { heading: true }),
    requestBlock(data)
  ]

  // Unpaid leave is granted by agreement (MK 241), so a reason is what the
  // request rests on; annual leave is a right and needs none. Only a reason
  // with words in it earns a line — the same guard as the resignation ariza.
  if (
    data.kind === "haqsiz" &&
    data.reason.trim() &&
    isValidAddress(data.reason)
  ) {
    blocks.push(
      block([tpl("Sabab: "), val(data.reason.trim()), tpl(".")], {
        indent: true
      })
    )
  }

  blocks.push(
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

/**
 * `iso` plus N months, CLAMPED to the target month's last day — for a ceiling.
 *
 * Deliberately not `addCalendarMonths`, which rolls an overflowing day FORWARD
 * (30 November + 3 months → 2 March). That is the conservative direction for
 * the ariza's notice period, a floor; for MK 241's three-month ceiling it is
 * the permissive one, and it made a longer leave starting a day earlier pass
 * where a shorter one ending on the same day was flagged.
 */
function addMonthsClamped(iso: string, months: number): string {
  const year = Number(iso.slice(0, 4))
  const month = Number(iso.slice(5, 7)) - 1 + months
  const day = Number(iso.slice(8, 10))
  // Day 0 of the following month is the last day of this one.
  const lastDay = new Date(year, month + 1, 0).getDate()
  return isoDate(new Date(year, month, Math.min(day, lastDay)))
}

/** Only FILLED fields can be wrong; an empty one is the blank form. */
export function validateTatil(data: TatilData): DocumentErrors {
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
  if (
    data.kind === "haqsiz" &&
    data.reason.trim() &&
    !isValidAddress(data.reason)
  ) {
    found.reason = "text"
  }

  const days = parseDays(data.days)
  if (data.days.trim() && days === null) {
    found.days = "days"
  } else if (
    days !== null &&
    data.kind === "yillik" &&
    days < MIN_LEAVE_PART_DAYS
  ) {
    // Not "invalid" — a split leave's second part may be short, as long as
    // one part is fourteen days (MK 231). The message says exactly that.
    found.days = "shortPart"
  } else if (
    days !== null &&
    data.kind === "haqsiz" &&
    ISO_DAY.test(data.startDate) &&
    // MK 241's ceiling is three months in TOTAL across twelve; one request
    // longer than that can never be lawful, whatever came before it.
    addCalendarDays(data.startDate, days - 1) >=
      addMonthsClamped(data.startDate, UNPAID_LEAVE_MAX_MONTHS)
  ) {
    found.days = "unpaidLimit"
  }

  if (!isDateOrderValid(data.applicationDate, data.startDate)) {
    found.startDate = "dateOrder"
  }

  return found
}

/** Both scripts as flat strings — for the tests. */
export function buildTatil(data: TatilData): {
  lotin: string
  kirill: string
} {
  const lotin = composeTatil(data)
  return {
    lotin: plainText(lotin),
    kirill: plainText(toCyrillicBlocks(lotin))
  }
}
