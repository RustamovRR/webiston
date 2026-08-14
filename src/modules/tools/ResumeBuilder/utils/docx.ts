import { saveBlob } from "@/lib/utils"

import type { SheetLabels } from "../constants/labels"
import type { ResumeData } from "../types"
import { bulletLines, monthLabel, periodLabel } from "./format"

/**
 * The resume as a .docx — the format an hh.uz upload and half the employers
 * in the country actually ask for.
 *
 * Loaded through a DOUBLE dynamic import, the way the document family does it:
 * this module, and `docx` inside it. The library is ~500 kB and only the click
 * pays for it.
 *
 * Deliberately ONE layout for both templates: a single column with the
 * sidebar's content folded into it. A Word two-column table would fight every
 * reflow the recipient's Word does, and the .docx exists to be EDITED and
 * re-uploaded — Zamonaviy's colour is a screen and print concern, not a
 * portability one. The visitor who wants the sidebar prints or saves the PDF,
 * which is exactly what that path is for.
 */

/** Word measures in twips: 1440 to the inch. A4 with 15mm margins. */
const PAPER = {
  width: 11906,
  height: 16838,
  margin: 850,
  /**
   * Word's own pair, so the download looks like the preview it came from:
   * Cambria for „Klassik" (serif), Calibri for „Zamonaviy" (sans). Both ship
   * with Word on Windows and macOS, so the recipient sees the chosen face
   * rather than a substitution.
   */
  serifFont: "Cambria",
  sansFont: "Calibri",
  /** Half-points. */
  size: 21,
  nameSize: 40,
  headingSize: 22
} as const

export async function downloadResumeDocx(
  data: ResumeData,
  labels: SheetLabels,
  fileName: string
): Promise<void> {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    TextRun
  } = await import("docx")

  const font = data.template === "klassik" ? PAPER.serifFont : PAPER.sansFont

  // `size` is widened to `number` on purpose: `PAPER` is `as const`, so an
  // inferred default would pin every call site to the literal 21.
  const text = (
    value: string,
    options: { bold?: boolean; italics?: boolean; size?: number } = {}
  ) =>
    new TextRun({
      text: value,
      bold: options.bold ?? false,
      italics: options.italics ?? false,
      size: options.size ?? PAPER.size,
      font
    })

  const line = (value: string, options?: Parameters<typeof text>[1]) =>
    new Paragraph({ children: [text(value, options)], spacing: { after: 60 } })

  /** A section heading: small caps-ish, with the hairline rule under it. */
  const heading = (value: string) =>
    new Paragraph({
      children: [
        text(value.toUpperCase(), { bold: true, size: PAPER.headingSize })
      ],
      spacing: { before: 260, after: 100 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 4,
          color: "999999",
          space: 2
        }
      }
    })

  const bullet = (value: string) =>
    new Paragraph({
      children: [text(value)],
      bullet: { level: 0 },
      spacing: { after: 40 }
    })

  const children: InstanceType<typeof Paragraph>[] = []

  if (data.fullName.trim()) {
    children.push(
      new Paragraph({
        children: [text(data.fullName, { bold: true, size: PAPER.nameSize })],
        heading: HeadingLevel.TITLE,
        spacing: { after: 40 }
      })
    )
  }
  if (data.role.trim()) children.push(line(data.role, { italics: true }))

  const contacts = [
    data.contact.phone,
    data.contact.email,
    data.contact.city,
    data.contact.telegram,
    data.contact.linkedin
  ]
    .map((value) => value.trim())
    .filter(Boolean)
  if (contacts.length > 0) children.push(line(contacts.join("  ·  ")))

  const personal = [
    data.personal.birthDate &&
      `${labels.birthDate}: ${monthLabel(data.personal.birthDate.slice(0, 7))}`,
    data.personal.maritalStatus.trim()
  ].filter(Boolean)
  if (personal.length > 0) children.push(line(personal.join("  ·  ")))

  if (data.summary.trim()) {
    children.push(heading(labels.summary))
    children.push(
      new Paragraph({
        children: [text(data.summary)],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 60 }
      })
    )
  }

  if (data.experience.length > 0) {
    children.push(heading(labels.experience))
    for (const entry of data.experience) {
      const period = periodLabel(
        entry.from,
        entry.to,
        entry.current,
        labels.present
      )
      // Role and period on one line: Word has no flexbox, and a tab stop that
      // survives the recipient's page setup is not worth the fragility.
      children.push(
        new Paragraph({
          children: [
            text(entry.role || entry.company, { bold: true }),
            ...(period ? [text(`  —  ${period}`)] : [])
          ],
          spacing: { before: 120, after: 20 }
        })
      )
      if (entry.role.trim() && entry.company.trim()) {
        children.push(line(entry.company, { italics: true }))
      }
      for (const item of bulletLines(entry.description))
        children.push(bullet(item))
    }
  }

  if (data.education.length > 0) {
    children.push(heading(labels.education))
    for (const entry of data.education) {
      const period = periodLabel(entry.from, entry.to, false, "")
      children.push(
        new Paragraph({
          children: [
            text(entry.institution, { bold: true }),
            ...(period ? [text(`  —  ${period}`)] : [])
          ],
          spacing: { before: 100, after: 20 }
        })
      )
      if (entry.field.trim())
        children.push(line(entry.field, { italics: true }))
    }
  }

  if (data.skills.length > 0) {
    children.push(heading(labels.skills))
    children.push(line(data.skills.join("  ·  ")))
  }

  if (data.languages.length > 0) {
    children.push(heading(labels.languages))
    children.push(
      line(
        data.languages
          .map((entry) => [entry.name, entry.level].filter(Boolean).join(" — "))
          .join("  ·  ")
      )
    )
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAPER.width, height: PAPER.height },
            margin: {
              top: PAPER.margin,
              right: PAPER.margin,
              bottom: PAPER.margin,
              left: PAPER.margin
            }
          }
        },
        children
      }
    ]
  })

  saveBlob(await Packer.toBlob(doc), `${fileName}.docx`)
}
