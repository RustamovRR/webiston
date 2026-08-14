"use client"

import { cn } from "@webiston/ui"

import { PAPER, SHEET } from "../constants"
import type { DocumentBlock } from "../types"

interface DocumentSheetProps {
  /** The document in the chosen script. `value` segments render bold. */
  blocks: DocumentBlock[]
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
export function DocumentSheet({ blocks }: DocumentSheetProps) {
  return (
    <>
      <style>{`
        @media print {
          /*
           * Two mutually exclusive paths, because the good one needs \`:has()\`
           * and a document tool may never print a BLANK page: without the
           * guard, a browser that drops the invalid \`:has()\` rule would still
           * apply the \`display: none\` hammer and print nothing at all.
           */
          @supports selector(:has(*)) {
            /* Hide the page by REMOVING its boxes, then bring back only the
               sheet and the chain of ancestors that contains it.
               \`display\`, not \`visibility\`: a hidden box still occupies space,
               and that space was generating page after page of blankness.
               \`:has()\` is what reaches the ancestor chain without the sheet
               having to be a direct child of <body>. */
            body.document-print * { display: none !important; }
            body.document-print :has(#document-sheet) {
              display: block !important;
              /* The preview card scrolls inside itself on screen. Left alone,
                 that clips the printout to one card's worth of document. */
              max-height: none !important;
              overflow: visible !important;
              position: static !important;
              margin: 0 !important;
              padding: 0 !important;
              width: auto !important;
              max-width: none !important;
              border: 0 !important;
              background: none !important;
            }
            body.document-print #document-sheet { display: block !important; }
            body.document-print #document-sheet * { display: revert !important; }
            body.document-print #document-sheet {
              /* NORMAL FLOW — never \`position: fixed\`. A fixed box is painted
                 on EVERY printed page and cannot paginate: measured with
                 Chrome --print-to-pdf, a one-page document came out as 6
                 identical pages, and a long one was split and repeated
                 instead of continuing onto page 2. In flow: 1 page, and 4
                 correctly paginated ones for the long document. */
              margin: 0 !important;
              width: auto !important;
              max-width: none !important;
              /* @page owns the margin; screen padding would double it — and
                 @page's margin is what gives EVERY page its edge, which
                 element padding could only give the first and the last. */
              padding: 0 !important;
              min-height: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
          }

          @supports not selector(:has(*)) {
            /* The old path, kept only as a floor: the sheet is painted over a
               hidden page, so it repeats on every sheet of a multi-page
               document. Wrong, but readable — and never blank. */
            body.document-print * { visibility: hidden; }
            body.document-print #document-sheet,
            body.document-print #document-sheet * { visibility: visible; }
            body.document-print #document-sheet {
              position: fixed;
              inset: 0;
              width: 100%;
              max-width: none;
              padding: 0;
              min-height: 0;
              box-shadow: none;
              border-radius: 0;
            }
          }

          body.document-print #document-sheet {
            font-size: 12pt;
            line-height: 1.8;
          }
          /* The bold is a PREVIEW aid — it is how a person proof-reads the
             form they just filled. On paper it is wrong: an Uzbek official
             document sets its whole body in one weight, and bolding only the
             filled-in parts announces "this came out of a generator". */
          body.document-print #document-sheet strong { font-weight: 400 !important; }
          /* 20mm on every page. The browser draws its own date/URL header
             INTO this band, and the only CSS lever that would suppress it is
             \`margin: 0\` — which would leave the middle pages of a multi-page
             document with no margin at all, inside the printer's unprintable
             area. Correct paper beats cosmetics the reader can switch off in
             one click ("Headers and footers" in the print dialog); the .docx
             export never had them. */
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
        <div className="select-all text-[16px] leading-[1.85]">
          {blocks.map((entry, blockIndex) => (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a
              // derived, order-stable projection of one immutable composition;
              // there is no identity to key on beyond position.
              key={blockIndex}
              className={cn(
                "whitespace-pre-wrap",
                entry.heading
                  ? "text-center font-bold text-xl leading-tight tracking-[0.35em]"
                  : ALIGNMENT[entry.align ?? "left"]
              )}
              // Geometry as inline style, never as utility classes — see
              // `SHEET`. A paragraph's indent and a column's offset are paper
              // measurements, and they have to hold whether or not a class
              // that appears in one file made it into the generated CSS.
              style={{
                marginBottom: entry.heading
                  ? SHEET.headingGapAfter
                  : entry.indent
                    ? SHEET.indentedGap
                    : SHEET.paragraphGap,
                ...(entry.heading && blockIndex > 0
                  ? { marginTop: SHEET.headingGapBefore }
                  : {}),
                ...(entry.indent ? { textIndent: SHEET.firstLineIndent } : {}),
                ...(entry.width === "half"
                  ? { paddingLeft: SHEET.columnOffset }
                  : {})
              }}
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
