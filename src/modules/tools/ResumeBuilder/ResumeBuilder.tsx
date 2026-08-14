"use client"

import { Button } from "@webiston/ui/primitives/button"
import { FileText, Printer, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { HistoryFields } from "./components/HistoryFields"
import { IdentityFields } from "./components/IdentityFields"
import { ResumeSheet } from "./components/ResumeSheet"
import { useResume } from "./hooks/useResume"

/**
 * The resume builder.
 *
 * Same shell shape as the document family — form left, live A4 right, sticky
 * with its own scroll — because that layout was measured and fixed there and
 * this form is even longer. What is NOT shared is the data model: a resume is
 * repeating sections the visitor reorders, not prose composed from segments,
 * so this is its own module rather than a Documents template.
 */
export function ResumeBuilder() {
  const t = useTranslations("ResumePage")
  const tCommon = useTranslations("Common")
  const resume = useResume()

  /**
   * Print through the page, scoped by a body class — and swap the title
   * first, because the browser prints `document.title` in its header band and
   * offers it as the "Save as PDF" filename. The document family learned this
   * the expensive way; here the payoff is a file called `rezyume.pdf`.
   */
  const print = useCallback(() => {
    const pageTitle = document.title
    document.title = "rezyume"
    document.body.classList.add("resume-print")
    window.addEventListener(
      "afterprint",
      () => {
        document.body.classList.remove("resume-print")
        document.title = pageTitle
      },
      { once: true }
    )
    window.print()
  }, [])

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 pb-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <ToolCard
          title={t("form.title")}
          tone="muted"
          actions={
            <div className="flex items-center gap-2">
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
            </div>
          }
        >
          <div className="flex flex-col gap-5">
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

        <div className="min-w-0 lg:self-stretch">
          <ToolCard
            title={t("preview.title")}
            tone="primary"
            className="lg:sticky lg:top-20"
            bodyClassName="flex flex-col gap-4 p-5 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto"
            actions={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button size="sm" onClick={print}>
                  <Printer className="size-4" aria-hidden="true" />
                  {t("preview.print")}
                </Button>
              </div>
            }
          >
            <ResumeSheet data={resume.data} />
          </ToolCard>
        </div>
      </div>
    </div>
  )
}
