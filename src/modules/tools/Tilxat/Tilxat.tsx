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
import { useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { TilxatForm, TilxatPreview } from "./components"
import { TILXAT_SCRIPTS } from "./constants"
import { useTilxat } from "./hooks/useTilxat"
import type { TilxatScript } from "./types"

/**
 * Tilxat — the loan receipt, filled in and printed.
 *
 * The document's element list comes from a bank's legal checklist and its
 * force from FK 733 (a borrower's tilxat satisfies the written form) — the
 * sources are on the page, in the FAQ. The tool's own two contributions are
 * the ones nobody else can offer cheaply: the sum written out in words by the
 * same engine the number-to-words tool ships, and the WHOLE document in
 * either script through `@webiston/transliteration` — with the passport
 * series protected, because those are printed in Latin on the physical
 * passport and must survive the script change.
 */
export function Tilxat() {
  const t = useTranslations("TilxatPage")
  const tCommon = useTranslations("Common")
  const [copied, setCopied] = useState(false)

  const {
    data,
    setParty,
    setField,
    setInterestFree,
    setWitness,
    script,
    setScript,
    segments,
    heading,
    errors,
    copy,
    print,
    downloadDocx,
    isExporting,
    loadSample,
    reset
  } = useTilxat()

  const handleCopy = async () => {
    if (!(await copy())) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* NOT the equal-height construction number-to-words uses — the
          opposite problem lives here. That form is one field; this one is
          ~1,400px of fields, so stretching the document card to match buries
          the sheet in empty height (the owner's screenshot), and by the time
          you fill the witnesses the paper is off-screen. STICKY is right on
          this page precisely because it was wrong on that one: there is a
          long scroll for the card to travel. `items-start` + `self-stretch`
          on the cell gives the sticky card its runway — QrGenerator.tsx:122
          and CodeSnapshot learned the same pairing. */}
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <ToolCard
          title={t("form.title")}
          tone="muted"
          actions={
            <div className="flex items-center gap-2">
              {/* "Tilxat namunasi" is what people search for — so the tool
                  should be able to SHOW one. Sixteen empty fields teach
                  nothing about the finished document; a worked example does,
                  and every field stays editable from there. */}
              <Button variant="outline" size="sm" onClick={loadSample}>
                <FileText className="size-4" aria-hidden="true" />
                {t("form.sample")}
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
          <TilxatForm
            data={data}
            errors={errors}
            onParty={setParty}
            onField={setField}
            onInterestFree={setInterestFree}
            onWitness={setWitness}
          />
        </ToolCard>

        <div className="min-w-0 lg:self-stretch">
          <ToolCard
            title={t("preview.title")}
            tone="primary"
            className="lg:sticky lg:top-20"
            // A full A4 sheet is taller than the viewport, and a sticky card
            // taller than the screen hides its own bottom. The sheet scrolls
            // inside the card instead of setting the page height.
            bodyClassName="flex flex-col gap-4 p-5 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto"
            actions={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <SegmentedControl
                  label={t("preview.scriptLabel")}
                  value={script}
                  onChange={(value) => setScript(value as TilxatScript)}
                  options={TILXAT_SCRIPTS.map((value) => ({
                    value,
                    label: t(`preview.scripts.${value}`)
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
                  {isExporting ? tCommon("loading") : t("preview.docx")}
                </Button>
                <Button size="sm" onClick={print}>
                  <Printer className="size-4" aria-hidden="true" />
                  {t("preview.print")}
                </Button>
              </div>
            }
          >
            <TilxatPreview segments={segments} heading={heading} />
            {/* The one legal habit the tool cannot enforce: the borrower
                signs by hand, and the safest tilxat is written by hand
                entirely. Said next to the print button that tempts
                otherwise. */}
            <p className="text-muted-foreground text-xs">{t("preview.note")}</p>
          </ToolCard>
        </div>
      </div>
    </div>
  )
}

export default Tilxat
