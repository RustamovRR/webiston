"use client"

import { cn } from "@webiston/ui"

import { PAPER } from "../constants"
import type { DocumentBlock } from "../types"

interface DocumentSheetProps {
  /** The document in the chosen script. `value` segments render bold. */
  blocks: DocumentBlock[]
  /** The centred heading above the prose — "TILXAT", "ARIZA", … */
  heading: string
}

/**
 * Justified is the default because that is how an Uzbek official document is
 * set; an ariza's "kimga / kimdan" header is the one block that is not.
 */
const ALIGNMENT = {
  left: "text-justify",
  center: "text-center",
  right: "text-right"
} as const

/**
 * The sheet. What you see is what the printer produces.
 *
 * Deliberately NOT tokened: a document is paper, not interface. It must look
 * identical in light and dark mode and identical to the printout, so the
 * colours come from the named `PAPER` constants — the same document-content
 * exception as the code-snapshot canvas (`code-rules.md` §11).
 *
 * Everything the visitor supplied is set in BOLD **on screen only** — that is
 * how a person proof-reads a filled form: the eye jumps between the values and
 * skips the boilerplate. The printed sheet drops it (see the stylesheet),
 * because paper wants one weight. The blanks stay plain writing lines.
 *
 * The print path is a body class plus the stylesheet below: everything on the
 * page turns invisible except this sheet, which takes over the printable
 * area. `visibility`, not `display` — hiding an ancestor with `display: none`
 * would take the sheet down with it.
 */
export function DocumentSheet({ blocks, heading }: DocumentSheetProps) {
  return (
    <>
      <style>{`
        @media print {
          body.document-print * { visibility: hidden; }
          body.document-print #document-sheet,
          body.document-print #document-sheet * { visibility: visible; }
          body.document-print #document-sheet {
            position: fixed;
            inset: 0;
            width: 100%;
            max-width: none;
            /* @page owns the margin; the screen padding would double it. */
            padding: 0;
            min-height: 0;
            box-shadow: none;
            border-radius: 0;
            font-size: 12pt;
            line-height: 1.8;
          }
          /* The bold is a PREVIEW aid — it is how a person proof-reads the
             form they just filled. On paper it is wrong: an Uzbek official
             document sets its whole body in one weight, and bolding only the
             filled-in parts announces "this came out of a generator". */
          body.document-print #document-sheet strong { font-weight: 400; }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>
      {/* Real page geometry rather than a card that happens to be white:
          210mm wide, A4-tall from `lg` up (where the column is wide enough for
          the proportion to read), and padding in the millimetres a document
          actually uses — 20mm sides, 22mm head. */}
      <div
        id="document-sheet"
        className="mx-auto w-full max-w-[210mm] rounded-md p-[12mm] shadow-md sm:p-[16mm] lg:min-h-[297mm] lg:px-[20mm] lg:py-[22mm]"
        style={{
          background: PAPER.background,
          color: PAPER.ink,
          fontFamily: PAPER.fontFamily
        }}
      >
        <p className="mb-12 text-center font-bold text-xl tracking-[0.35em]">
          {heading}
        </p>
        <div className="select-all text-[16px] leading-[1.85]">
          {blocks.map((entry, blockIndex) => (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a
              // derived, order-stable projection of one immutable composition;
              // there is no identity to key on beyond position.
              key={blockIndex}
              className={cn(
                "mb-5 whitespace-pre-wrap last:mb-0",
                ALIGNMENT[entry.align ?? "left"]
              )}
            >
              {entry.segments.map((segment, index) =>
                segment.kind === "value" ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: same projection.
                  <strong key={index} className="font-bold">
                    {segment.text}
                  </strong>
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: same projection.
                  <span key={index}>{segment.text}</span>
                )
              )}
            </p>
          ))}
        </div>
      </div>
    </>
  )
}
