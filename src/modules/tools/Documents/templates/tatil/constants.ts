import { addCalendarDays, isoDate } from "../../utils/dates"

/**
 * Ta'til arizasi — the leave request, and the law it is built on.
 *
 * Everything here traces to the NEW Mehnat kodeksi (in force 30 April 2023),
 * read from the code itself on lex.uz rather than from a summary of it:
 *
 * - **217-modda** — the annual basic leave is at least 21 calendar days.
 * - **221-modda** — leave is counted in CALENDAR days, and a non-working
 *   public holiday that falls inside it is NOT counted. That second sentence
 *   is what this tool contributes: a .doc template cannot know that a leave
 *   starting 24 September runs a day longer because 1 October is inside it.
 * - **208-modda** — the list of those holidays: seven fixed dates and the
 *   first day of each hayit.
 * - **231-modda** — leave may be split by agreement; one part must be at
 *   least 14 calendar days.
 * - **241-modda** — unpaid leave by written application, by agreement, no
 *   more than three months in total within twelve (as amended by ЎРҚ-1030,
 *   13 February 2025).
 *
 * Deliberately NOT modelled: "qo'shimcha dam olish kunlari", the extra days
 * off a presidential decree moves around each year. They are not holidays
 * under 208 and they DO count toward the leave — kadrovik.uz and xabar.uz
 * both spell that out — so leaving them out is the correct arithmetic, not a
 * gap in it.
 */

export const LEAVE_KINDS = ["yillik", "haqsiz"] as const

export type LeaveKind = (typeof LEAVE_KINDS)[number]

/** MK 217 — the floor, and what the form starts with. */
export const ANNUAL_LEAVE_DAYS = 21

/** MK 231 — the shortest a part may be when the leave is split. */
export const MIN_LEAVE_PART_DAYS = 14

/** MK 241 — unpaid leave, in total, within any twelve months. */
export const UNPAID_LEAVE_MAX_MONTHS = 3

/**
 * The longest request the form reads as a number at all.
 *
 * A sanity bound, not a legal one: a year covers every real leave, and
 * "21000" is a typo that should say so rather than print a date in 2084.
 */
export const MAX_LEAVE_DAYS = 365

/**
 * MK 208: the holidays whose date never moves. Ids double as message keys —
 * the form names the holiday that lengthened the leave, in the reader's
 * language.
 */
export const FIXED_HOLIDAYS = [
  { id: "yangiYil", month: 1, day: 1 },
  { id: "xotinQizlar", month: 3, day: 8 },
  { id: "navruz", month: 3, day: 21 },
  { id: "xotira", month: 5, day: 9 },
  { id: "mustaqillik", month: 9, day: 1 },
  { id: "oqituvchi", month: 10, day: 1 },
  { id: "konstitutsiya", month: 12, day: 8 }
] as const

/**
 * MK 208: the first day of Ro'za hayit and of Qurbon hayit — lunar, so the
 * date is fixed by a presidential act each year, and only ONCE it is announced.
 *
 * 2026: Ro'za hayit 20 March (the President's decision of 18.03.2026) and
 * Qurbon hayit 27 May (ПҚ-194, 20.05.2026). Each hayit is added here when ITS
 * act is published — two acts, about two months apart — and never estimated
 * from an astronomical calendar, because the date an employer applies is the
 * announced one. A year counts as known only once it holds both; a leave that
 * reaches any other year is told so on the form, and the document asks for a
 * length rather than printing an end date it cannot vouch for.
 */
export const MOVABLE_HOLIDAYS: Record<
  number,
  readonly { id: "rozaHayit" | "qurbonHayit"; date: string }[]
> = {
  2026: [
    { id: "rozaHayit", date: "2026-03-20" },
    { id: "qurbonHayit", date: "2026-05-27" }
  ]
}

export type HolidayId =
  | (typeof FIXED_HOLIDAYS)[number]["id"]
  | "rozaHayit"
  | "qurbonHayit"

export interface TatilData {
  /** «Webiston» MChJ — written as the visitor would write it on the form. */
  organisation: string
  /** "direktori", "rahbari", "bosh shifokori" — grammatically already a genitive. */
  managerRole: string
  managerName: string
  employeeName: string
  position: string
  kind: LeaveKind
  /** ISO. The first day of the leave. */
  startDate: string
  /** As typed — a string, so a half-typed number is not coerced to 0. */
  days: string
  /** Unpaid leave only. Empty renders no clause. */
  reason: string
  /** ISO. The day the ariza is handed in. */
  applicationDate: string
}

export const TATIL_FAQ_KEYS = [
  "law",
  "holidays",
  "split",
  "firstYear",
  "unpaid",
  "privacy"
] as const

/** A fresh form: annual leave, at the length MK 217 guarantees. */
export const EMPTY_TATIL: TatilData = {
  organisation: "",
  managerRole: "direktori",
  managerName: "",
  employeeName: "",
  position: "",
  kind: "yillik",
  startDate: "",
  days: String(ANNUAL_LEAVE_DAYS),
  reason: "",
  applicationDate: ""
}

/**
 * How far ahead the sample's leave starts.
 *
 * MK 228: the employee must be told when a SCHEDULED leave begins at least
 * fifteen days before it — so a request handed in today for a date fifteen
 * days out is the realistic example, not one for tomorrow.
 */
const SAMPLE_LEAD_DAYS = 15

/** A worked example — the whole reason people search "ta'til arizasi namunasi". */
export const buildSampleTatil = (now: Date): TatilData => ({
  organisation: "«Webiston» MChJ",
  managerRole: "direktori",
  managerName: "Aliyev Anvar Alisherovich",
  employeeName: "Karimov Salim Anvarovich",
  position: "dasturchi",
  kind: "yillik",
  startDate: addCalendarDays(isoDate(now), SAMPLE_LEAD_DAYS),
  days: String(ANNUAL_LEAVE_DAYS),
  reason: "",
  applicationDate: isoDate(now)
})
