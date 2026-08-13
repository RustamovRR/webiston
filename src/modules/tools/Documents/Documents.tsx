"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import {
  Check,
  Copy,
  Download,
  FileText,
  Printer,
  RotateCcw
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { DocumentSheet } from "./components/DocumentSheet"
import { DOCUMENT_SCRIPTS } from "./constants"
import { useDocument } from "./hooks/useDocument"
import type { DocumentScript, DocumentTemplate } from "./types"

/**
 * The shell every document on this site is filled in through.
 *
 * It owns the paper, the two scripts, copy, print, the .docx export, the
 * sample and the layout. A TEMPLATE owns its data and its prose — the honest
 * line, because a tilxat and an ariza share no field but the date. What is
 * deliberately NOT here is a generic field-schema engine: it would produce a
 * worse form for each document and an abstraction nobody could read.
 *
 * Generic over the template's data, so each route passes a concrete template
 * and `TData` is inferred end to end — no `any`, no casting at the seam.
 */
export function Documents<TData>({
  template,
  children
}: {
  template: DocumentTemplate<TData>
  /**
   * Server-rendered content between the header and the form — the template
   * switcher. Passed as CHILDREN rather than imported: a Server Component
   * cannot be rendered from inside a client module, but it can be handed in
   * as already-rendered output, which is what keeps the switcher off the
   * client bundle while letting it sit where it reads best.
   */
  children?: ReactNode
}) {
  const t = useTranslations(template.namespace)
  const tShared = useTranslations("DocumentsShared")
  const tCommon = useTranslations("Common")
  const [copied, setCopied] = useState(false)

  const {
    data,
    update,
    script,
    setScript,
    blocks,
    heading,
    errors,
    copy,
    print,
    downloadDocx,
    isExporting,
    loadSample,
    reset
  } = useDocument(template)

  const handleCopy = async () => {
    if (!(await copy())) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const { Fields } = template

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 pb-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {children}

      {/* NOT the equal-height construction number-to-words uses — the
          opposite problem lives here. That form is one field; these are
          ~1,400px of fields, so stretching the document card to match buries
          the sheet in empty height, and by the time you reach the witnesses
          the paper is off-screen. STICKY is right on this page precisely
          because it was wrong on that one: there is a long scroll for the card
          to travel. `items-start` + `self-stretch` on the cell gives the
          sticky card its runway — QrGenerator.tsx:122 learned the same pair. */}
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <ToolCard
          title={tShared("form.title")}
          tone="muted"
          actions={
            <div className="flex items-center gap-2">
              {/* "<document> namunasi" is what people search for — so the tool
                  should be able to SHOW one. A screen of empty fields teaches
                  nothing about the finished document; a worked example does,
                  and every field stays editable from there. */}
              <Button variant="outline" size="sm" onClick={loadSample}>
                <FileText className="size-4" aria-hidden="true" />
                {tShared("form.sample")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                aria-label={tCommon("clear")}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </Button>
            </div>
          }
        >
          <Fields data={data} errors={errors} update={update} />
        </ToolCard>

        <div className="min-w-0 lg:self-stretch">
          <ToolCard
            title={tShared("preview.title")}
            tone="primary"
            className="lg:sticky lg:top-20"
            // A full A4 sheet is taller than the viewport, and a sticky card
            // taller than the screen hides its own bottom. The sheet scrolls
            // inside the card instead of setting the page height.
            bodyClassName="flex flex-col gap-4 p-5 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto"
            actions={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <SegmentedControl
                  label={tShared("preview.scriptLabel")}
                  value={script}
                  onChange={(value) => setScript(value as DocumentScript)}
                  options={DOCUMENT_SCRIPTS.map((value) => ({
                    value,
                    label: tShared(`preview.scripts.${value}`)
                  }))}
                />
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  {copied ? tCommon("copied") : tCommon("copy")}
                </Button>
                {/* Printing serves the person who signs on the spot. Everyone
                    else mails it or hands it to an accountant, and .docx is
                    what that person opens. The library is a dynamic import,
                    so only this click pays for it. */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadDocx}
                  disabled={isExporting}
                >
                  <Download className="size-4" aria-hidden="true" />
                  {isExporting ? tCommon("loading") : tShared("preview.docx")}
                </Button>
                <Button size="sm" onClick={print}>
                  <Printer className="size-4" aria-hidden="true" />
                  {tShared("preview.print")}
                </Button>
              </div>
            }
          >
            <DocumentSheet blocks={blocks} heading={heading} />
            {/* The one habit no generator can enforce: the document is signed
                by hand. Said next to the print button that tempts otherwise. */}
            <p className="text-muted-foreground text-xs">{t("preview.note")}</p>
          </ToolCard>
        </div>
      </div>
    </div>
  )
}
