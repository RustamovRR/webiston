import { toCyrillic } from "@webiston/transliteration"

import { SHEET_LABELS, type SheetLabels } from "../constants/labels"
import type { ResumeData } from "../types"

/**
 * The Cyrillic view of a resume.
 *
 * Applied at RENDER, never to the stored draft: the form keeps what the
 * visitor typed, and the script is a lens over it. Switching back and forth
 * therefore cannot corrupt anything, which a transform-on-edit would.
 *
 * What is SHIELDED is the point, and it is the passport lesson from the
 * document family in a new costume: an email, a URL, a Telegram handle and a
 * phone number are identifiers, not Uzbek words. «нилуфар.каримова@еxампле.cом»
 * is not a harder-to-read address — it is an address that does not exist, on a
 * CV whose entire purpose is being contacted.
 */
function isIdentifier(value: string): boolean {
  return (
    value.includes("@") ||
    value.includes("/") ||
    /^[+\d\s()-]+$/.test(value) ||
    /\.(uz|com|ru|org|net|io|dev)\b/i.test(value)
  )
}

const convert = (value: string) =>
  !value.trim() || isIdentifier(value) ? value : toCyrillic(value)

/** Line-by-line, so a shielded line inside a paragraph stays shielded. */
const convertProse = (value: string) =>
  value.split("\n").map(convert).join("\n")

export function toCyrillicResume(data: ResumeData): ResumeData {
  return {
    ...data,
    fullName: convert(data.fullName),
    role: convert(data.role),
    summary: convertProse(data.summary),
    contact: {
      // City is a place name and converts; the rest are identifiers.
      ...data.contact,
      city: convert(data.contact.city)
    },
    personal: {
      ...data.personal,
      maritalStatus: convert(data.personal.maritalStatus)
    },
    experience: data.experience.map((entry) => ({
      ...entry,
      company: convert(entry.company),
      role: convert(entry.role),
      description: convertProse(entry.description)
    })),
    education: data.education.map((entry) => ({
      ...entry,
      institution: convert(entry.institution),
      field: convert(entry.field)
    })),
    skills: data.skills.map(convert),
    languages: data.languages.map((entry) => ({
      ...entry,
      name: convert(entry.name),
      level: convert(entry.level)
    }))
  }
}

/**
 * The sheet's headings, in the document's language and script.
 *
 * Only Uzbek has two scripts; asking for the Cyrillic form of "Work
 * experience" would produce «Ворк еxпериенcе», so the toggle is Uzbek-only
 * both here and in the form.
 */
export function sheetLabels(data: ResumeData): SheetLabels {
  const labels = SHEET_LABELS[data.language]
  if (data.language !== "uz" || data.script === "lotin") return labels

  return Object.fromEntries(
    Object.entries(labels).map(([key, value]) => [key, toCyrillic(value)])
  ) as SheetLabels
}

/** The data as the sheet should render it — one call, both concerns. */
export function viewOf(data: ResumeData): ResumeData {
  return data.language === "uz" && data.script === "kirill"
    ? toCyrillicResume(data)
    : data
}
