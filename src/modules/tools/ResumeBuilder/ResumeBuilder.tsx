"use client"

import { cn } from "@webiston/ui"
import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Download, FileText, Printer, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"
import { printWithTitle } from "@/lib/utils"

import { DesignFields } from "./components/DesignFields"
import { HistoryFields } from "./components/HistoryFields"
import { IdentityFields } from "./components/IdentityFields"
import { ResumeSheet } from "./components/ResumeSheet"
import { useResume } from "./hooks/useResume"
import { sheetLabels, viewOf } from "./utils/script"

/** Which pane a narrow screen is showing. Ephemeral: not worth persisting. */
type Pane = "form" | "preview"

/**
 * The resume builder.
 *
 * Same shell shape as the document family — form left, live A4 right, sticky
 * with its own scroll — because that layout was measured and fixed there and
 * this form is even longer. What is NOT shared is the data model: a resume is
 * repeating sections the visitor reorders, not prose composed from segments,
 * so this is its own module rather than a Documents template.
 *
 * BELOW `lg` that shell stops being a shell: the two cards stack, and the form
 * is 3,372px tall at 375px, so the paper started 3,723px down the page —
 * ~2,635px of scrolling before a single millimetre of it was visible. The
 * earlier answer to "should this be a modal?" was no, because the live preview
 * IS the product; that is true on a desktop and false on a phone, where the
 * product had no preview at all. Hence a pane switch under `lg` only — a
 * switch, not a modal, because a modal would still hide the form the moment
 * you looked at the result.
 *
 * The panes are HIDDEN, never unmounted. The sheet keeps its layout work, the
 * draft keeps its state, and — the part that would have been a silent bug —
 * the print stylesheet can still find `#resume-sheet` from the form pane,
 * because `:has(#resume-sheet)` sets `display: block !important` on every
 * ancestor and beats a `hidden` class that carries no `!important`.
 */
export function ResumeBuilder() {
  const t = useTranslations("ResumePage")
  const tCommon = useTranslations("Common")
  const resume = useResume()

  const [isExporting, setExporting] = useState(false)
  const [pane, setPane] = useState<Pane>("form")

  const switchPane = useCallback((next: Pane) => {
    setPane(next)
    // The two panes differ by thousands of pixels, so without this the browser
    // clamps the old offset and drops you into the middle of the new pane —
    // measured: switching at 1,540px left the paper's top 1,132px ABOVE the
    // viewport. Scrolling the window, not the strip: the strip is `sticky`, so
    // it is by definition already in view and `scrollIntoView` on it is a
    // no-op. Top of page is also what every tab control does.
    window.scrollTo({ top: 0 })
  }, [])

  /** Print the sheet alone; the PDF saves as `rezyume.pdf`. */
  const print = useCallback(() => printWithTitle("resume-print", "rezyume"), [])

  /**
   * The .docx, loaded on the click. hh.uz and most local employers ask for a
   * Word file, and unlike the PDF it can be edited and re-uploaded.
   */
  const downloadDocx = useCallback(async () => {
    setExporting(true)
    try {
      const { downloadResumeDocx } = await import("./utils/docx")
      // `viewOf`, not `resume.data`. The headings went through `sheetLabels`,
      // which DOES convert — so a Cyrillic document downloaded with Cyrillic
      // headings over Latin content. Half-converted is worse than either, and
      // the script toggle is the one thing no competitor has.
      await downloadResumeDocx(
        viewOf(resume.data),
        sheetLabels(resume.data),
        "rezyume"
      )
    } catch (error) {
      console.error("DOCX export failed:", error)
    } finally {
      setExporting(false)
    }
  }, [resume.data])

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 pb-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* Sticky under the site header — a switch you can only reach by
          scrolling 3,000px back up is not a switch — and gone entirely at `lg`,
          where both panes are on screen at once. `top` reads the same
          `--header-height` the header itself uses: two hardcoded 4rems in two
          files is precisely the pair that drifts. */}
      <div className="sticky top-(--header-height) z-30 -mx-4 border-border/60 border-b bg-background/85 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
        <SegmentedControl<Pane>
          label={t("pane")}
          value={pane}
          onChange={switchPane}
          options={[
            { value: "form", label: t("form.title") },
            { value: "preview", label: t("preview.title") }
          ]}
        />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:mt-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <ToolCard
          className={cn(pane === "form" ? "block" : "hidden", "lg:block")}
          title={t("form.title")}
          tone="muted"
          // No wrapper div: `ToolCard` already lays the actions out in a
          // wrapping row, and a nested flex box here would be one more
          // unshrinkable item for a 320px header to fail on.
          actions={
            <>
              <Button variant="outline" size="sm" onClick={resume.loadSample}>
                <FileText className="size-4" aria-hidden="true" />
                {t("form.sample")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resume.reset}
                aria-label={tCommon("clear")}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <DesignFields data={resume.data} set={resume.set} />
            <IdentityFields
              data={resume.data}
              set={resume.set}
              setNested={resume.setNested}
            />
            <HistoryFields
              data={resume.data}
              set={resume.set}
              setRow={resume.setRow}
              addRow={resume.addRow}
              removeRow={resume.removeRow}
              moveRow={resume.moveRow}
            />
            {/* Said next to the form, not buried in a FAQ: the draft IS
                stored, and the visitor deserves to know where. */}
            <p className="text-muted-foreground text-xs">{t("form.storage")}</p>
          </div>
        </ToolCard>

        <div
          className={cn(
            "min-w-0",
            pane === "preview" ? "block" : "hidden",
            "lg:block lg:self-stretch"
          )}
        >
          <ToolCard
            title={t("preview.title")}
            tone="primary"
            className="lg:sticky lg:top-20"
            bodyClassName="flex flex-col gap-4 p-5 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto"
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadDocx}
                  disabled={isExporting}
                >
                  <Download className="size-4" aria-hidden="true" />
                  {isExporting ? tCommon("loading") : t("preview.docx")}
                </Button>
                <Button size="sm" onClick={print}>
                  <Printer className="size-4" aria-hidden="true" />
                  {t("preview.print")}
                </Button>
              </>
            }
          >
            <ResumeSheet data={resume.data} />
          </ToolCard>
        </div>
      </div>
    </div>
  )
}
