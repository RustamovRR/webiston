"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { PAGE_GUIDE, RESUME_PAPER } from "../constants"
import type { ResumeData } from "../types"
import { isBlank } from "../utils/format"
import { sheetLabels, viewOf } from "../utils/script"
import { KlassikTemplate } from "./KlassikTemplate"
import { ZamonaviyTemplate } from "./ZamonaviyTemplate"

/**
 * The A4 sheet. What you see is what the printer and the .docx produce.
 *
 * Same PAPER exception as the Documents family (`code-rules.md` §11): a CV is
 * paper, not interface, so its colours come from named constants and do NOT
 * flip with the site theme — a resume that inverts in dark mode is a resume
 * that prints wrong.
 *
 * The print stylesheet carries the lesson the document family paid for: hide
 * by REMOVING boxes (`display`), never by `visibility` over a `position:
 * fixed` sheet — that painted the page on top of a full-height hidden
 * document and produced six identical pages. `:has()` reaches the ancestor
 * chain, and the whole thing is guarded by `@supports` so a browser without
 * it prints something rather than nothing.
 */
export function ResumeSheet({ data }: { data: ResumeData }) {
  const t = useTranslations("ResumePage.sheet")

  // The script is a LENS: the draft keeps what was typed, and Cyrillic is
  // derived at render, so toggling back and forth can never corrupt anything.
  const view = viewOf(data)
  const labels = sheetLabels(data)

  return (
    <>
      <style>{`
        @media print {
          @supports selector(:has(*)) {
            body.resume-print * { display: none !important; }
            body.resume-print :has(#resume-sheet) {
              display: block !important;
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
            body.resume-print #resume-sheet { display: block !important; }
            body.resume-print #resume-sheet * { display: revert !important; }
            body.resume-print #resume-sheet {
              margin: 0 !important;
              width: auto !important;
              max-width: none !important;
              padding: 0 !important;
              min-height: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            /* Lists lose their marker under \`display: revert\` on the <ul>;
               restore the one thing the CV actually needs back. */
            body.resume-print #resume-sheet ul { list-style: disc !important; }
            /* The page-break guide is a PREVIEW aid. On paper the page
               genuinely ends there, so a printed hairline would be a lie. */
            body.resume-print #resume-sheet { background-image: none !important; }
          }
          @supports not selector(:has(*)) {
            body.resume-print * { visibility: hidden; }
            body.resume-print #resume-sheet,
            body.resume-print #resume-sheet * { visibility: visible; }
            body.resume-print #resume-sheet {
              position: fixed;
              inset: 0;
              width: 100%;
              max-width: none;
              padding: 0;
              min-height: 0;
              box-shadow: none;
            }
          }
          /* Where the printer is allowed to cut, and where it is not.
             Outside the @supports blocks on purpose — both paths need it.
             A CV that spills onto two pages is normal; a job title stranded
             at the foot of page one with its bullets on page two is not, and
             it is the single thing that makes a printout look amateur. */
          #resume-sheet article,
          #resume-sheet li { break-inside: avoid; }
          #resume-sheet h2,
          #resume-sheet h3 { break-after: avoid; }

          /* A CV wants more of the page than a legal document does: 15mm,
             and the browser's own header/footer band lives in it. */
          @page { size: A4; margin: 15mm; }
        }

        /* The paper is a SCALE MODEL on a narrow screen, not a reflow.
           Measured before this: at 375px the sheet was 301px wide with 15px
           text, so a job title and its date range could not share a line and
           the row broke out of the paper by 20px — on the SAMPLE, not on
           pathological input. At 320px it was 75px. Reflowing an A4 preview
           defeats the preview: what you are checking is whether it fits on a
           page, and a 246px-wide "page" answers a different question.
           So the sheet keeps its true 210mm and the whole thing is zoomed to
           the card. Zoom and not transform:scale() because zoom takes part in
           layout — a transform would leave the sheet's full unscaled height
           reserved underneath it. (No backticks in here: this whole block is
           a template literal, and one closed it.)
           Screen only: print must never be scaled. And behind @supports, so a
           browser without zoom or container units keeps today's fluid sheet
           rather than a 794px box overflowing a 340px card. */
        @media screen {
          @supports (zoom: min(1, calc(100cqw / 210mm))) {
            #resume-sheet {
              width: 210mm;
              max-width: none;
              zoom: min(1, calc(100cqw / 210mm));
            }
          }
        }
      `}</style>

      {/* The measuring box for the zoom above: `100cqw` is this element's
          width, so the sheet scales to whatever the card gives it. It also
          takes over `shrink-0` — it is the flex item now. */}
      <div className="@container w-full shrink-0">
        {/* Zamonaviy's sidebar has to reach the paper's edges, so the PADDING
            belongs to the template, not the sheet. Klassik keeps it here. */}
        <div
          id="resume-sheet"
          className={cn(
            // NO `overflow-hidden`. It was added to clip Zamonaviy's sidebar to
            // the rounded corner and it silently CUT the document instead: a
            // long summary simply vanished below the fold while the printout
            // showed two pages. The sheet grows with its content and the card
            // around it scrolls — what you see is what prints.
            //
            // `shrink-0` is load-bearing and cost a second round of the same
            // bug. This is a flex item in the preview card's scrolling column,
            // and an explicit `min-height` REPLACES the automatic `min-height:
            // auto` that normally stops a flex item shrinking below its content.
            // So the sheet obediently shrank to exactly 297mm while its content
            // measured 1,288px + padding, and everything past the fold rendered
            // OUTSIDE the white paper, dark text on the dark card.
            // `min-h-[297mm]` at EVERY width now, not `lg:` only. It used to be
            // desktop-only because an unscaled 297mm box on a phone is an
            // enormous empty rectangle; with the zoom above it is ~426px at
            // 375px wide, so the preview can finally show a whole PAGE on a
            // phone — which is the question a CV builder exists to answer.
            "relative mx-auto min-h-[297mm] w-full max-w-[210mm] rounded-md shadow-md",
            // Klassik owns its margins here; Zamonaviy's sidebar has to reach
            // the paper's edges, so it takes the sheet as a flex column instead
            // and stretches the tint the full height even on a half-empty page.
            data.template === "zamonaviy"
              ? "flex flex-col"
              : "p-[10mm] sm:p-[14mm] lg:p-[15mm]"
          )}
          style={{
            background: RESUME_PAPER.background,
            // Where the printer will cut. A CV that spills onto a second page
            // is a real decision the visitor has to make, and every competitor
            // hides it until the print dialog. Repeating gradient: a hairline
            // every 297mm, drawn behind the text and hidden when printing —
            // the paper itself already ends there.
            backgroundImage: PAGE_GUIDE,
            backgroundSize: "100% 297mm",
            color: RESUME_PAPER.ink,
            fontFamily:
              data.template === "klassik"
                ? RESUME_PAPER.serifFamily
                : RESUME_PAPER.sansFamily
          }}
        >
          {isBlank(data) ? (
            // An A4 page of placeholder text teaches nothing. One line does.
            <p className="p-[15mm] py-16 text-center text-[15px] italic opacity-50">
              {t("empty")}
            </p>
          ) : data.template === "zamonaviy" ? (
            <ZamonaviyTemplate data={view} labels={labels} />
          ) : (
            <KlassikTemplate data={view} labels={labels} />
          )}
        </div>
      </div>
    </>
  )
}
