import type { ComponentType } from "react"

import type { DOCUMENT_SCRIPTS } from "../constants"

/**
 * The document, composed as SEGMENTS rather than one string.
 *
 * Three kinds, and each answers a question the flat string could not:
 *
 * - `value` — something the visitor supplied. The sheet sets these in bold ON
 *   SCREEN, which is how a person proof-reads a filled form: the eye jumps
 *   between the values and skips the boilerplate it has read before. The
 *   printout and the .docx drop the bold, because paper wants one weight.
 * - `blank` — a writing line. Missing AND invalid fields render as blanks: the
 *   paper never carries garbage, and a printed blank form stays a feature.
 * - `template` — the fixed prose, from each document's sourced element list.
 *
 * The Cyrillic document transliterates SEGMENT BY SEGMENT, which is what lets
 * a passport series opt out (`translit: false` — the series is printed in
 * Latin on the physical passport, and «АБ 1234567» would cite a document that
 * does not exist).
 */
export interface DocumentSegment {
  text: string
  kind: "template" | "value" | "blank"
  /** False = never transliterated (passport series, JSHSHIR). */
  translit?: boolean
}

/**
 * One paragraph of the document.
 *
 * Segments alone could not express an ARIZA: its "kimga / kimdan" header sits
 * in a right-aligned block at the top of the page, and alignment is a property
 * of a paragraph, not of a run of text. Blocks also give the .docx export real
 * paragraphs instead of a string split on newlines.
 *
 * A block may still contain "\n" — the witness list is one block of several
 * lines — and both the sheet and the exporter honour it.
 */
export interface DocumentBlock {
  segments: DocumentSegment[]
  align?: "left" | "center" | "right"
  /**
   * First-line indent — the ABZAS.
   *
   * How an Uzbek official document separates paragraphs: 1.25 cm on the first
   * line, not a blank line between them. Only running prose takes it; a date
   * line, a signature line or an addressee block does not.
   */
  indent?: boolean
  /**
   * The document's centred title — "TILXAT", "ARIZA".
   *
   * A BLOCK rather than a fixed slot above the body, because the two
   * documents disagree about where it goes: a tilxat opens with it, while an
   * ariza puts the addressee column first and the title under it. It is also
   * why the title needs no config entry — "ARIZA" transliterates to "АРИЗА"
   * like any other template segment.
   */
  heading?: boolean
  /**
   * Confine the block to the right half of the page.
   *
   * The ariza's "kimga / kimdan" header sits in a column there, which is also
   * what makes a long organisation name wrap instead of running the full page
   * width.
   */
  width?: "half"
}

export type DocumentScript = (typeof DOCUMENT_SCRIPTS)[number]

/**
 * Field errors, keyed the way each form addresses its inputs.
 *
 * Only FILLED fields can be wrong — an empty field is the blank form, which is
 * a feature. The value is a message key under the template's `errors.*`
 * namespace; nothing here ever holds a human sentence, because the composer
 * does not know the reader's language.
 */
export type DocumentErrors = Record<string, string | undefined>

/** What a template's own field component receives from the shell. */
export interface DocumentFieldsProps<TData> {
  data: TData
  errors: DocumentErrors
  /** Immutable update, so a template never reaches into the shell's state. */
  update: (patch: (current: TData) => TData) => void
}

/**
 * One document: everything that differs between a tilxat and an ariza.
 *
 * The shell owns the paper, the script toggle, copy, print, the .docx export,
 * the layout and the switcher. A template owns its DATA and its PROSE — which
 * is the honest line, because the two documents share no field but the date.
 * Deliberately NOT a generic field-schema engine: that would produce a worse
 * form for each of them and an abstraction nobody can read.
 */
export interface DocumentTemplate<TData> {
  /** Route slug and message-namespace stem, e.g. "tilxat". */
  slug: string
  href: string
  /** next-intl namespace, e.g. "TilxatPage". */
  namespace: string
  /** Downloaded file stem — Latin, no spaces: it travels through Telegram. */
  fileName: string
  /** A fresh form. `structuredClone`d into state, never handed to React raw. */
  empty: TData
  /** A worked example. `now` is passed in so nothing reads the clock at module scope. */
  buildSample: (now: Date) => TData
  compose: (data: TData) => DocumentBlock[]
  validate: (data: TData) => DocumentErrors
  faqKeys: readonly string[]
  Fields: ComponentType<DocumentFieldsProps<TData>>
}
