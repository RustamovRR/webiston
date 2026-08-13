import { saveBlob } from "@/lib/utils"

import { PAPER_DOCX } from "../constants"
import type { TilxatSegment } from "./document"

/**
 * The tilxat as a .docx — the format an Uzbek office actually accepts.
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
export async function downloadTilxatDocx(
  segments: TilxatSegment[],
  heading: string,
  fileName: string
): Promise<void> {
  const { AlignmentType, Document, Packer, Paragraph, TextRun } = await import(
    "docx"
  )

  const body = segments.map((segment) => segment.text).join("")

  const paragraph = (text: string, centred = false) =>
    new Paragraph({
      alignment: centred ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { after: PAPER_DOCX.paragraphGap, line: PAPER_DOCX.lineHeight },
      children: [
        new TextRun({
          text,
          bold: centred,
          font: PAPER_DOCX.font,
          size: PAPER_DOCX.fontHalfPoints,
          // Word does not letter-space by default; the heading is spaced the
          // way the printed sheet spaces it.
          characterSpacing: centred ? PAPER_DOCX.headingTracking : undefined
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
        children: [
          paragraph(heading, true),
          // The composed document carries its own blank lines as "\n\n".
          // Empty lines become paragraph SPACING, not empty paragraphs, or
          // Word shows a gap twice the size of the one on screen.
          ...body
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => paragraph(line))
        ]
      }
    ]
  })

  saveBlob(await Packer.toBlob(doc), `${fileName}.docx`)
}
