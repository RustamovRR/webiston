import { saveBlob } from "@/lib/utils"

import { PAPER_DOCX } from "../constants"
import type { DocumentBlock } from "../types"
import { blockText } from "./segments"

/**
 * The document as a .docx — the format an Uzbek office actually accepts.
 *
 * Printing covers the person who signs on the spot. Everyone else needs to
 * mail it, keep it, or hand it to an accountant who will re-type it into
 * something, and `.docx` is what that person opens. The library is loaded
 * DYNAMICALLY, the way `LatinCyrillic` loads it: `docx` is ~500 kB and nobody
 * who only prints should pay for it.
 *
 * Same geometry as the on-screen sheet and the printout — A4, 20mm margins,
 * Times 12pt — so all three are the same document rather than three
 * approximations of it. And the same weight rule: values are NOT bold here.
 * The bold on screen is a proof-reading aid; a .docx is the finished paper,
 * and bolding only the filled-in parts marks it as generated.
 */
export async function downloadDocumentDocx(
  blocks: DocumentBlock[],
  fileName: string
): Promise<void> {
  const { AlignmentType, Document, Packer, Paragraph, TextRun } = await import(
    "docx"
  )

  const alignment = {
    left: AlignmentType.JUSTIFIED,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT
  } as const

  const paragraph = (
    text: string,
    align: keyof typeof alignment,
    {
      indent = false,
      isHeading = false,
      halfWidth = false,
      spaceBefore = false
    } = {}
  ) =>
    new Paragraph({
      alignment: alignment[align],
      spacing: {
        after: PAPER_DOCX.paragraphGap,
        line: PAPER_DOCX.lineHeight,
        ...(isHeading ? { after: PAPER_DOCX.headingGap } : {}),
        ...(spaceBefore ? { before: PAPER_DOCX.headingGap } : {})
      },
      // Word's own indents, so the .docx opens with the abzas — and the
      // addressee column — already applied rather than the reader doing it by
      // hand. The two never combine: prose is never in the column.
      ...(indent
        ? { indent: { firstLine: PAPER_DOCX.firstLineIndent } }
        : halfWidth
          ? { indent: { left: PAPER_DOCX.headerColumnIndent } }
          : {}),
      children: [
        new TextRun({
          text,
          bold: isHeading,
          font: PAPER_DOCX.font,
          size: PAPER_DOCX.fontHalfPoints,
          // Word does not letter-space by default; the heading is spaced the
          // way the printed sheet spaces it.
          characterSpacing: isHeading ? PAPER_DOCX.headingTracking : undefined
        })
      ]
    })

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAPER_DOCX.width, height: PAPER_DOCX.height },
            margin: {
              top: PAPER_DOCX.marginTop,
              right: PAPER_DOCX.margin,
              bottom: PAPER_DOCX.margin,
              left: PAPER_DOCX.margin
            }
          }
        },
        // One Word paragraph per line, so a multi-line block (the witness
        // list) keeps its line breaks and its alignment.
        children: blocks.flatMap((entry, index) =>
          blockText(entry)
            .split("\n")
            .map((line) =>
              paragraph(
                line,
                entry.heading ? "center" : (entry.align ?? "left"),
                {
                  indent: Boolean(entry.indent),
                  halfWidth: entry.width === "half",
                  isHeading: Boolean(entry.heading),
                  spaceBefore: Boolean(entry.heading) && index > 0
                }
              )
            )
        )
      }
    ]
  })

  saveBlob(await Packer.toBlob(doc), `${fileName}.docx`)
}
