import type { ACCENTS, TEMPLATES } from "../constants"

/**
 * The resume, as DATA — the templates are two renderings of this one shape.
 *
 * Deliberately flat where it can be and array-of-record where it must:
 * experience and education repeat, everything else is a field. No "custom
 * sections" engine — the two real local use cases (state-org classic,
 * hh.uz modern) share exactly this structure, and a section builder is the
 * over-engineering CLAUDE.md forbids until data asks for it.
 */

export type TemplateId = (typeof TEMPLATES)[number]["id"]
export type AccentId = (typeof ACCENTS)[number]["id"]

/**
 * Every repeating row carries a stable id.
 *
 * Not cosmetic: the rows are reorderable and removable, so an array INDEX is
 * not an identity — deleting the middle of three makes React reuse the wrong
 * DOM node, and `AnimatePresence` then plays the exit animation on a row that
 * is staying. The id is the fix for both, and it is why no `key={index}`
 * suppression appears anywhere in this module.
 */
export interface RowId {
  id: string
}

/** One job. `current` renders "hozirgacha" instead of an end date. */
export interface ExperienceEntry extends RowId {
  company: string
  role: string
  /** ISO yyyy-mm; the sheet prints "2024-yil maydan". */
  from: string
  to: string
  current: boolean
  /** Free prose; each newline becomes its own bullet on the sheet. */
  description: string
}

export interface EducationEntry extends RowId {
  institution: string
  field: string
  from: string
  to: string
}

/** "O'zbek — ona tili", "Rus — erkin", "Ingliz — B1". Level is free text:
 * the local convention mixes CEFR codes and words, and a rigid enum would
 * reject half of real usage. */
export interface LanguageEntry extends RowId {
  name: string
  level: string
}

export interface ResumeData {
  template: TemplateId
  /** Zamonaviy's one restrained colour. Klassik ignores it. */
  accent: AccentId
  /** dataURL, held in memory/localStorage only — never uploaded anywhere. */
  photo: string
  fullName: string
  /** The position being applied for — sits under the name. */
  role: string
  contact: {
    phone: string
    email: string
    city: string
    telegram: string
    linkedin: string
  }
  /**
   * The local-convention block. Research (resumeflex, G-P hiring guides) and
   * practice agree Uzbek employers expect birth date on a CV; both fields
   * stay OPTIONAL — an empty one simply does not render.
   */
  personal: {
    /** ISO yyyy-mm-dd. */
    birthDate: string
    maritalStatus: string
  }
  summary: string
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: string[]
  languages: LanguageEntry[]
}

/** Field errors, keyed `section.index.field` for repeating sections. */
export type ResumeErrors = Record<string, string | undefined>
