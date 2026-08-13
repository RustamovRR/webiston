"use client"

import { PAPER } from "../constants"
import type { TilxatSegment } from "../utils/document"

interface TilxatPreviewProps {
  /** The document in the chosen script. `value` segments render bold. */
  segments: TilxatSegment[]
  /** "TILXAT" or "ТИЛХАТ" — the centred heading above the prose. */
  heading: string
}

/**
 * The sheet. What you see is what the printer produces.
 *
 * Deliberately NOT tokened: a tilxat is paper, not interface. It must look
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
export function TilxatPreview({ segments, heading }: TilxatPreviewProps) {
  return (
    <>
      <style>{`
        @media print {
          body.tilxat-print * { visibility: hidden; }
          body.tilxat-print #tilxat-sheet,
          body.tilxat-print #tilxat-sheet * { visibility: visible; }
          body.tilxat-print #tilxat-sheet {
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
          body.tilxat-print #tilxat-sheet strong { font-weight: 400; }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>
      {/* Real page geometry rather than a card that happens to be white:
          210mm wide, A4-tall from `lg` up (where the column is wide enough for
          the proportion to read), and padding in the millimetres a document
          actually uses — 20mm sides, 22mm head. */}
      <div
        id="tilxat-sheet"
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
        <div className="select-all whitespace-pre-wrap text-justify text-[16px] leading-[1.85]">
          {segments.map((segment, index) =>
            segment.kind === "value" ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: segments are a
              // derived, order-stable projection of one immutable composition;
              // there is no identity to key on beyond position.
              <strong key={index} className="font-bold">
                {segment.text}
              </strong>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: same projection.
              <span key={index}>{segment.text}</span>
            )
          )}
        </div>
      </div>
    </>
  )
}
