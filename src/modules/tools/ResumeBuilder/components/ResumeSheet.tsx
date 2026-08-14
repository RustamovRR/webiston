"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { RESUME_PAPER } from "../constants"
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
          /* A CV wants more of the page than a legal document does: 15mm,
             and the browser's own header/footer band lives in it. */
          @page { size: A4; margin: 15mm; }
        }
      `}</style>

      {/* Zamonaviy's sidebar has to reach the paper's edges, so the PADDING
          belongs to the template, not the sheet. Klassik keeps it here. */}
      <div
        id="resume-sheet"
        className={cn(
          "mx-auto w-full max-w-[210mm] overflow-hidden rounded-md shadow-md lg:min-h-[297mm]",
          data.template === "klassik" && "p-[10mm] sm:p-[14mm] lg:p-[15mm]"
        )}
        style={{
          background: RESUME_PAPER.background,
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
    </>
  )
}
