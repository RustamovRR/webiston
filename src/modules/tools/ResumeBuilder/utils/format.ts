import { UZBEK_MONTHS } from "@/constants/uzbek"

import type { ResumeData } from "../types"

/**
 * "2024-03" → "2024-yil mart". Anything unreadable returns "" so a
 * half-typed month renders as nothing rather than "NaN-yil".
 *
 * Month precision, not day: a CV states when a job started, never on which
 * date — and a day would make every range twice as long to read.
 */
export function monthLabel(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return ""
  const month = UZBEK_MONTHS[Number(match[2]) - 1]
  return month ? `${match[1]}-yil ${month}` : ""
}

/**
 * A period, the way a CV writes one: "2021-yil iyun — 2024-yil fevral", or
 * "… — hozirgacha" while the job is current. `present` is passed in rather
 * than hardcoded because the sheet speaks the document's language, not the
 * interface's.
 */
export function periodLabel(
  from: string,
  to: string,
  current: boolean,
  present: string
): string {
  const start = monthLabel(from)
  const end = current ? present : monthLabel(to)
  if (start && end) return `${start} — ${end}`
  return start || end
}

/** Free prose → bullet lines. Blank lines are dropped, not printed. */
export function bulletLines(description: string): string[] {
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Whether the sheet has anything on it yet.
 *
 * Drives the empty state: an A4 page of placeholder text teaches nothing, so
 * an untouched form shows a short hint instead — and the moment the visitor
 * types a name, the paper takes over.
 */
export function isBlank(data: ResumeData): boolean {
  return (
    !data.fullName.trim() &&
    !data.role.trim() &&
    !data.summary.trim() &&
    data.experience.length === 0 &&
    data.education.length === 0 &&
    data.skills.length === 0 &&
    data.languages.length === 0 &&
    !Object.values(data.contact).some((value) => value.trim())
  )
}
