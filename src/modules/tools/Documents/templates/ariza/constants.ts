import { isoDate } from "../../utils/dates"

/**
 * The resignation ariza, and the law it is built on.
 *
 * Everything here traces to the NEW Mehnat kodeksi — in force 30 April 2023,
 * 34 chapters, 581 articles — and specifically **160-modda**, termination at
 * the employee's own initiative. The article is cited on the page, in the FAQ,
 * with its sources (lex.uz; kadrovik.uz; norma.uz; yuristpro.uz), because a
 * page that tells someone how to leave a job should let them check the claim
 * rather than trust a web page about the law.
 *
 * The notice period is what this tool CONTRIBUTES: a static .doc template
 * cannot count fourteen calendar days from the day you fill it in, and getting
 * that date wrong is the single most common way an ariza goes back for
 * rewriting.
 */

export interface ArizaData {
  /** «Webiston» MChJ — written as the visitor would write it on the form. */
  organisation: string
  /** "direktori", "rahbari", "bosh shifokori" — grammatically already a genitive. */
  managerRole: string
  managerName: string
  employeeName: string
  position: string
  category: NoticeCategory
  /** ISO. The day the ariza is handed in. */
  applicationDate: string
  /** ISO, optional: blank means "the earliest lawful day", computed. */
  releaseDate: string
  /** Free text for a MK 160 §8 circumstance. Empty renders no clause. */
  reason: string
}

/**
 * How much notice each kind of employee owes, from MK 160.
 *
 * Months rather than "60 days" for the two long ones: the article says months,
 * and February would make a day count wrong by two days.
 */
export const NOTICE_CATEGORIES = [
  { id: "umumiy", unit: "day", amount: 14 },
  { id: "rahbar", unit: "month", amount: 2 },
  { id: "orinbosar", unit: "month", amount: 1 },
  { id: "mavsumiy", unit: "day", amount: 3 },
  { id: "mikrofirma", unit: "day", amount: 7 }
] as const

export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number]["id"]

export const ARIZA_FAQ_KEYS = [
  "law",
  "notice",
  "withdraw",
  "early",
  "handwritten",
  "privacy"
] as const

/** A fresh form. "direktori" is pre-filled: it fits most workplaces. */
export const EMPTY_ARIZA: ArizaData = {
  organisation: "",
  managerRole: "direktori",
  managerName: "",
  employeeName: "",
  position: "",
  category: "umumiy",
  applicationDate: "",
  releaseDate: "",
  reason: ""
}

/**
 * A worked example — the whole reason people search "ariza namunasi".
 *
 * `releaseDate` is deliberately left EMPTY so the sample demonstrates the one
 * thing the tool does that a downloaded .doc cannot: the earliest lawful last
 * day appears by itself, counted from today.
 */
export const buildSampleAriza = (now: Date): ArizaData => ({
  organisation: "«Webiston» MChJ",
  managerRole: "direktori",
  managerName: "Aliyev Anvar Alisherovich",
  employeeName: "Karimov Salim Anvarovich",
  position: "dasturchi",
  category: "umumiy",
  applicationDate: isoDate(now),
  releaseDate: "",
  reason: ""
})
