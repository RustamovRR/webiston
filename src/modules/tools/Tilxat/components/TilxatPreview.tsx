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
 * Everything the visitor supplied is set in BOLD — that is how a person
 * proof-reads a filled form: the eye jumps between the values and skips the
 * boilerplate. The blanks stay plain writing lines.
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
            box-shadow: none;
            border-radius: 0;
          }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>
      <div
        id="tilxat-sheet"
        className="mx-auto w-full max-w-[210mm] rounded-md p-8 shadow-md sm:p-12"
        style={{
          background: PAPER.background,
          color: PAPER.ink,
          fontFamily: PAPER.fontFamily
        }}
      >
        <p className="mb-6 text-center font-bold text-lg tracking-[0.3em]">
          {heading}
        </p>
        <div className="select-all whitespace-pre-wrap text-[15px] leading-7">
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
